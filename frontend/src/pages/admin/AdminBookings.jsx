/**
 * DriveX — AdminBookings.jsx (Enhanced Sizing)
 * Place at: src/pages/admin/AdminBookings.jsx
 * Route: /admin/bookings  (admin only)
 *
 * Larger cards, spacious modal, full‑width layout.
 * Still shows owner details + inline actions + click‑to‑detail.
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

/* ── Rejection Reason Modal ────────────────────────────── */
function RejectModal({ bookingId, onClose, onConfirm }) {
  const [notes, setNotes] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => { if (textareaRef.current) textareaRef.current.focus(); }, []);

  const handleSubmit = () => {
    onConfirm(bookingId, notes.trim() || undefined);
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2100, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 28px", boxShadow: "0 20px 48px rgba(0,0,0,0.6)", fontFamily: "'Rajdhani', sans-serif" }}>
        <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 900, color: T.white, marginBottom: 12 }}>Reject Booking #{bookingId}</h3>
        <p style={{ fontSize: 14, color: T.gray3, marginBottom: 16 }}>Optionally add a reason that the customer can see.</p>
        <textarea ref={textareaRef} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Rejection reason (optional)…" rows={3} style={{ width: "100%", padding: "12px 14px", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 14, fontFamily: "'Rajdhani', sans-serif", resize: "vertical", outline: "none", transition: "border-color 0.2s" }} onFocus={(e) => e.currentTarget.style.borderColor = T.primary} onBlur={(e) => e.currentTarget.style.borderColor = T.border} />
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, borderRadius: 8, color: T.gray3, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>Cancel</button>
          <button onClick={handleSubmit} style={{ flex: 1, padding: "11px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: T.red, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5 }}>✕ Reject</button>
        </div>
      </div>
    </div>
  );
}

/* ── Booking Detail Modal (larger) ────────────────────── */
function BookingDetailModal({ booking, onClose, onApprove, onReject, onPickup, onComplete, pendingActions, onOpenReject }) {
  if (!booking) return null;
  const st = BS[booking.booking_status] || BS.PENDING;
  const paySt = PAYMENT_STYLE[booking.payment_status] || PAYMENT_STYLE.pending;
  const vehicle = booking.vehicle || {};
  const user = booking.user || {};
  const advanceAmount = booking.advance_amount || Math.round(Number(booking.total_price) * 0.3);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 760, background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: 20, padding: "40px 36px", boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        fontFamily: "'Rajdhani', sans-serif", maxHeight: "90vh", overflowY: "auto",
        position: "relative",
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: T.gray3, fontSize: 24, cursor: "pointer", lineHeight: 1 }}>✕</button>

        {/* Vehicle header – larger */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ width: 140, height: 100, borderRadius: 14, overflow: "hidden", background: "#080c18", flexShrink: 0, border: `1px solid ${T.border}` }}>
            {vehicle.thumbnail ? <img src={vehicle.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, opacity: 0.2 }}>🚗</div>}
          </div>
          <div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 900, color: T.white, letterSpacing: -0.5, marginBottom: 6 }}>
              {vehicle.brand} {vehicle.model} <span style={{ color: T.gray5, fontWeight: 400, fontSize: 24 }}>{vehicle.year}</span>
            </h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
              {vehicle.category && <span style={{ padding: "4px 12px", borderRadius: 8, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: T.primary, fontSize: 14, fontWeight: 700 }}>{vehicle.category}</span>}
              {vehicle.transmission && <span style={{ fontSize: 15, color: T.gray5 }}>{vehicle.transmission}</span>}
              {vehicle.fuel_type && <span style={{ fontSize: 15, color: T.gray5 }}>{vehicle.fuel_type}</span>}
            </div>
            <span style={{ padding: "5px 14px", borderRadius: 22, fontSize: 13, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", background: st.bg, border: `1px solid ${st.border}`, color: st.color, marginTop: 10, display: "inline-block" }}>{st.label}</span>
          </div>
        </div>

        {/* Customer details – larger */}
        <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: "24px 0", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 900, color: T.white, letterSpacing: -0.3, marginBottom: 14 }}>Customer</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <InfoField label="Full Name" value={user.full_name || "Unknown"} />
            <InfoField label="Email" value={user.email} />
            <InfoField label="Phone" value={user.phone || "—"} />
            <InfoField label="Doc Verified" value={
              user.is_verified !== undefined ? (
                <span style={{ padding: "3px 12px", borderRadius: 14, fontSize: 13, fontWeight: 700, background: user.is_verified ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${user.is_verified ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, color: user.is_verified ? T.green : T.red, textTransform: "uppercase" }}>{user.is_verified ? "Verified" : "Unverified"}</span>
              ) : "—"
            } />
          </div>
        </div>

        {/* Booking details – larger */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 900, color: T.white, letterSpacing: -0.3, marginBottom: 14 }}>Booking Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <InfoField label="Dates" value={`${booking.start_date} → ${booking.end_date}`} />
            <InfoField label="Booking ID" value={`#${booking.id}`} />
            <InfoField label="Total Price" value={<span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: T.primary }}>Rs. {Number(booking.total_price).toLocaleString()}</span>} />
            <InfoField label="Advance (30%)" value={
              <div>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: T.white }}>
                  Rs. {advanceAmount.toLocaleString()}
                  {booking.advance_paid ? <span style={{ color: T.green, marginLeft: 10, fontSize: 14 }}>✓ Paid</span> : <span style={{ color: T.amber, marginLeft: 10, fontSize: 14 }}>⌛ Pending</span>}
                </span>
                {!booking.advance_paid && booking.payment_deadline && (
                  <div style={{ fontSize: 13, color: T.red, marginTop: 4 }}>Due by {new Date(booking.payment_deadline).toLocaleDateString()}</div>
                )}
              </div>
            } />
            <InfoField label="Payment Status" value={
              <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700, color: paySt.color, background: `rgba(${paySt.color === T.green ? "34,197,94" : paySt.color === T.primary ? "6,182,212" : "245,158,11"},0.1)`, border: `1px solid rgba(${paySt.color === T.green ? "34,197,94" : paySt.color === T.primary ? "6,182,212" : "245,158,11"},0.25)` }}>
                {paySt.label}
              </span>
            } />
          </div>
        </div>

        {/* Admin notes */}
        {booking.admin_notes && (
          <div style={{ marginBottom: 24, padding: "14px 18px", borderRadius: 12, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontSize: 15, color: T.amber }}>
            💬 Note: {booking.admin_notes}
          </div>
        )}

        {/* Actions – larger buttons */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12 }}>
          {booking.booking_status === "PENDING" && (
            <>
              <button onClick={() => { onApprove(booking.id); onClose(); }} disabled={pendingActions.approve} style={{ flex: 1, padding: "14px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 12, color: T.green, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>✓ Approve</button>
              <button onClick={() => { onOpenReject(booking.id); onClose(); }} disabled={pendingActions.reject} style={{ flex: 1, padding: "14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, color: T.red, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>✕ Reject</button>
            </>
          )}
          {booking.booking_status === "CONFIRMED" && (
            <button onClick={() => { onPickup(booking.id); onClose(); }} disabled={pendingActions.pickup} style={{ flex: 1, padding: "14px", background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)", borderRadius: 12, color: "#22d3ee", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>🚗 Mark Picked Up</button>
          )}
          {booking.booking_status === "ACTIVE" && (
            <button onClick={() => { if (window.confirm("Mark this rental as completed?")) { onComplete(booking.id); onClose(); } }} disabled={pendingActions.complete} style={{ flex: 1, padding: "14px", background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 12, color: T.indigo, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif" }}>✅ Complete Rental</button>
          )}
          {["COMPLETED", "CANCELLED", "REJECTED"].includes(booking.booking_status) && (
            <span style={{ fontSize: 16, color: T.gray5, fontStyle: "italic", width: "100%", textAlign: "center" }}>No actions available</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Info field helper (larger) ────────────────────────── */
function InfoField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: T.gray5, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: 16, color: T.white, fontWeight: 600, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function AdminBookings() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectBookingId, setRejectBookingId] = useState(null);
  const qc = useQueryClient();
  const listRef = useRef(null);

  // Fetch all bookings
  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["admin-bookings-all"],
    queryFn: () => api.get("/bookings/admin/all").then(r => r.data?.data || []),
    staleTime: 15_000,
  });

  // Fetch all users (admin only)
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/admin/users").then(r => r.data?.data || []),
    staleTime: 30_000,
  });

  // Build user map
  const userMap = useMemo(() => {
    const map = {};
    users.forEach(u => { map[u.id] = u; });
    return map;
  }, [users]);

  // Enrich bookings with user data
  const enrichedBookings = useMemo(() => {
    return raw.map(b => ({
      ...b,
      user: b.user && b.user.full_name ? b.user : userMap[b.user_id] || {},
    }));
  }, [raw, userMap]);

  // Apply filters & search
  const bookings = enrichedBookings.filter(b => {
    const matchStatus = filter === "All" || b.booking_status === filter;
    const user = b.user || {};
    const matchSearch = !search || (
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
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

  const handleRejectConfirm = (id, notes) => {
    rejectMutation.mutate({ id, notes });
  };

  const pendingCount = enrichedBookings.filter(b => b.booking_status === "PENDING").length;

  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 80, fontFamily: "'Rajdhani', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@700;900&family=JetBrains+Mono:wght@400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(148,163,184,0.4); }
        input:focus { outline: none; }
      `}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 5vw 80px" }}>

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
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.35 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} placeholder="Search by customer name, email, vehicle..." style={{ width: "100%", padding: "11px 14px 11px 42px", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: `1px solid ${searchFocused ? T.primary : T.border}`, borderRadius: 8, color: T.white, fontSize: 14, fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, transition: "border-color 0.2s" }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STATUS_FILTERS.map(s => {
              const st = BS[s];
              const active = filter === s;
              const count = s !== "All" ? enrichedBookings.filter(b => b.booking_status === s).length : enrichedBookings.length;
              return (
                <button key={s} onClick={() => setFilter(s)} style={{ padding: "7px 16px", fontSize: 12, fontWeight: 700, borderRadius: 24, border: `1px solid ${active ? (st?.border || "rgba(6,182,212,0.4)") : T.border}`, background: active ? (st?.bg || "rgba(6,182,212,0.12)") : "transparent", color: active ? (st?.color || T.primary) : T.gray3, cursor: "pointer", transition: "all 0.18s" }}>
                  {s === "All" ? "All" : (st?.label || s)}
                  {count > 0 && <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.8 }}>({count})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings List – enlarged cards */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 44, height: 44, border: `2px solid ${T.border}`, borderTopColor: T.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: T.gray3 }}>
            <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.2 }}>📋</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, color: T.white, marginBottom: 8 }}>No bookings found</div>
            {(filter !== "All" || search) && <button onClick={() => { setFilter("All"); setSearch(""); }} style={{ padding: "10px 24px", background: T.primary, border: "none", borderRadius: 8, color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontSize: 14, marginTop: 8 }}>Clear Filters</button>}
          </div>
        ) : (
          <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {bookings.map(b => {
              const st = BS[b.booking_status] || BS.PENDING;
              const paySt = PAYMENT_STYLE[b.payment_status] || PAYMENT_STYLE.pending;
              const vehicle = b.vehicle || {};
              const user = b.user || {};
              const advanceAmount = b.advance_amount || Math.round(Number(b.total_price) * 0.3);

              return (
                <div key={b.id} data-bcard
                  onClick={() => setSelectedBooking(b)}
                  style={{
                    padding: "28px 28px", borderRadius: 18,
                    background: T.bgCard, border: `1px solid ${T.border}`,
                    transition: "border-color 0.2s, background 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.25)"; e.currentTarget.style.background = "rgba(6,182,212,0.02)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bgCard; }}
                >
                  {/* Top row – larger */}
                  <div style={{ display: "flex", gap: 24, marginBottom: 22 }}>
                    {/* Thumbnail bigger */}
                    <div style={{ width: 130, height: 92, borderRadius: 12, overflow: "hidden", background: "#080c18", flexShrink: 0, border: `1px solid ${T.border}` }}>
                      {vehicle.thumbnail ? <img src={vehicle.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, opacity: 0.15 }}>🚗</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: T.white, letterSpacing: -0.5, marginBottom: 6 }}>
                            {vehicle.brand} {vehicle.model} <span style={{ color: T.gray5, fontWeight: 400, fontSize: 20 }}>{vehicle.year}</span>
                          </h3>
                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                            {vehicle.category && <span style={{ padding: "4px 12px", borderRadius: 8, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: T.primary, fontSize: 14, fontWeight: 700 }}>{vehicle.category}</span>}
                            {vehicle.transmission && <span style={{ fontSize: 15, color: T.gray5 }}>{vehicle.transmission}</span>}
                            {vehicle.fuel_type && <span style={{ fontSize: 15, color: T.gray5 }}>{vehicle.fuel_type}</span>}
                          </div>
                          {/* Owner details – larger */}
                          <div style={{ fontSize: 15, color: T.gray3, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                            <span>👤 <span style={{ color: T.white, fontWeight: 600 }}>{user.full_name || "Unknown"}</span></span>
                            <span>· {user.email}</span>
                            {user.phone && <span>· 📞 {user.phone}</span>}
                            {user.is_verified !== undefined && (
                              <span style={{ padding: "3px 10px", borderRadius: 14, fontSize: 12, fontWeight: 700, background: user.is_verified ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${user.is_verified ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, color: user.is_verified ? T.green : T.red, textTransform: "uppercase" }}>
                                {user.is_verified ? "✓ Verified" : "⚠ Unverified"}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 14, color: T.gray5, marginTop: 4 }}>📅 {b.start_date} → {b.end_date} · Booking #{b.id}</div>
                        </div>
                        <span style={{ padding: "7px 18px", borderRadius: 24, fontSize: 14, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", background: st.bg, border: `1px solid ${st.border}`, color: st.color, whiteSpace: "nowrap" }}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: pricing + inline actions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
                    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 14, color: T.gray5, marginBottom: 4 }}>Total</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 900, color: T.primary, letterSpacing: -0.5 }}>
                          Rs. {Number(b.total_price).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, color: T.gray5, marginBottom: 4 }}>Advance (30%)</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: T.white }}>
                          Rs. {advanceAmount.toLocaleString()}
                          {b.advance_paid ? <span style={{ color: T.green, marginLeft: 10, fontSize: 14 }}>✓ Paid</span> : <span style={{ color: T.amber, marginLeft: 10, fontSize: 14 }}>⌛ Pending</span>}
                        </div>
                        {!b.advance_paid && b.payment_deadline && <div style={{ fontSize: 13, color: T.red, marginTop: 3 }}>Due by {new Date(b.payment_deadline).toLocaleDateString()}</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, color: T.gray5, marginBottom: 4 }}>Payment</div>
                        <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700, color: paySt.color, background: `rgba(${paySt.color === T.green ? "34,197,94" : paySt.color === T.primary ? "6,182,212" : "245,158,11"},0.1)`, border: `1px solid rgba(${paySt.color === T.green ? "34,197,94" : paySt.color === T.primary ? "6,182,212" : "245,158,11"},0.25)` }}>
                          {paySt.label}
                        </span>
                      </div>
                    </div>

                    {/* Inline actions (stop propagation) */}
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
                      {b.booking_status === "PENDING" && (
                        <>
                          <button onClick={() => approveMutation.mutate(b.id)} disabled={approveMutation.isPending}
                            style={{ padding: "12px 24px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 12, color: T.green, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5, transition: "all 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(34,197,94,0.25)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(34,197,94,0.15)"}
                          >✓ Approve</button>
                          <button onClick={() => setRejectBookingId(b.id)} disabled={rejectMutation.isPending}
                            style={{ padding: "12px 24px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, color: T.red, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5 }}>
                            ✕ Reject
                          </button>
                        </>
                      )}
                      {b.booking_status === "CONFIRMED" && (
                        <button onClick={() => pickupMutation.mutate(b.id)} disabled={pickupMutation.isPending}
                          style={{ padding: "12px 24px", background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)", borderRadius: 12, color: "#22d3ee", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5 }}>
                          🚗 Mark Picked Up
                        </button>
                      )}
                      {b.booking_status === "ACTIVE" && (
                        <button onClick={() => { if (window.confirm("Mark this rental as completed?")) completeMutation.mutate(b.id); }} disabled={completeMutation.isPending}
                          style={{ padding: "12px 24px", background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 12, color: T.indigo, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5 }}>
                          ✅ Complete Rental
                        </button>
                      )}
                      {["COMPLETED", "CANCELLED", "REJECTED"].includes(b.booking_status) && (
                        <span style={{ fontSize: 14, color: T.gray5, fontStyle: "italic", alignSelf: "center" }}>No actions</span>
                      )}
                      <span style={{ fontSize: 13, color: T.gray5, fontStyle: "italic", alignSelf: "center" }}>Click for details</span>
                    </div>
                  </div>

                  {b.admin_notes && (
                    <div style={{ marginTop: 18, padding: "12px 18px", borderRadius: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", fontSize: 15, color: T.amber }}>
                      💬 Note: {b.admin_notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Booking Detail Modal (larger) */}
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onApprove={(id) => approveMutation.mutate(id)}
          onReject={(id, notes) => rejectMutation.mutate({ id, notes })}
          onPickup={(id) => pickupMutation.mutate(id)}
          onComplete={(id) => completeMutation.mutate(id)}
          pendingActions={{
            approve: approveMutation.isPending,
            reject: rejectMutation.isPending,
            pickup: pickupMutation.isPending,
            complete: completeMutation.isPending,
          }}
          onOpenReject={(id) => {
            setSelectedBooking(null);
            setRejectBookingId(id);
          }}
        />

        {/* Rejection Reason Modal */}
        {rejectBookingId !== null && (
          <RejectModal
            bookingId={rejectBookingId}
            onClose={() => setRejectBookingId(null)}
            onConfirm={handleRejectConfirm}
          />
        )}
      </div>
    </div>
  );
}