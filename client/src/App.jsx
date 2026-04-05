import { useEffect } from "react";
import { useAuthStore } from "./features/auth/authStore";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, []);

  return <AppRoutes />;
}

export default App;