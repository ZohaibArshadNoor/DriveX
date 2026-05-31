import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div
      className="
      w-64
      bg-black
      text-white
      min-h-screen
      p-5
      "
    >
      <h1
        className="
        text-2xl
        font-bold
        mb-8
        "
      >
        DriveX
      </h1>

      <div
        className="
        flex
        flex-col
        gap-4
        "
      >
        <Link to="/dashboard">Dashboard</Link>

        <Link to="/vehicles">Vehicles</Link>

        <Link to="/my-bookings">My Bookings</Link>

        <Link to="/my-documents">Documents</Link>

        <button
          onClick={logout}
          className="
          bg-red-600
          p-2
          rounded
          mt-5
          "
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
