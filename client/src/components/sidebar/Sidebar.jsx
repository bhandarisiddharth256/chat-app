import { useEffect, useState } from "react";
import { useChatStore } from "../../features/chat/chatStore";
import { searchUsersService } from "../../services/user.service";
import ConversationItem from "./ConversationItem";

const Sidebar = () => {
  const {
    conversations,
    fetchConversations,
    selectedChat,
    setSelectedChat,
    fetchMessages,
  } = useChatStore();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      try {
        const users = await searchUsersService(search);
        setResults(users);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <div className="h-full flex flex-col">
      
      {/* Header */}
      <div className="p-4 border-b font-bold text-lg">
        Chats
      </div>

      {/* Search */}
      <div className="p-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full p-2 border rounded"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">

        {search ? (
          results.length > 0 ? (
            results.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedChat({
                    id: user.id,
                    name: user.username,
                    is_group: false,
                  });

                  fetchMessages(user.id);
                  setSearch("");
                  setResults([]);
                }}
                className="p-2 cursor-pointer hover:bg-gray-100"
              >
                {user.username}
              </div>
            ))
          ) : (
            <p className="p-2 text-gray-500">No users found</p>
          )
        ) : (
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
          ))
        )}

      </div>
    </div>
  );
};

export default Sidebar;