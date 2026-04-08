import { useEffect } from "react";
import { useChatStore } from "../../features/chat/chatStore";
import ConversationItem from "./ConversationItem";

const Sidebar = () => {
  const {
    conversations,
    fetchConversations,
    selectedChat,
    setSelectedChat,
    fetchMessages,
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="h-full flex flex-col">
      
      {/* Header */}
      <div className="p-4 border-b font-bold text-lg">
        Chats
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {Array.isArray(conversations) &&
          conversations.map((chat) => (
            <ConversationItem
              key={chat.id}
              chat={chat}
              isActive={selectedChat?.id === chat.id}
              onClick={() => {
                setSelectedChat(chat);
                fetchMessages(chat.id);
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default Sidebar;