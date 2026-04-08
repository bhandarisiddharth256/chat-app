import { searchUsersAPI } from "../api/user.api";

export const searchUsersService = async (query) => {
  const res = await searchUsersAPI(query);
  return res.data;
};