import { useEffect } from "react";
import { useAuthStore } from "./features/auth/authStore";
import AppRoutes from "./routes/AppRoutes";
import { connectSocket } from "./app/socket";
function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser(); // 🔥 restore user on refresh
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      connectSocket(token); // 🔥 reconnect after refresh
    }

    fetchUser();
  }, []);

  return <AppRoutes />;
}

export default App;