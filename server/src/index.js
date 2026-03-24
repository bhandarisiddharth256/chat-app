import express from "express"
import { createServer } from "http"
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import cors from "cors"
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes.js'
import { updateUserOnlineStatus } from './models/user.model.js'
import { createMessage } from './models/message.model.js'
import { createReport } from './models/report.model.js'
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

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Chat app server is running' })
})

app.use('/api/auth', authRoutes)

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
