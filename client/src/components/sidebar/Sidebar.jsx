import { useAuthStore } from "../../features/auth/authStore";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();        // clear state + token
    navigate("/login");    // redirect
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <span className="font-semibold">{user?.username}</span>

        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 text-white px-2 py-1 rounded"
        >
          Logout
        </button>
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