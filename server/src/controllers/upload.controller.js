import cloudinary from '../config/cloudinary.js'

// MULTIPLE IMAGE UPLOAD
export const uploadImages = async (req, res) => {
  try {
    const files = req.files

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' })
    }

    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'chat-app' },
          (error, result) => {
            if (error) reject(error)
            else resolve(result.secure_url)
          }
        ).end(file.buffer)
      })
    })

    const imageUrls = await Promise.all(uploadPromises)

    return res.status(200).json({
      message: 'Uploaded successfully',
      imageUrls,
    })

  } catch (error) {
    console.error('Upload error:', error.message)
    return res.status(500).json({ message: 'Upload failed' })
  }
}