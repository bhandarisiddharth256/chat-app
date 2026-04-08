import API from "./axios";

export const getConversationsAPI = () =>
  API.get("/conversations");