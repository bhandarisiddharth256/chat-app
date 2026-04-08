import { useEffect, useRef } from "react";
import { useChatStore } from "../../features/chat/chatStore";
import MessageBubble from "./MessageBubble";

const ChatWindow = () => {
  const { selectedChat, messages } = useChatStore();
  const bottomRef = useRef();

  // 🔥 auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full p-2 border rounded"
          disabled={!selectedChat}
        />
      </div>
    </div>
  );
};

export default ChatWindow;