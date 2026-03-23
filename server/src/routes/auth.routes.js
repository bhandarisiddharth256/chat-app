import express from 'express'
import {
  register,
  login,
  logout,
  refreshToken,
  getMe
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/refresh-token', refreshToken)
router.post('/logout', logout)

// Protected route
router.get('/me', protect, getMe)

export default router