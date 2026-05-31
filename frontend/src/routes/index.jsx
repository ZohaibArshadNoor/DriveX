import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";

// User Pages
import DashboardPage from "../pages/user/DashboardPage";
import VehiclesPage from "../pages/user/VehiclesPage";
import BookingsPage from "../pages/user/BookingsPage";
import DocumentsPage from "../pages/user/DocumentsPage";

// Layouts & Guards
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* PROTECTED LAYOUT WRAPPER */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/my-bookings" element={<BookingsPage />} />
          <Route path="/my-documents" element={<DocumentsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;