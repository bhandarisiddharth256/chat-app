import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { createGroupHandler , addMemberHandler, renameGroupHandler } from '../controllers/group.controller.js'

const router = express.Router()

router.post('/', protect, createGroupHandler)
router.post('/add-member', protect, addMemberHandler)
router.put('/rename', protect, renameGroupHandler)

export default router