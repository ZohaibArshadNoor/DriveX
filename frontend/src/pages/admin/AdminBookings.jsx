/**
 * DriveX — AdminBookings.jsx
 * Place at: src/pages/admin/AdminBookings.jsx
 * Route: /admin/bookings  (admin only)
 *
 * Features:
 * - All bookings from all users
 * - Filter by status
 * - Approve / Reject / Activate / Complete actions per lifecycle stage
 * - Full vehicle + user info on each card
 */

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import api from "../../api/axiosInstance";

const T = {
  bg: "#05070f", bgCard: "#0a0f1a",
  border: "rgba(255,255,255,0.10)", primary: "#06b6d4",
  white: "#ffffff", gray3: "#cbd5e1", gray5: "#64748b",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444", indigo: "#818cf8",
};

const BS = {
  PENDING:                  { color: T.amber,   bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  label: "Pending Review" },
  APPROVED_WAITING_ADVANCE: { color: T.primary, bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.25)",   label: "Awaiting Advance" },
  CONFIRMED:                { color: T.green,   bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   label: "Confirmed" },
  ACTIVE:                   { color: "#22d3ee", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.25)",  label: "Active" },
  COMPLETED:                { color: T.indigo,  bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)", label: "Completed" },
  CANCELLED:                { color: T.red,     bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   label: "Cancelled" },
  REJECTED:                 { color: "#dc2626", bg: "rgba(220,38,38,0.1)",   border: "rgba(220,38,38,0.25)",   label: "Rejected" },
};

const STATUS_FILTERS = ["All", "PENDING", "APPROVED_WAITING_ADVANCE", "CONFIRMED", "ACTIVE", "COMPLETED", "REJECTED", "CANCELLED"];

const PAYMENT_STYLE = {
  pending:  { color: T.amber, label: "Unpaid" },
  paid:     { color: T.green, label: "Fully Paid" },
  failed:   { color: T.red,   label: "Failed" },
  refunded: { color: T.red,   label: "Refunded" },
};

export default function AdminBookings() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const qc = useQueryClient();
  const listRef = useRef(null);

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["admin-bookings-all"],
    queryFn: () => api.get("/bookings/admin/all").then(r => r.data?.data || []),
    staleTime: 15_000,
  });

  const bookings = raw.filter(b => {
    const matchStatus = filter === "All" || b.booking_status === filter;
    const matchSearch = !search || (
      b.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle?.model?.toLowerCase().includes(search.toLowerCase())
    );
    return matchStatus && matchSearch;
  });

  useEffect(() => {
    if (!listRef.current || isLoading) return;
    gsap.fromTo(listRef.current.querySelectorAll("[data-bcard]"),
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: "power2.out" }
    );
  }, [bookings.length, filter, isLoading]);

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/bookings/${id}/approve`),
    onSuccess: () => { toast.success("Booking approved — customer notified to pay advance.", { style: { background: "#0a0f1a", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }); qc.invalidateQueries({ queryKey: ["admin-bookings-all"] }); qc.invalidateQueries({ queryKey: ["admin-dashboard"] }); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }) => api.patch(`/bookings/${id}/reject`, { admin_notes: notes }),
    onSuccess: () => { toast.success("Booking rejected.", { style: { background: "#0a0f1a", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }); qc.invalidateQueries({ queryKey: ["admin-bookings-all"] }); qc.invalidateQueries({ queryKey: ["admin-dashboard"] }); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const pickupMutation = useMutation({
    mutationFn: (id) => api.patch(`/bookings/${id}/pickup`),
    onSuccess: () => { toast.success("Booking activated — vehicle marked as rented.", { style: { background: "#0a0f1a", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }); qc.invalidateQueries({ queryKey: ["admin-bookings-all"] }); qc.invalidateQueries({ queryKey: ["admin-dashboard"] }); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const completeMutation = useMutation({
    mutationFn: (id) => api.patch(`/bookings/${id}/complete`),
    onSuccess: () => { toast.success("Booking completed — vehicle returned to fleet.", { style: { background: "#0a0f1a", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }); qc.invalidateQueries({ queryKey: ["admin-bookings-all"] }); qc.invalidateQueries({ queryKey: ["admin-dashboard"] }); },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const handleReject = (id) => {
    const notes = window.prompt("Rejection reason (optional — shown to customer):", "");
    if (notes === null) return; // cancelled
    rejectMutation.mutate({ id, notes: notes || undefined });
  };

  const pendingCount = raw.filter(b => b.booking_status === "PENDING").length;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 80, fontFamily: "'Rajdhani', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@700;900&family=JetBrains+Mono:wght@400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(148,163,184,0.4); }
        input:focus { outline: none; }
      `}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 8vw 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 13, color: T.primary, letterSpacing: 4, fontWeight: 700, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>Admin Panel</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(36px,5vw,52px)", fontWeight: 900, color: T.white, letterSpacing: -0.8, lineHeight: 1 }}>
              Booking Management
              {pendingCount > 0 && (
                <span style={{ marginLeft: 14, padding: "4px 14px", borderRadius: 20, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: T.amber, fontSize: 16, fontWeight: 700, verticalAlign: "middle" }}>
                  {pendingCount} pending
                </span>
              )}
            </h1>
            <div style={{ fontSize: 14, color: T.gray3 }}>
              <span style={{ color: T.white, fontWeight: 700 }}>{bookings.length}</span> bookings shown
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div style={{ marginBottom: 28, padding: "20px 22px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14 }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.35 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Search by customer name, email, vehicle..."
              style={{
                width: "100%", padding: "11px 14px 11px 42px", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${searchFocused ? T.primary : T.border}`,
                borderRadius: 8, color: T.white, fontSize: 14,
                fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, transition: "border-color 0.2s",
              }} />
          </div>
          {/* Status filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STATUS_FILTERS.map(s => {
              const st = BS[s];
              const active = filter === s;
              const count = s !== "All" ? raw.filter(b => b.booking_status === s).length : raw.length;
              return (
                <button key={s} onClick={() => setFilter(s)} style={{
                  padding: "7px 16px", fontSize: 12, fontWeight: 700, borderRadius: 24,
                  border: `1px solid ${active ? (st?.border || "rgba(6,182,212,0.4)") : T.border}`,
                  background: active ? (st?.bg || "rgba(6,182,212,0.12)") : "transparent",
                  color: active ? (st?.color || T.primary) : T.gray3,
                  cursor: "pointer", transition: "all 0.18s",
                }}>
                  {s === "All" ? "All" : (st?.label || s)}
                  {count > 0 && <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.8 }}>({count})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 44, height: 44, border: `2px solid ${T.border}`, borderTopColor: T.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: T.gray3 }}>
            <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.2 }}>📋</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, color: T.white, marginBottom: 8 }}>
              No bookings found
            </div>
            {(filter !== "All" || search) && (
              <button onClick={() => { setFilter("All"); setSearch(""); }} style={{ padding: "10px 24px", background: T.primary, border: "none", borderRadius: 8, color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontSize: 14, marginTop: 8 }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {bookings.map(b => {
              const st = BS[b.booking_status] || BS.PENDING;
              const paySt = PAYMENT_STYLE[b.payment_status] || PAYMENT_STYLE.pending;
              const vehicle = b.vehicle || {};
              const user = b.user || {};
              const advanceAmount = b.advance_amount || Math.round(Number(b.total_price) * 0.3);

              return (
                <div key={b.id} data-bcard style={{
                  padding: "26px 24px", borderRadius: 16,
                  background: T.bgCard, border: `1px solid ${T.border}`,
                  transition: "border-color 0.2s, background 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.25)"; e.currentTarget.style.background = "rgba(6,182,212,0.02)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bgCard; }}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
                    {/* Thumbnail */}
                    <div style={{ width: 110, height: 78, borderRadius: 10, overflow: "hidden", background: "#080c18", flexShrink: 0, border: `1px solid ${T.border}` }}>
                      {vehicle.thumbnail
                        ? <img src={vehicle.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, opacity: 0.15 }}>🚗</div>
                      }
                    </div>

                    {/* Vehicle + customer info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 900, color: T.white, letterSpacing: -0.5, marginBottom: 4 }}>
                            {vehicle.brand} {vehicle.model} <span style={{ color: T.gray5, fontWeight: 400, fontSize: 18 }}>{vehicle.year}</span>
                          </h3>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                            {vehicle.category && <span style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: T.primary, fontSize: 12, fontWeight: 700 }}>{vehicle.category}</span>}
                            {vehicle.transmission && <span style={{ fontSize: 13, color: T.gray5 }}>{vehicle.transmission}</span>}
                            {vehicle.fuel_type && <span style={{ fontSize: 13, color: T.gray5 }}>{vehicle.fuel_type}</span>}
                          </div>
                          <div style={{ fontSize: 13, color: T.gray3 }}>
                            👤 <span style={{ color: T.white, fontWeight: 600 }}>{user.full_name}</span> · {user.email}
                          </div>
                          <div style={{ fontSize: 12, color: T.gray5, marginTop: 2 }}>📅 {b.start_date} → {b.end_date} · Booking #{b.id}</div>
                        </div>
                        <span style={{ padding: "6px 16px", borderRadius: 24, fontSize: 12, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", background: st.bg, border: `1px solid ${st.border}`, color: st.color, whiteSpace: "nowrap" }}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: pricing + actions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 13, color: T.gray5, marginBottom: 3 }}>Total</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 900, color: T.primary, letterSpacing: -0.5 }}>
                          Rs. {Number(b.total_price).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: T.gray5, marginBottom: 3 }}>Advance (30%)</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, color: T.white }}>
                          Rs. {advanceAmount.toLocaleString()}
                          {b.advance_paid
                            ? <span style={{ color: T.green, marginLeft: 8, fontSize: 12 }}>✓ Paid</span>
                            : <span style={{ color: T.amber, marginLeft: 8, fontSize: 12 }}>⌛ Pending</span>
                          }
                        </div>
                        {!b.advance_paid && b.payment_deadline && (
                          <div style={{ fontSize: 11, color: T.red, marginTop: 2 }}>
                            Due by {new Date(b.payment_deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: T.gray5, marginBottom: 3 }}>Payment</div>
                        <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: paySt.color, background: `rgba(${paySt.color === T.green ? "34,197,94" : paySt.color === T.primary ? "6,182,212" : "245,158,11"},0.1)`, border: `1px solid rgba(${paySt.color === T.green ? "34,197,94" : paySt.color === T.primary ? "6,182,212" : "245,158,11"},0.25)` }}>
                          {paySt.label}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons based on status */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {b.booking_status === "PENDING" && (
                        <>
                          <button onClick={() => approveMutation.mutate(b.id)} disabled={approveMutation.isPending}
                            style={{ padding: "10px 20px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 10, color: T.green, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5, transition: "all 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.25)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(34,197,94,0.15)"}
                          >✓ Approve</button>
                          <button onClick={() => handleReject(b.id)} disabled={rejectMutation.isPending}
                            style={{ padding: "10px 20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: T.red, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5 }}>
                            ✕ Reject
                          </button>
                        </>
                      )}
                      {b.booking_status === "CONFIRMED" && (
                        <button onClick={() => pickupMutation.mutate(b.id)} disabled={pickupMutation.isPending}
                          style={{ padding: "10px 20px", background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)", borderRadius: 10, color: "#22d3ee", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5 }}>
                          🚗 Mark Picked Up
                        </button>
                      )}
                      {b.booking_status === "ACTIVE" && (
                        <button onClick={() => { if (window.confirm("Mark this rental as completed?")) completeMutation.mutate(b.id); }} disabled={completeMutation.isPending}
                          style={{ padding: "10px 20px", background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 10, color: T.indigo, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5 }}>
                          ✅ Complete Rental
                        </button>
                      )}
                      {["COMPLETED", "CANCELLED", "REJECTED"].includes(b.booking_status) && (
                        <span style={{ fontSize: 12, color: T.gray5, fontStyle: "italic", alignSelf: "center" }}>No actions available</span>
                      )}
                    </div>
                  </div>

                  {/* Admin notes */}
                  {b.admin_notes && (
                    <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", fontSize: 13, color: T.amber }}>
                      💬 Note: {b.admin_notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}