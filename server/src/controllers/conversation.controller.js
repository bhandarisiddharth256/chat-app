import { getConversations } from '../models/message.model.js'

export const getConversationList = async (req, res) => {
  try {
    const userId = req.userId

    const data = await getConversations(userId)

    return res.status(200).json({
      conversations: data
    })

  } catch (error) {
    console.error('Conversation error:', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}