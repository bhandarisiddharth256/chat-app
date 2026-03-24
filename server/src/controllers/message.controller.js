import { getMessagesBetweenUsers } from '../models/message.model.js'

// GET CHAT HISTORY
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId
    const { receiverId } = req.params

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID required' })
    }

    const messages = await getMessagesBetweenUsers(userId, receiverId)

    return res.status(200).json({ messages })
  } catch (error) {
    console.error('Get chat history error:', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}