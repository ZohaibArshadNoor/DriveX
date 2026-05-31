import { Outlet } from "react-router-dom";
import Sidebar from "../components/shared/Sidebar";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        {/* Top Navbar */}
        <div className="h-14 bg-white shadow flex items-center justify-between px-6">
          <h1 className="font-semibold">DriveX Dashboard</h1>

          <div className="text-sm text-gray-600">Welcome back</div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white text-center text-sm py-3 border-t">
          DriveX Rental System © 2026
        </footer>
      </div>
    </div>
  );
}

export default DashboardLayout;
