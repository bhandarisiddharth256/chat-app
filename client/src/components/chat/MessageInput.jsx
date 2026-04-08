import { useState } from "react";
import { useChatStore } from "../../features/chat/chatStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const { selectedChat, sendMessage } = useChatStore();

  const handleSend = () => {
    if (!text.trim()) return;

    sendMessage(selectedChat.id, text);
    setText("");
  };

  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 p-2 border rounded"
        placeholder="Type message..."
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white px-4 rounded"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;