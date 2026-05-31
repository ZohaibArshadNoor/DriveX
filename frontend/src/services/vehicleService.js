import axiosInstance from "../api/axiosInstance";

export const vehicleService = {
  getVehicles: async () => {
    const response = await axiosInstance.get("/vehicles");

    return response.data;
  },
};
