import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { getChatHistory } from '../controllers/message.controller.js'

const router = express.Router()

// GET chat history
router.get('/:receiverId', protect, getChatHistory)

export default router