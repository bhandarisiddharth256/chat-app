import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { getConversationList } from '../controllers/conversation.controller.js'

const router = express.Router()

router.get('/', protect, getConversationList)

export default router