import { getMessagesAPI } from "../api/message.api";

export const getMessagesService = async (receiverId) => {
  const res = await getMessagesAPI(receiverId);

  return res.data.messages; // 🔥 IMPORTANT
};