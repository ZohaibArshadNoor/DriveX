import axiosInstance from "../../../api/axiosInstance";
import { ENDPOINTS } from "../../../api/endpoints";

export const authService = {
  register: async (data) => {
    const response = await axiosInstance.post(ENDPOINTS.REGISTER, data);

    return response.data;
  },

  login: async (data) => {
    const response = await axiosInstance.post(ENDPOINTS.LOGIN, {
      email: data.email,
      password: data.password,
    });

    return response.data;
  },
};
