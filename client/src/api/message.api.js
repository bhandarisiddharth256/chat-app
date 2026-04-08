import API from "./axios";

export const getMessagesAPI = (receiverId) =>
  API.get(`/messages/${receiverId}`);