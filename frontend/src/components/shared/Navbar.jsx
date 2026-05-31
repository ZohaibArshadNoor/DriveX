import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          DriveX
        </Link>

        <div className="flex gap-4">
          <Link to="/login" className="hover:text-blue-400">
            Login
          </Link>

          <Link to="/register" className="hover:text-blue-400">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
