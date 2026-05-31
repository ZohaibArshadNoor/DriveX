import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token"),
  user: null,
  loadingUser: true,

  login: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({
      token: null,
      user: null,
    });
  },

  setUser: (user) => set({ user }),

  setLoadingUser: (loading) => set({ loadingUser: loading }),
}));