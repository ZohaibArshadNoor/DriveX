/**
 * DriveX — App.jsx  (COMPLETE — all routes wired)
 * Place at: src/App.jsx
 *
 * RBAC:
 *  Guest     → /, /vehicles, /vehicles/:id, /login, /register
 *  Customer  → /dashboard, /bookings, /documents  (+ all public)
 *  Admin     → /admin, /admin/bookings, /admin/vehicles, /admin/users, /admin/documents
 *
 * After login/register → customer goes to /dashboard, admin goes to /admin
 * Unauthorized access → redirect to /login (customer routes) or /vehicles (wrong role)
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// ── Shared ─────────────────────────────────────────────────────────────────
import Navbar from "./components/shared/Navbar";

// ── Public pages ───────────────────────────────────────────────────────────
import LandingPage      from "./pages/public/LandingPage";
import LoginPage        from "./pages/public/LoginPage";
import RegisterPage     from "./pages/public/RegisterPage";
import VehiclesPage     from "./pages/user/VehiclesPage";
import VehicleDetailPage from "./pages/user/VehicleDetailPage";

// ── Customer pages ─────────────────────────────────────────────────────────
import CustomerDashboard from "./pages/user/CustomerDashboard";
import BookingsPage      from "./pages/user/BookingsPage";
import DocumentsPage     from "./pages/user/DocumentsPage";

// ── Admin pages ────────────────────────────────────────────────────────────
import AdminDashboard  from "./pages/admin/AdminDashboard";
import AdminBookings   from "./pages/admin/AdminBookings";
import AdminVehicles   from "./pages/admin/AdminVehicles";
import AdminUsers      from "./pages/admin/AdminUsers";
import AdminDocuments  from "./pages/admin/AdminDocuments";

// ═══════════════════════════════════════════════════════════════════════════
// Route Guards
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ProtectedRoute — requires authenticated user (any role)
 * Redirects to /login if not authenticated
 * Saves attempted URL so LoginPage can redirect back after login
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

/**
 * CustomerRoute — requires role === "customer"
 * Admin visiting customer routes gets redirected to /admin
 */
function CustomerRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

/**
 * AdminRoute — requires role === "admin"
 * Non-admin authenticated users redirected to /dashboard
 * Unauthenticated users redirected to /login
 */
function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

/**
 * GuestOnly — redirects logged-in users away from login/register pages
 * Customer → /dashboard
 * Admin    → /admin
 */
function GuestOnly({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }
  return children;
}

// ═══════════════════════════════════════════════════════════════════════════
// App Component
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  return (
    <BrowserRouter>
      {/* Navbar is always rendered — it reads auth state internally */}
      <Navbar />

      <Routes>

        {/* ── PUBLIC ROUTES ──────────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />

        {/* Vehicle browsing — open to everyone, no auth needed */}
        <Route path="/vehicles"     element={<VehiclesPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />

        {/* Auth pages — redirect away if already logged in */}
        <Route path="/login" element={
          <GuestOnly><LoginPage /></GuestOnly>
        } />
        <Route path="/register" element={
          <GuestOnly><RegisterPage /></GuestOnly>
        } />

        {/* ── CUSTOMER ROUTES ────────────────────────────────────────────── */}
        {/* All customer routes require role === "customer" */}

        <Route path="/dashboard" element={
          <CustomerRoute><CustomerDashboard /></CustomerRoute>
        } />

        <Route path="/bookings" element={
          <CustomerRoute><BookingsPage /></CustomerRoute>
        } />

        <Route path="/documents" element={
          <CustomerRoute><DocumentsPage /></CustomerRoute>
        } />

        {/* ── ADMIN ROUTES ───────────────────────────────────────────────── */}
        {/* All admin routes require role === "admin" */}

        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />

        <Route path="/admin/bookings" element={
          <AdminRoute><AdminBookings /></AdminRoute>
        } />

        <Route path="/admin/vehicles" element={
          <AdminRoute><AdminVehicles /></AdminRoute>
        } />

        <Route path="/admin/users" element={
          <AdminRoute><AdminUsers /></AdminRoute>
        } />

        <Route path="/  " element={
          <AdminRoute><AdminDocuments /></AdminRoute>
        } />

        {/* ── CATCH ALL ──────────────────────────────────────────────────── */}
        {/* Any unknown URL → landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}