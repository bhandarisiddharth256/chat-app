import { create } from "zustand";
import {
  loginUser,
  registerUser,
  logoutUser,
  getMe,
} from "../../api/auth.api";

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,

  // LOGIN
  login: async (data) => {
    set({ loading: true });
    try {
      const res = await loginUser(data);

      const { user, accessToken } = res.data;

      localStorage.setItem("accessToken", accessToken);

      set({ user, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  // REGISTER
  register: async (data) => {
    set({ loading: true });
    try {
      const res = await registerUser(data);

      const { user, accessToken } = res.data;

      localStorage.setItem("accessToken", accessToken);

      set({ user, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  // LOGOUT
  logout: async () => {
    try {
      await logoutUser(); // clears refresh token cookie
    } catch (err) {
      console.log("Logout API failed");
    }

    localStorage.removeItem("accessToken");
    set({ user: null });
  },

  // FETCH CURRENT USER
  fetchUser: async () => {
    try {
      const res = await getMe();
      set({ user: res.data });
    } catch (err) {
      set({ user: null });
    }
  },
}));