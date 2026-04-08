const ConversationItem = ({ chat, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-3 cursor-pointer border-b hover:bg-gray-100 ${
        isActive ? "bg-gray-200" : ""
      }`}
    >
      <div className="font-semibold">
        {chat.is_group ? chat.name : chat.name}
      </div>

      <div className="text-sm text-gray-500 truncate">
        {chat.last_message?.content || "No messages yet"}
      </div>
    </div>
  );
};

export default ConversationItem;