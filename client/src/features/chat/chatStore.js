import { getMessagesService } from "../../services/message.service";
import { getConversationsService } from "../../services/chat.service";
import { create } from "zustand";
import { getSocket } from "../../app/socket";

export const useChatStore = create((set, get) => ({
  conversations: [],
  selectedChat: null,
  messages: [],
  loading: false,

  // ✅ FETCH CONVERSATIONS
  fetchConversations: async () => {
    set({ loading: true });

    try {
      const data = await getConversationsService();

      // 🔥 IMPORTANT FIX
      const formatted = data.map((chat) => ({
        ...chat,
        last_message: chat.last_message || null,
      }));

      set({
        conversations: formatted,
        loading: false,
      });

    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  // ✅ FETCH MESSAGES
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

  // ✅ SEND MESSAGE
  sendMessage: (receiverId, content) => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("send_message", {
      receiverId,
      content,
    });
  },

  // ✅ LISTEN TO MESSAGES (REAL-TIME)
  listenToMessages: (currentUserId) => {
    const socket = getSocket();
    if (!socket) return;

    socket.off("receive_message");

    socket.on("receive_message", (message) => {
      // update messages
      set((state) => ({
        messages: [...state.messages, message],
      }));

      // update sidebar
      get().addOrUpdateConversation(message, currentUserId);
    });
  },

  addOrUpdateConversation: (message, currentUserId) => {
    set((state) => {
      const otherUserId =
        message.sender_id === currentUserId
          ? message.receiver_id
          : message.sender_id;

      const existing = state.conversations.find(
        (c) => c.id === otherUserId
      );

      const selected = state.selectedChat;

      const updatedConversation = {
        id: otherUserId,
        name:
          existing?.name ||
          (selected?.id === otherUserId ? selected.name : null) ||
          "User",
        last_message: message,
      };

      // 🔥 REMOVE OLD VERSION
      const filtered = state.conversations.filter(
        (c) => c.id !== otherUserId
      );

      // 🔥 ADD TO TOP
      return {
        conversations: [updatedConversation, ...filtered],
      };
    });
  },

  // ✅ SELECT CHAT
  setSelectedChat: (chat) => {
    set({ selectedChat: chat, messages: [] });
  },
}));