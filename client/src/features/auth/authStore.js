import { create } from "zustand";
import {
  loginService,
  registerService,
  getMeService,
  logoutService,
} from "../../services/auth.service";

import { connectSocket } from "../../app/socket";

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  authLoading: true, // 🔥 important

  login: async (data) => {
    set({ loading: true });
    try {
      const user = await loginService(data);

      const token = localStorage.getItem("accessToken");
      connectSocket(token); // 🔥 connect here

      set({ user, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      const user = await registerService(data);
      set({ user, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  fetchUser: async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      set({ user: null, authLoading: false });
      return;
    }

    try {
      const user = await getMeService();
      set({ user, authLoading: false });
    } catch (err) {
      localStorage.removeItem("accessToken");
      set({ user: null, authLoading: false });
    }
  },

  logout: async () => {
    localStorage.removeItem("accessToken");
    set({ user: null });
  },

}));