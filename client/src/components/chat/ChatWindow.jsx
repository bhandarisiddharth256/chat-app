import { useEffect, useRef } from "react";
import { useChatStore } from "../../features/chat/chatStore";
import { useAuthStore } from "../../features/auth/authStore";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { getSocket } from "../../app/socket";

const ChatWindow = () => {
  const { selectedChat, messages, listenToMessages } = useChatStore();
  const user = useAuthStore((state) => state.user);

  const bottomRef = useRef();

  // ✅ Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Listen to socket messages (with cleanup)
  useEffect(() => {
    if (!user) return;

    listenToMessages(user.id);

    return () => {
      const socket = getSocket();
      socket?.off("receive_message"); // 🔥 prevent duplicate listeners
    };
  }, [user, listenToMessages]);

  return (
    <div className="h-full flex flex-col">
      
      {/* Header */}
      <div className="p-4 border-b font-semibold">
        {selectedChat ? selectedChat.name : "Select a chat"}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        {selectedChat && <MessageInput />}
      </div>
    </div>
  );
};

export default ChatWindow;