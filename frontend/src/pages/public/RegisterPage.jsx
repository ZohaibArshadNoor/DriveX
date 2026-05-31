import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../../features/auth/services/authService";

import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await authService.register(formData);

      alert("Registration successful");

      navigate("/login");
    } catch (error) {
      console.error(error);

      alert("Registration failed");
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
          "
        >
          Register
        </h1>

        <input
          type="text"
          placeholder="Full Name"
          className="
          w-full
          border
          p-3
          mb-4
          "
          value={formData.full_name}
          onChange={(e) =>
            setFormData({
              ...formData,
              full_name: e.target.value,
            })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="
          w-full
          border
          p-3
          mb-4
          "
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="
          w-full
          border
          p-3
          mb-4
          "
          value={formData.password}
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
        />

        <button
          className="
          w-full
          bg-green-600
          text-white
          py-3
          rounded
          "
        >
          Register
        </button>
      </form>
    </div>
        <Footer />
    </div>
  );
}

export default RegisterPage;
