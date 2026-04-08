const ConversationItem = ({ chat, isActive, onClick }) => {
  const lastMessage = chat.last_message;

  return (
    <div
      onClick={onClick}
      className={`p-3 border-b cursor-pointer ${
        isActive ? "bg-gray-200" : "hover:bg-gray-100"
      }`}
    >
      <div className="font-semibold">{chat.name}</div>

      <div className="text-sm text-gray-500 truncate">
        {lastMessage
          ? lastMessage.message_type === "image"
            ? "📷 Image"
            : lastMessage.content
          : "Start conversation"}
      </div>
    </div>
  );
};

export default ConversationItem;