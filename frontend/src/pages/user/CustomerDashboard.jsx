/**
 * DriveX — CustomerDashboard.jsx
 * Place at: src/pages/user/CustomerDashboard.jsx
 * Route: /dashboard  (protected — customer only)
 *
 * NOW WITH:
 * - Even larger, more spacious layout
 * - Recent bookings show full vehicle details, payment info, and status timeline
 */

import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { gsap } from "gsap";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";

const T = {
  bg: "#05070f",
  bgCard: "#0a0f1a",
  border: "rgba(255,255,255,0.10)",
  primary: "#06b6d4",
  white: "#ffffff",
  gray3: "#cbd5e1",
  gray5: "#64748b",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  indigo: "#818cf8",
};

// Status styling for bookings & documents
const STATUS_STYLE = {
  PENDING:                  { color: T.amber,   bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)",   label: "Pending" },
  APPROVED_WAITING_ADVANCE: { color: T.primary, bg: "rgba(6,182,212,0.1)",    border: "rgba(6,182,212,0.25)",    label: "Awaiting Payment" },
  CONFIRMED:                { color: T.green,   bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.25)",    label: "Confirmed" },
  ACTIVE:                   { color: "#22d3ee", bg: "rgba(34,211,238,0.1)",   border: "rgba(34,211,238,0.25)",   label: "Active" },
  COMPLETED:                { color: T.indigo,  bg: "rgba(129,140,248,0.1)",  border: "rgba(129,140,248,0.25)",  label: "Completed" },
  CANCELLED:                { color: T.red,     bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)",    label: "Cancelled" },
  REJECTED:                 { color: "#dc2626", bg: "rgba(220,38,38,0.1)",    border: "rgba(220,38,38,0.25)",    label: "Rejected" },
};

const PAYMENT_STATUS = {
  unpaid:    { color: T.amber, label: "Unpaid" },
  advance:   { color: T.primary, label: "Advance Paid" },
  completed: { color: T.green, label: "Fully Paid" },
  refunded:  { color: T.red, label: "Refunded" },
};

// ─── Stat Card (large) ──────────────────────────────────────────────────────
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
      padding: "34px 28px",
      borderRadius: 18,
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -30, right: -30, width: 120, height: 120,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{ fontSize: 36, marginBottom: 20 }}>{icon}</div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 52,
        fontWeight: 900,
        color,
        letterSpacing: -1.5,
        lineHeight: 1,
        marginBottom: 8,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 16, color: T.gray3, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

// ─── Detailed Booking Card (large) ──────────────────────────────────────────
function RecentBookingCard({ b }) {
  const st = STATUS_STYLE[b.booking_status] || STATUS_STYLE.PENDING;
  const paySt = PAYMENT_STATUS[b.payment_status] || PAYMENT_STATUS.unpaid;
  const vehicle = b.vehicle || {};

  return (
    <div style={{
      padding: "24px 20px",
      borderRadius: 14,
      background: "rgba(255,255,255,0.015)",
      border: `1px solid ${T.border}`,
      transition: "all 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.3)"; e.currentTarget.style.background = "rgba(6,182,212,0.03)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
    >
      {/* Top row: thumbnail, title, status */}
      <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
        {/* Thumbnail */}
        <div style={{
          width: 100, height: 70, borderRadius: 10, overflow: "hidden",
          background: "#080c18", flexShrink: 0,
          border: `1px solid ${T.border}`,
        }}>
          {vehicle.thumbnail ? (
            <img src={vehicle.thumbnail} alt={`${vehicle.brand} ${vehicle.model}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, opacity: 0.2 }}>🚗</div>
          )}
        </div>

        {/* Vehicle info and status */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div>
              <h3 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 24, fontWeight: 900, color: T.white,
                letterSpacing: -0.5, marginBottom: 4,
              }}>
                {vehicle.brand} {vehicle.model} <span style={{ color: T.gray3, fontWeight: 400, fontSize: 18 }}>{vehicle.year}</span>
              </h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {vehicle.category && (
                  <span style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: T.primary, fontSize: 12, fontWeight: 700 }}>{vehicle.category}</span>
                )}
                {vehicle.transmission && <span style={{ fontSize: 13, color: T.gray3 }}>{vehicle.transmission}</span>}
                {vehicle.fuel_type && <span style={{ fontSize: 13, color: T.gray3 }}>{vehicle.fuel_type}</span>}
                {vehicle.seats && <span style={{ fontSize: 13, color: T.gray3 }}>{vehicle.seats} seats</span>}
              </div>
              <div style={{ fontSize: 14, color: T.gray3 }}>
                📅 {b.start_date} → {b.end_date}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{
                padding: "5px 14px", borderRadius: 20,
                fontSize: 12, fontWeight: 700, letterSpacing: 0.8,
                textTransform: "uppercase",
                background: st.bg, border: `1px solid ${st.border}`, color: st.color,
              }}>
                {st.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: price, payment, deadline, notes */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 13, color: T.gray3, marginBottom: 2 }}>Total Price</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, color: T.primary, letterSpacing: -0.5 }}>
              Rs. {Number(b.total_price).toLocaleString()}
            </div>
          </div>
          {b.advance_amount > 0 && (
            <div>
              <div style={{ fontSize: 13, color: T.gray3, marginBottom: 2 }}>Advance (30%)</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, color: T.white }}>
                Rs. {Number(b.advance_amount).toLocaleString()}
                {b.advance_paid ? (
                  <span style={{ color: T.green, marginLeft: 8, fontSize: 12 }}>✓ Paid</span>
                ) : (
                  <span style={{ color: T.amber, marginLeft: 8, fontSize: 12 }}>⌛ Pending</span>
                )}
              </div>
              {!b.advance_paid && b.payment_deadline && (
                <div style={{ fontSize: 12, color: T.red, marginTop: 2 }}>
                  Due by {new Date(b.payment_deadline).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
          <div>
            <div style={{ fontSize: 13, color: T.gray3, marginBottom: 2 }}>Payment</div>
            <span style={{
              padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: `rgba(${paySt.color === T.green ? "34,197,94" : paySt.color === T.primary ? "6,182,212" : "245,158,11"}, 0.1)`,
              border: `1px solid rgba(${paySt.color === T.green ? "34,197,94" : paySt.color === T.primary ? "6,182,212" : "245,158,11"}, 0.25)`,
              color: paySt.color,
            }}>{paySt.label}</span>
          </div>
        </div>

        {b.admin_notes && (
          <div style={{
            maxWidth: 260, padding: "10px 14px", borderRadius: 8,
            background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
            fontSize: 13, color: T.amber,
          }}>
            💬 {b.admin_notes}
          </div>
        )}

        <Link to={`/bookings/${b.id}`} style={{
          padding: "8px 18px", borderRadius: 8,
          background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
          color: T.primary, fontSize: 14, fontWeight: 700, textDecoration: "none",
          fontFamily: "'Rajdhani', sans-serif",
        }}>View Details →</Link>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const { data: dashData } = useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: () => api.get("/dashboard/customer").then(r => r.data?.data),
    staleTime: 30_000,
  });

  const { data: bookingsRes = [] } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => api.get("/bookings/").then(r => r.data?.data || []),
    staleTime: 30_000,
  });

  const { data: docsRes = [] } = useQuery({
    queryKey: ["my-documents"],
    queryFn: () => api.get("/documents/my").then(r => r.data?.data || []),
    staleTime: 60_000,
  });

  const recentBookings = bookingsRes.slice(0, 5);
  const hasApprovedDoc = docsRes.some(d => d.verification_status === "approved");

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(headerRef.current.querySelectorAll("[data-reveal]"),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" }
    );
  }, []);

  const stats = [
    { label: "Total Bookings",    value: dashData?.total_bookings     ?? "—", icon: "📋", color: T.primary },
    { label: "Active Rentals",    value: dashData?.active_bookings    ?? "—", icon: "🚗", color: "#22d3ee" },
    { label: "Pending Review",    value: dashData?.pending_bookings   ?? "—", icon: "⏳", color: T.amber },
    { label: "Completed",         value: dashData?.completed_bookings ?? "—", icon: "✅", color: T.green },
  ];

  return (
    <div style={{
      background: T.bg,
      minHeight: "100vh",
      paddingTop: 80,
      fontFamily: "'Rajdhani', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@700;900&family=JetBrains+Mono:wght@400&display=swap');`}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 8vw 80px" }}>

        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: 48 }}>
          <div data-reveal style={{ opacity: 0, marginBottom: 8 }}>
            <span style={{
              fontSize: 13,
              color: T.primary,
              letterSpacing: 4,
              fontWeight: 700,
              textTransform: "uppercase",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Customer Dashboard
            </span>
          </div>
          <div data-reveal style={{
            opacity: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 20,
          }}>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(40px, 6vw, 60px)",
              fontWeight: 900,
              color: T.white,
              letterSpacing: -1,
              lineHeight: 1,
            }}>
              Welcome back,{" "}
              <span style={{ color: T.primary }}>{user?.full_name?.split(" ")[0]}</span> 👋
            </h1>
            <button onClick={() => navigate("/vehicles")} style={{
              padding: "16px 32px",
              background: T.primary,
              border: "none",
              borderRadius: 10,
              color: "#000",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: 1.5,
              boxShadow: "0 6px 30px rgba(6,182,212,0.35)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 48px rgba(6,182,212,0.6)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 6px 30px rgba(6,182,212,0.35)"}
            >Browse Fleet →</button>
          </div>
        </div>

        {/* Document warning */}
        {!hasApprovedDoc && (
          <div style={{
            marginBottom: 36,
            padding: "24px 28px",
            borderRadius: 14,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.white, marginBottom: 6 }}>⚠️ Action Required</div>
              <div style={{ fontSize: 15, color: T.gray3 }}>Upload your driver's license for verification — required before booking.</div>
            </div>
            <Link to="/documents" style={{
              padding: "12px 28px",
              background: T.amber,
              border: "none",
              borderRadius: 10,
              color: "#000",
              fontSize: 16,
              fontWeight: 800,
              textDecoration: "none",
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: 1,
            }}>
              Upload Now →
            </Link>
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 24,
          marginBottom: 48,
        }}>
          {stats.map((s, i) => <StatCard key={s.label} {...s} delay={0.05 * i} />)}
        </div>

        {/* Two‑column: Bookings & Sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32, alignItems: "start" }}>

          {/* Recent Bookings – now uses the detailed card */}
          <div style={{
            padding: "32px 28px",
            borderRadius: 18,
            background: T.bgCard,
            border: `1px solid ${T.border}`,
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 30,
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 30,
                fontWeight: 900,
                color: T.white,
                letterSpacing: -0.5,
              }}>
                Recent Bookings
              </div>
              <Link to="/bookings" style={{
                fontSize: 15,
                color: T.primary,
                textDecoration: "none",
                fontWeight: 600,
              }}>View all →</Link>
            </div>
            {recentBookings.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {recentBookings.map(b => <RecentBookingCard key={b.id} b={b} />)}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "56px 0",
                color: T.gray5,
              }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>📋</div>
                <div style={{ fontSize: 18, color: T.gray3, marginBottom: 20 }}>No bookings yet</div>
                <button onClick={() => navigate("/vehicles")} style={{
                  padding: "12px 28px",
                  background: T.primary,
                  border: "none",
                  borderRadius: 10,
                  color: "#000",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 16,
                  fontFamily: "'Rajdhani', sans-serif",
                }}>
                  Browse Fleet →
                </button>
              </div>
            )}
          </div>

          {/* Right sidebar — bigger */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Documents card */}
            <div style={{
              padding: "28px 24px",
              borderRadius: 18,
              background: T.bgCard,
              border: `1px solid ${T.border}`,
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 26,
                fontWeight: 900,
                color: T.white,
                marginBottom: 20,
                letterSpacing: -0.5,
              }}>
                Documents
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 15, color: T.gray3 }}>Uploaded</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.white }}>{dashData?.documents_uploaded ?? 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                <span style={{ fontSize: 15, color: T.gray3 }}>Approved</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.green }}>{dashData?.documents_approved ?? 0}</span>
              </div>
              <Link to="/documents" style={{
                display: "block",
                width: "100%",
                padding: "14px",
                textAlign: "center",
                borderRadius: 10,
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.25)",
                color: T.primary,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: 1,
                textTransform: "uppercase",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(6,182,212,0.1)"; }}
              >Manage Docs</Link>
            </div>

            {/* Quick actions */}
            <div style={{
              padding: "28px 24px",
              borderRadius: 18,
              background: T.bgCard,
              border: `1px solid ${T.border}`,
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 26,
                fontWeight: 900,
                color: T.white,
                marginBottom: 20,
                letterSpacing: -0.5,
              }}>
                Quick Actions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Browse Fleet",   to: "/vehicles",   icon: "🚗" },
                  { label: "My Bookings",    to: "/bookings",   icon: "📋" },
                  { label: "My Documents",   to: "/documents",  icon: "🪪" },
                ].map(({ label, to, icon }) => (
                  <Link key={to} to={to} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 18px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${T.border}`,
                    color: T.white,
                    textDecoration: "none",
                    fontSize: 17,
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)"; e.currentTarget.style.background = "rgba(6,182,212,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  >
                    <span style={{ fontSize: 22 }}>{icon}</span> {label}
                    <span style={{ marginLeft: "auto", color: T.gray5, fontSize: 16 }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}