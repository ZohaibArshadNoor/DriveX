import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../../features/auth/services/authService";
import { useAuthStore } from "../../store/authStore";

import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";

function LoginPage() {
  const navigate = useNavigate();

  const loginStore = useAuthStore((state) => state.login);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // Clear error when user starts typing
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await authService.login(formData);

      console.log("LOGIN RESPONSE:", response);

      loginStore(response.data.access_token);
      
      navigate("/dashboard");
    } catch (error) {
      console.log("STATUS:", error.response?.status);
      console.log("ERROR DATA:", error.response?.data);
      console.log("FULL ERROR:", error);

      if (error.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (error.response?.status === 422) {
        setError("Request validation failed. Check console for details.");
      } else {
        setError("Unable to login. Please try again later.");
      }

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div
        className="
          min-h-screen
          flex
          justify-center
          items-center
          bg-gray-100
        "
      >
        <form
          onSubmit={handleSubmit}
          className="
            bg-white
            p-8
            rounded-lg
            shadow-lg
            w-[400px]
          "
        >
          <h1
            className="
              text-3xl
              font-bold
              mb-6
              text-center
            "
          >
            Login
          </h1>

          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="
              w-full
              border
              p-3
              mb-4
              rounded
            "
            value={formData.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="
              w-full
              border
              p-3
              mb-4
              rounded
            "
            value={formData.password}
            onChange={handleChange}
          />

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default LoginPage;
