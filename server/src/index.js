import express from "express"
import { createServer } from "http"
import { Server } from 'socket.io'
import cors from "cors"
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes.js'
import dotenv from 'dotenv'
dotenv.config()

import { connectDB } from './config/db.js'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
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

// Socket.io connection (we will expand this later)
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, async () => {
  await connectDB()
  console.log(`Server running on port ${PORT}`)
})
