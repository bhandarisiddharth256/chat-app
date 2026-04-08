import { getConversationsAPI } from "../api/chat.api";

export const getConversationsService = async () => {
  const res = await getConversationsAPI();

  return res.data.conversations.map((chat) => ({
    id: chat.id, // ✅ must be USER ID
    name: chat.name,
    last_message: chat.last_message || null,
  }));
};