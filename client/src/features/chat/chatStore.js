import { getMessagesService } from "../../services/message.service";
import { getConversationsService } from "../../services/chat.service";
import { create } from "zustand";

export const useChatStore = create((set) => ({
  conversations: [],
  selectedChat: null,
  messages: [],
  loading: false,

  // 🔥 ADD THIS
  fetchConversations: async () => {
    set({ loading: true });

    try {
      const data = await getConversationsService();

      console.log("STORE DATA:", data); // 🔥 debug

      set({
        conversations: Array.isArray(data) ? data : [],
        loading: false,
      });

    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchMessages: async (receiverId) => {
    set({ loading: true });

    try {
      const messages = await getMessagesService(receiverId);
      set({ messages: messages || [], loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  setSelectedChat: (chat) => {
    set({ selectedChat: chat, messages: [] });
  },
}));
