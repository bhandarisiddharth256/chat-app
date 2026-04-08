import { useAuthStore } from "../../features/auth/authStore";

const MessageBubble = ({ message }) => {
  const user = useAuthStore((state) => state.user);

  const isMine = message.sender_id === user.id;

  return (
    <div
      className={`flex mb-2 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-2 rounded-lg max-w-xs ${
          isMine
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        {message.is_deleted ? (
          <i>Message deleted</i>
        ) : (
          <>
            {message.content}
            {message.is_edited && (
              <span className="text-xs ml-1">(edited)</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;