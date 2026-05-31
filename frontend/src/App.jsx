import { useEffect } from "react";

import AppRoutes from "./routes";

import { authService } from "./features/auth/services/authService";

import { useAuthStore } from "./store/authStore";

function App() {
  const token = useAuthStore((state) => state.token);

  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) return;

      try {
        const user = await authService.me();

        setUser(user);
      } catch {
        console.log("User not loaded");
      }
    };

    loadUser();
  }, [token]);

  return <AppRoutes />;
}

export default App;
