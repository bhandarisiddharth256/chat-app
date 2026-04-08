import { Routes, Route } from "react-router-dom";
import Login from "../features/auth/Login";
import Signup from "../features/auth/Signup";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;