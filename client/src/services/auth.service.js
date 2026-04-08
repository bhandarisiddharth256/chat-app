import { loginAPI, registerAPI, getMeAPI , logoutAPI} from "../api/auth.api";

export const loginService = async (data) => {
  const res = await loginAPI(data);

  const { accessToken, user } = res.data;

  localStorage.setItem("accessToken", accessToken);

  return user;
};

export const registerService = async (data) => {
  const res = await registerAPI(data);

  const { accessToken, user } = res.data;

  localStorage.setItem("accessToken", accessToken);

  return user;
};

export const getMeService = async () => {
  const res = await getMeAPI();
  return res.data.user;
};

export const logoutService = async () => {
  try {
    await logoutAPI(); // backend cleanup
  } catch (err) {
    console.log("Logout API failed, but continuing...");
  }

  localStorage.removeItem("accessToken");
};