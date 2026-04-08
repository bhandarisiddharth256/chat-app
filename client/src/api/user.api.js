import API from "./axios";

export const searchUsersAPI = (query) =>
  API.get(`/users/search?q=${query}`);