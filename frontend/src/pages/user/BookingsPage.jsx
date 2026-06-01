/**
 * DriveX — BookingsPage.jsx
 * Place at: src/pages/user/BookingsPage.jsx
 * Route: /bookings  (protected — customer)
 *
 * ENLARGED LAYOUT – full width, bigger text, detailed booking cards
 * Shows: vehicle thumbnail, specs, payment info, deadline, admin notes, actions
 */

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import api from "../../api/axiosInstance";

// ─── THEME (improved contrast, larger everything) ────────────────────────────
const T = {
  bg: "#05070f",
  bgCard: "#0a0f1a",
  border: "rgba(255,255,255,0.10)",
  primary: "#06b6d4",
  white: "#ffffff",
  gray3: "#cbd5e1",       // readable gray
  gray5: "#64748b",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  indigo: "#818cf8",
};

// Booking status style
const BS = {
  PENDING:                  { color: T.amber,   bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  label: "Pending Review" },
  APPROVED_WAITING_ADVANCE: { color: T.primary, bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.25)",   label: "Pay Advance" },
  CONFIRMED:                { color: T.green,   bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   label: "Confirmed" },
  ACTIVE:                   { color: "#22d3ee", bg: "rgba(34,211,238,0.1)",  border: "rgba(34,211,238,0.25)",  label: "Active" },
  COMPLETED:                { color: T.indigo,  bg: "rgba(129,140,248,0.1)",  border: "rgba(129,140,248,0.25)",  label: "Completed" },
  CANCELLED:                { color: T.red,     bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   label: "Cancelled" },
  REJECTED:                 { color: "#dc2626", bg: "rgba(220,38,38,0.1)",   border: "rgba(220,38,38,0.25)",   label: "Rejected" },
};

// Payment status style
const PAYMENT_STYLE = {
  unpaid:    { color: T.amber, label: "Unpaid" },
  advance:   { color: T.primary, label: "Advance Paid" },
  completed: { color: T.green, label: "Fully Paid" },
  refunded:  { color: T.red, label: "Refunded" },
};

const STATUS_FILTERS = ["All", "PENDING", "APPROVED_WAITING_ADVANCE", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED", "REJECTED"];

export default function BookingsPage() {
  const [filter, setFilter] = useState("All");
  const qc = useQueryClient();
  const navigate = useNavigate();
  const listRef = useRef(null);

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => api.get("/bookings/").then(r => r.data?.data || []),
    staleTime: 30_000,
  });

  const bookings = filter === "All" ? raw : raw.filter(b => b.booking_status === filter);

  // GSAP animation on filter change
  useEffect(() => {
    if (!listRef.current || isLoading) return;
    const cards = listRef.current.querySelectorAll("[data-bcard]");
    gsap.fromTo(cards,
      { opacity: 0, y: 16, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.5, ease: "power2.out" }
    );
  }, [bookings.length, filter, isLoading]);

  const cancel = useMutation({
    mutationFn: (id) => api.delete(`/bookings/${id}`),
    onSuccess: () => {
      toast.success("Booking cancelled", { style: { background: "#0d1117", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } });
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      qc.invalidateQueries({ queryKey: ["customer-dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to cancel"),
  });

  const payAdvance = useMutation({
    mutationFn: (id) => api.post(`/payments/${id}/pay-advance`),
    onSuccess: () => {
      toast.success("Advance payment successful! Booking confirmed.", { style: { background: "#0d1117", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } });
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      qc.invalidateQueries({ queryKey: ["customer-dashboard"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Payment failed"),
  });

  return (
    <div style={{
      background: T.bg,
      minHeight: "100vh",
      paddingTop: 80,
      fontFamily: "'Rajdhani', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@700;900&family=JetBrains+Mono:wght@400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 8vw 80px" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 13, color: T.primary, letterSpacing: 4, fontWeight: 700, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
            My Rentals
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(36px, 5vw, 52px)",
              fontWeight: 900,
              color: T.white,
              letterSpacing: -0.8,
              lineHeight: 1,
            }}>
              My Bookings
            </h1>
            <button onClick={() => navigate("/vehicles")} style={{
              padding: "14px 28px",
              background: T.primary,
              border: "none",
              borderRadius: 10,
              color: "#000",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: 1,
              boxShadow: "0 4px 24px rgba(6,182,212,0.3)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 40px rgba(6,182,212,0.55)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(6,182,212,0.3)"}
            >+ New Booking</button>
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div style={{
          marginBottom: 32,
          padding: "18px 20px",
          background: T.bgCard,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}>
          {STATUS_FILTERS.map(s => {
            const st = BS[s];
            const active = filter === s;
            return (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 24,
                border: `1px solid ${active ? (st?.border || "rgba(6,182,212,0.4)") : T.border}`,
                background: active ? (st?.bg || "rgba(6,182,212,0.12)") : "transparent",
                color: active ? (st?.color || T.primary) : T.gray3,
                cursor: "pointer",
                transition: "all 0.18s",
                letterSpacing: 0.5,
                textTransform: s === "All" ? "capitalize" : "none",
              }}>
                {s === "All" ? "All" : (st?.label || s)}
                {s !== "All" && raw.filter(b => b.booking_status === s).length > 0 && (
                  <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.85 }}>
                    ({raw.filter(b => b.booking_status === s).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Bookings list ───────────────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 44, height: 44, border: `2px solid ${T.border}`, borderTopColor: T.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: T.gray3 }}>
            <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.2 }}>📋</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, color: T.white, marginBottom: 8 }}>
              {filter === "All" ? "No bookings yet" : `No ${BS[filter]?.label || filter} bookings`}
            </div>
            <div style={{ fontSize: 15, marginBottom: 20 }}>
              {filter !== "All" ? (
                <button onClick={() => setFilter("All")} style={{ color: T.primary, background: "none", border: "none", cursor: "pointer", fontSize: 15, fontFamily: "'Rajdhani', sans-serif" }}>
                  Clear filter
                </button>
              ) : null}
            </div>
            <button onClick={() => navigate("/vehicles")} style={{
              padding: "12px 28px",
              background: T.primary,
              border: "none",
              borderRadius: 10,
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 16,
            }}>
              Browse Fleet →
            </button>
          </div>
        ) : (
          <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {bookings.map(b => {
              const st = BS[b.booking_status] || BS.PENDING;
              const paySt = PAYMENT_STYLE[b.payment_status] || PAYMENT_STYLE.unpaid;
              const vehicle = b.vehicle || {};
              const canCancel = ["PENDING", "APPROVED_WAITING_ADVANCE", "CONFIRMED"].includes(b.booking_status);
              const canPay = b.booking_status === "APPROVED_WAITING_ADVANCE";
              const advanceAmount = b.advance_amount || Math.round(Number(b.total_price) * 0.3);

              return (
                <div key={b.id} data-bcard style={{
                  padding: "28px 24px",
                  borderRadius: 16,
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  transition: "border-color 0.2s, background 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.3)"; e.currentTarget.style.background = "rgba(6,182,212,0.02)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bgCard; }}
                >
                  {/* ── Top row: thumbnail + main info ──────────────────────── */}
                  <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                    {/* Vehicle image */}
                    <div style={{
                      width: 120,
                      height: 85,
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "#080c18",
                      border: `1px solid ${T.border}`,
                      flexShrink: 0,
                    }}>
                      {vehicle.thumbnail ? (
                        <img src={vehicle.thumbnail} alt={`${vehicle.brand} ${vehicle.model}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, opacity: 0.2 }}>🚗</div>
                      )}
                    </div>

                    {/* Vehicle details */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <h3 style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: 28,
                            fontWeight: 900,
                            color: T.white,
                            letterSpacing: -0.5,
                            marginBottom: 6,
                          }}>
                            {vehicle.brand} {vehicle.model}{" "}
                            <span style={{ color: T.gray3, fontWeight: 400, fontSize: 20 }}>{vehicle.year}</span>
                          </h3>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                            {vehicle.category && (
                              <span style={{ padding: "4px 12px", borderRadius: 8, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: T.primary, fontSize: 13, fontWeight: 700 }}>
                                {vehicle.category}
                              </span>
                            )}
                            {vehicle.transmission && <span style={{ fontSize: 14, color: T.gray3 }}>{vehicle.transmission}</span>}
                            {vehicle.fuel_type && <span style={{ fontSize: 14, color: T.gray3 }}>{vehicle.fuel_type}</span>}
                            {vehicle.seats && <span style={{ fontSize: 14, color: T.gray3 }}>{vehicle.seats} seats</span>}
                          </div>
                          <div style={{ fontSize: 15, color: T.gray3 }}>
                            📅 {b.start_date} → {b.end_date}
                          </div>
                        </div>
                        {/* Status badge */}
                        <span style={{
                          padding: "6px 16px",
                          borderRadius: 24,
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: 0.8,
                          textTransform: "uppercase",
                          background: st.bg,
                          border: `1px solid ${st.border}`,
                          color: st.color,
                        }}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Bottom row: price breakdown, payment info, actions ──── */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
                    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 14, color: T.gray3, marginBottom: 4 }}>Total Price</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: T.primary, letterSpacing: -0.5 }}>
                          Rs. {Number(b.total_price).toLocaleString()}
                        </div>
                      </div>
                      {advanceAmount > 0 && (
                        <div>
                          <div style={{ fontSize: 14, color: T.gray3, marginBottom: 4 }}>Advance (30%)</div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: T.white }}>
                            Rs. {advanceAmount.toLocaleString()}
                            {b.advance_paid ? (
                              <span style={{ color: T.green, marginLeft: 10, fontSize: 13 }}>✓ Paid</span>
                            ) : (
                              <span style={{ color: T.amber, marginLeft: 10, fontSize: 13 }}>⌛ Pending</span>
                            )}
                          </div>
                          {!b.advance_paid && b.payment_deadline && (
                            <div style={{ fontSize: 13, color: T.red, marginTop: 4 }}>
                              Due by {new Date(b.payment_deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 14, color: T.gray3, marginBottom: 4 }}>Payment</div>
                        <span style={{
                          padding: "4px 14px",
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 700,
                          background: `rgba(${paySt.color === T.green ? "34,197,94" : paySt.color === T.primary ? "6,182,212" : "245,158,11"}, 0.1)`,
                          border: `1px solid rgba(${paySt.color === T.green ? "34,197,94" : paySt.color === T.primary ? "6,182,212" : "245,158,11"}, 0.25)`,
                          color: paySt.color,
                        }}>
                          {paySt.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {canPay && (
                        <button onClick={() => payAdvance.mutate(b.id)}
                          disabled={payAdvance.isPending}
                          style={{
                            padding: "12px 22px",
                            background: T.green,
                            border: "none",
                            borderRadius: 10,
                            color: "#000",
                            fontSize: 15,
                            fontWeight: 800,
                            cursor: "pointer",
                            fontFamily: "'Rajdhani', sans-serif",
                            letterSpacing: 0.8,
                            transition: "all 0.2s",
                            boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
                          }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 28px rgba(34,197,94,0.5)"}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(34,197,94,0.3)"}
                        >
                          Pay Advance (Rs. {advanceAmount.toLocaleString()})
                        </button>
                      )}
                      {canCancel && (
                        <button onClick={() => { if (window.confirm("Cancel this booking?")) cancel.mutate(b.id); }}
                          disabled={cancel.isPending}
                          style={{
                            padding: "12px 22px",
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: 10,
                            color: T.red,
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "'Rajdhani', sans-serif",
                          }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Admin notes */}
                  {b.admin_notes && (
                    <div style={{
                      marginTop: 16,
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: "rgba(245,158,11,0.07)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      fontSize: 14,
                      color: T.amber,
                    }}>
                      💬 Admin note: {b.admin_notes}
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