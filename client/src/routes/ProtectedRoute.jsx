import { Navigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuthStore();

  // 🔥 WAIT until auth is checked
  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;