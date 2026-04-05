import API from "./axios";

// REGISTER
export const registerUser = (data) => {
  return API.post("/auth/register", data);
};

// LOGIN
export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

// LOGOUT
export const logoutUser = () => {
  return API.post("/auth/logout");
};

// GET CURRENT USER
export const getMe = () => {
  return API.get("/auth/me");
};

// REFRESH TOKEN
export const refreshToken = () => {
  return API.post("/auth/refresh-token");
};