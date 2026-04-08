import { getConversationsAPI } from "../api/chat.api";

export const getConversationsService = async () => {
  const res = await getConversationsAPI();

  const { personal, groups } = res.data.conversations;

  // 🔥 MERGE BOTH
  return [...personal, ...groups];
};