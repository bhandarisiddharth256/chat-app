import Sidebar from "../components/sidebar/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";

const MainLayout = () => {
  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-[30%] border-r">
        <Sidebar />
      </div>

      {/* Chat Area */}
      <div className="w-[70%]">
        <ChatWindow />
      </div>
    </div>
  );
};

export default MainLayout;