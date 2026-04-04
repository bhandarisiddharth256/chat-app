import express from 'express'
import { upload } from '../middleware/upload.middleware.js'
import { uploadImages } from '../controllers/upload.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/', protect, upload.array('images', 10), uploadImages)

export default router