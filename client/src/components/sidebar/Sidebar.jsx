const Sidebar = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b font-semibold text-lg">
        Chats
      </div>

      {/* Search */}
      <div className="p-2">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-center text-gray-500 mt-4">
          No conversations yet
        </p>
      </div>
    </div>
  );
};

export default Sidebar;