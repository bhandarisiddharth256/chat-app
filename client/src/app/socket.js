import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
    auth: { token },
    withCredentials: true,
  });

  return socket;
};

export const getSocket = () => socket;