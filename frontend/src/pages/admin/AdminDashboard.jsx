/**
 * DriveX — AdminDashboard.jsx
 * Place at: src/pages/admin/AdminDashboard.jsx
 * Route: /admin  (protected — admin only)
 */

import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { gsap } from "gsap";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";

const T = {
  bg: "#05070f", bgCard: "#0a0f1a",
  border: "rgba(255,255,255,0.10)", primary: "#06b6d4",
  white: "#ffffff", gray3: "#cbd5e1", gray5: "#64748b",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444", indigo: "#818cf8",
};

const BOOKING_STATUSES = {
  PENDING:                  { color: T.amber,   bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  label: "Pending" },
  APPROVED_WAITING_ADVANCE: { color: T.primary, bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.25)",   label: "Awaiting Payment" },
  CONFIRMED:                { color: T.green,   bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   label: "Confirmed" },
  ACTIVE:                   { color: "#22d3ee", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.25)",  label: "Active" },
  COMPLETED:                { color: T.indigo,  bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)", label: "Completed" },
  CANCELLED:                { color: T.red,     bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   label: "Cancelled" },
  REJECTED:                 { color: "#dc2626", bg: "rgba(220,38,38,0.1)",   border: "rgba(220,38,38,0.25)",   label: "Rejected" },
};

function StatCard({ label, value, icon, color, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 24, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out", delay }
    );
  }, [delay]);
  return (
    <div ref={ref} style={{
      padding: "34px 28px", borderRadius: 18,
      background: T.bgCard, border: `1px solid ${T.border}`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ fontSize: 36, marginBottom: 20 }}>{icon}</div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 52, fontWeight: 900, color, letterSpacing: -1.5, lineHeight: 1, marginBottom: 8 }}>{value}</div>
      <div style={{ fontSize: 16, color: T.gray3, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function RecentBookingRow({ b, onAction }) {
  const st = BOOKING_STATUSES[b.booking_status] || BOOKING_STATUSES.PENDING;
  const vehicle = b.vehicle || {};
  const user = b.user || {};

  return (
    <div style={{
      padding: "20px 20px", borderRadius: 14,
      background: "rgba(255,255,255,0.015)", border: `1px solid ${T.border}`,
      transition: "all 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.3)"; e.currentTarget.style.background = "rgba(6,182,212,0.03)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        {/* Thumbnail */}
        <div style={{ width: 80, height: 56, borderRadius: 8, overflow: "hidden", background: "#080c18", flexShrink: 0, border: `1px solid ${T.border}` }}>
          {vehicle.thumbnail
            ? <img src={vehicle.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, opacity: 0.15 }}>🚗</div>
          }
        </div>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, color: T.white, letterSpacing: -0.3, marginBottom: 3 }}>
            {vehicle.brand} {vehicle.model} <span style={{ color: T.gray5, fontWeight: 400, fontSize: 15 }}>{vehicle.year}</span>
          </div>
          <div style={{ fontSize: 13, color: T.gray3 }}>
            👤 {user.full_name} · {user.email}
          </div>
          <div style={{ fontSize: 12, color: T.gray5, marginTop: 2 }}>📅 {b.start_date} → {b.end_date}</div>
        </div>
        {/* Price */}
        <div style={{ textAlign: "right", minWidth: 120 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: T.primary }}>
            Rs. {Number(b.total_price).toLocaleString()}
          </div>
          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
            {st.label}
          </span>
        </div>
        {/* Actions */}
        {b.booking_status === "PENDING" && (
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => onAction(b.id, "approve")} style={{ padding: "8px 16px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, color: T.green, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>
              Approve
            </button>
            <button onClick={() => onAction(b.id, "reject")} style={{ padding: "8px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, color: T.red, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const { data: dashData } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.get("/dashboard/admin").then(r => r.data?.data),
    staleTime: 30_000,
  });

  const { data: bookingsRes = [] } = useQuery({
    queryKey: ["admin-bookings-all"],
    queryFn: () => api.get("/bookings/admin/all").then(r => r.data?.data || []),
    staleTime: 30_000,
  });

  const pendingBookings = bookingsRes.filter(b => b.booking_status === "PENDING").slice(0, 5);
  const recentBookings  = bookingsRes.slice(0, 5);

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(headerRef.current.querySelectorAll("[data-reveal]"),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" }
    );
  }, []);

  const handleQuickAction = async (bookingId, action) => {
    try {
      if (action === "approve") {
        await api.patch(`/bookings/${bookingId}/approve`);
      } else {
        await api.patch(`/bookings/${bookingId}/reject`);
      }
      // Refetch
      window.location.reload();
    } catch {
      alert("Action failed");
    }
  };

  const stats = [
    { label: "Total Users",        value: dashData?.total_users        ?? "—", icon: "👥", color: T.primary   },
    { label: "Total Vehicles",      value: dashData?.total_vehicles     ?? "—", icon: "🚗", color: "#22d3ee"   },
    { label: "Pending Bookings",    value: dashData?.pending_bookings   ?? "—", icon: "⏳", color: T.amber     },
    { label: "Active Rentals",      value: dashData?.active_bookings    ?? "—", icon: "🔑", color: T.green     },
    { label: "Completed",           value: dashData?.completed_bookings ?? "—", icon: "✅", color: T.indigo    },
    { label: "Pending Documents",   value: dashData?.pending_documents  ?? "—", icon: "📋", color: T.red       },
  ];

  const quickLinks = [
    { label: "Manage Bookings", desc: "Approve, reject, activate rentals",  to: "/admin/bookings", icon: "📋", color: T.amber   },
    { label: "Fleet Management",desc: "Add, edit, remove vehicles",         to: "/admin/vehicles", icon: "🚗", color: T.primary  },
    { label: "User Management", desc: "View, suspend customer accounts",    to: "/admin/users",    icon: "👥", color: T.green    },
    { label: "Documents",       desc: "Verify uploaded driver's licenses",  to: "/admin/documents",icon: "🪪", color: T.indigo   },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 80, fontFamily: "'Rajdhani', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@700;900&family=JetBrains+Mono:wght@400&display=swap');`}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 8vw 80px" }}>

        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: 48 }}>
          <div data-reveal style={{ opacity: 0, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: T.primary, letterSpacing: 4, fontWeight: 700, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
              Admin Panel
            </span>
          </div>
          <div data-reveal style={{ opacity: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(40px,6vw,60px)", fontWeight: 900, color: T.white, letterSpacing: -1, lineHeight: 1 }}>
              Admin Dashboard
              <span style={{ display: "block", color: T.primary, fontSize: "0.6em" }}>
                Welcome, {user?.full_name?.split(" ")[0]}
              </span>
            </h1>
            <div style={{ display: "flex", gap: 12 }}>
              <Link to="/admin/bookings" style={{ padding: "14px 24px", background: T.primary, border: "none", borderRadius: 10, color: "#000", fontSize: 15, fontWeight: 800, textDecoration: "none", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1, boxShadow: "0 4px 24px rgba(6,182,212,0.3)", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 40px rgba(6,182,212,0.5)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(6,182,212,0.3)"}
              >
                Review Bookings ({dashData?.pending_bookings ?? 0})
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 48 }}>
          {stats.map((s, i) => <StatCard key={s.label} {...s} delay={0.05 * i} />)}
        </div>

        {/* Quick Navigation */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 900, color: T.white, letterSpacing: -0.5, marginBottom: 20 }}>
            Quick Navigation
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {quickLinks.map(({ label, desc, to, icon, color }) => (
              <Link key={to} to={to} style={{
                display: "flex", alignItems: "flex-start", gap: 16,
                padding: "22px 20px", borderRadius: 14,
                background: T.bgCard, border: `1px solid ${T.border}`,
                textDecoration: "none", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}55`; e.currentTarget.style.background = `rgba(6,182,212,0.04)`; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bgCard; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: `${color}18`, border: `1px solid ${color}30`, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 19, fontWeight: 900, color: T.white, letterSpacing: -0.3, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: T.gray5 }}>{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Two column */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>

          {/* Pending bookings */}
          <div style={{ padding: "32px 28px", borderRadius: 18, background: T.bgCard, border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 900, color: T.white, letterSpacing: -0.5 }}>Pending Approvals</div>
                <div style={{ fontSize: 13, color: T.gray5, marginTop: 2 }}>Bookings waiting for your review</div>
              </div>
              <Link to="/admin/bookings?status=PENDING" style={{ fontSize: 14, color: T.primary, textDecoration: "none", fontWeight: 600 }}>View all →</Link>
            </div>
            {pendingBookings.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pendingBookings.map(b => <RecentBookingRow key={b.id} b={b} onAction={handleQuickAction} />)}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: T.gray5 }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.2 }}>✅</div>
                <div style={{ fontSize: 16, color: T.gray3 }}>No pending bookings</div>
              </div>
            )}
          </div>

          {/* Sidebar: revenue + recent activity */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Booking status breakdown */}
            <div style={{ padding: "28px 24px", borderRadius: 18, background: T.bgCard, border: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: T.white, letterSpacing: -0.5, marginBottom: 20 }}>Status Overview</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Pending",   value: dashData?.pending_bookings   ?? 0, color: T.amber   },
                  { label: "Active",    value: dashData?.active_bookings    ?? 0, color: T.green   },
                  { label: "Completed", value: dashData?.completed_bookings ?? 0, color: T.indigo  },
                  { label: "Total",     value: dashData?.total_bookings     ?? 0, color: T.primary },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 14, color: T.gray3 }}>{label}</span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent bookings mini */}
            <div style={{ padding: "28px 24px", borderRadius: 18, background: T.bgCard, border: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: T.white }}>Recent Activity</div>
                <Link to="/admin/bookings" style={{ fontSize: 13, color: T.primary, textDecoration: "none" }}>All →</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentBookings.slice(0, 4).map(b => {
                  const st = BOOKING_STATUSES[b.booking_status] || BOOKING_STATUSES.PENDING;
                  return (
                    <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 13, color: T.white, fontWeight: 600 }}>
                        {b.vehicle?.brand} {b.vehicle?.model}
                        <div style={{ fontSize: 11, color: T.gray5, fontWeight: 400 }}>{b.user?.full_name}</div>
                      </div>
                      <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 9, fontWeight: 700, textTransform: "uppercase", background: st.bg, border: `1px solid ${st.border}`, color: st.color, whiteSpace: "nowrap" }}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}