import express from "express"
import { createServer } from "http"
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import cors from "cors"
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes.js'
import { updateUserOnlineStatus } from './models/user.model.js'
import { createMessage , editMessage, deleteMessage } from './models/message.model.js'
import { createReport } from './models/report.model.js'
import messageRoutes from './routes/message.routes.js'
import groupRoutes from './routes/group.routes.js'
import { getGroupMembers } from './models/group.model.js'
import conversationRoutes from './routes/conversation.routes.js'
import { createGroupMessage } from './models/message.model.js'
import uploadRoutes from './routes/upload.routes.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

import { connectDB } from './config/db.js'

const app = express()
const httpServer = createServer(app)

const onlineUsers = new Map()

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
})

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token

    if (!token) {
      return next(new Error('Unauthorized'))
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    socket.userId = decoded.userId
    next()
  } catch (error) {
    next(new Error('Unauthorized'))
  }
})

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/api/upload', uploadRoutes)
app.use('/api/conversations', conversationRoutes)

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Chat app server is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/groups', groupRoutes)

io.on('connection', async (socket) => {
  const userId = socket.userId

  console.log('User connected:', userId)

  // Multi-tab safe storage
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set())
  }

  onlineUsers.get(userId).add(socket.id)

  // Update DB only if first connection
  if (onlineUsers.get(userId).size === 1) {
    try {
      if (onlineUsers.get(userId).size === 1) {
        await updateUserOnlineStatus(userId, true)
      }
    } catch (err) {
      console.error('DB error:', err.message)
    }
  }

  io.emit('online_users', Array.from(onlineUsers.keys()))
   
  socket.on('join_groups', async () => {
    try {
        const userId = socket.userId

        // Get groups where user is member
        const pool = getPool()
        const result = await pool.query(
        `SELECT group_id FROM group_members WHERE user_id = $1`,
        [userId]
        )

        const groups = result.rows

        groups.forEach(({ group_id }) => {
        socket.join(group_id)
        })

        console.log(`User ${userId} joined ${groups.length} groups`)

    } catch (error) {
        console.error('Join groups error:', error.message)
    }
  })

  socket.on('send_group_message', async ({ groupId, content }) => {
    try {
        const senderId = socket.userId

        // Save to DB
        const message = await createGroupMessage({
        sender_id: senderId,
        group_id: groupId,
        content,
        })

        // Emit to all in group
        io.to(groupId).emit('receive_group_message', message)

    } catch (error) {
        console.error('Group message error:', error.message)
    }
  })

  socket.on('send_message', async ({ receiverId, content }) => {
    try {
        const senderId = socket.userId

        // Save message to DB
        const message = await createMessage({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        })

        // Send to receiver if online
        const receiverSockets = onlineUsers.get(receiverId)

        if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
            io.to(socketId).emit('receive_message', message)
        })
        }

        // Also send back to sender (for UI update)
        socket.emit('receive_message', message)

    } catch (error) {
        console.error('Send message error:', error.message)
    }
  })
  
  socket.on('send_images', async ({ receiverId, imageUrls }) => {
    try {
      const senderId = socket.userId

      for (const url of imageUrls) {
        const message = await createMessage({
          sender_id: senderId,
          receiver_id: receiverId,
          content: url,
          message_type: 'image',
        })

        // send to receiver
        const receiverSockets = onlineUsers.get(receiverId)
        if (receiverSockets) {
          receiverSockets.forEach((id) => {
            io.to(id).emit('receive_message', message)
          })
        }

        // send to sender
        socket.emit('receive_message', message)
      }

    } catch (error) {
      console.error('Send images error:', error.message)
    }
  })

  socket.on('send_group_images', async ({ groupId, imageUrls }) => {
    try {
      const senderId = socket.userId

      for (const url of imageUrls) {
        const message = await createGroupMessage({
          sender_id: senderId,
          group_id: groupId,
          content: url,
          message_type: 'image',
        })

        io.to(groupId).emit('receive_group_message', message)
      }

    } catch (error) {
      console.error('Group image error:', error.message)
    }
  })

  socket.on('report_message', async ({ messageId, reason }) => {
  try {
    const userId = socket.userId

    const report = await createReport({
      message_id: messageId,
      reported_by: userId,
      reason,
    })

    console.log('Message reported:', report.id)

    // (optional) notify admin later
  } catch (error) {
    console.error('Report error:', error.message)
  }
  })

  socket.on('edit_message', async ({ messageId, newContent }) => {
  try {
    const userId = socket.userId

    console.log('EDIT EVENT HIT ✅', { messageId, newContent, userId })

    const updatedMessage = await editMessage(messageId, newContent, userId)

    console.log('DB RESULT:', updatedMessage)

    if (!updatedMessage) return

    const receiverId = updatedMessage.receiver_id

    // send to receiver
    const receiverSockets = onlineUsers.get(receiverId)
    if (receiverSockets) {
      receiverSockets.forEach((id) => {
        io.to(id).emit('message_edited', updatedMessage)
      })
    }

    // send to sender
    socket.emit('message_edited', updatedMessage)

  } catch (error) {
    console.error('Edit message error:', error.message)
  }
  })

  socket.on('delete_message', async ({ messageId }) => {
  try {
    const userId = socket.userId
    console.log('DELETE EVENT HIT ✅', { messageId, userId })
    const deletedMessage = await deleteMessage(messageId, userId)
    console.log('DB RESULT:', deletedMessage)  
    
    if (!deletedMessage) {
      console.log('❌ No message deleted')
      return
    }

    const receiverId = deletedMessage.receiver_id

    // send to receiver
    const receiverSockets = onlineUsers.get(receiverId)
    if (receiverSockets) {
      receiverSockets.forEach((id) => {
        io.to(id).emit('message_deleted', deletedMessage)
      })
    }

    // send to sender
    socket.emit('message_deleted', deletedMessage)

  } catch (error) {
    console.error('Delete message error:', error.message)
  }
  })

  socket.on('disconnect', async () => {
    console.log('User disconnected:', userId)

    const userSockets = onlineUsers.get(userId)

    if (userSockets) {
      userSockets.delete(socket.id)

      if (userSockets.size === 0) {
        onlineUsers.delete(userId)

        try {
          await updateUserOnlineStatus(userId, false)
        } catch (err) {
          console.error('DB error:', err.message)
        }
      }
    }

    io.emit('online_users', Array.from(onlineUsers.keys()))
  })
})

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, async () => {
  await connectDB()
  console.log(`Server running on port ${PORT}`)
})
