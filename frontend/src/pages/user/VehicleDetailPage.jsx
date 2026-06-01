/**
 * DriveX — VehicleDetailPage.jsx
 * Place at: src/pages/user/VehicleDetailPage.jsx
 * Route: /vehicles/:id
 * Public: anyone can view. Booking requires auth + verified document.
 */

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";

const T = {
  bg: "#05070f", bgCard: "#0d1117", bgCardHover: "#111827",
  border: "rgba(255,255,255,0.08)", borderFocus: "#06b6d4",
  primary: "#06b6d4", primaryDark: "#0891b2",
  white: "#ffffff", gray3: "#94a3b8", gray5: "#334155",
};

const STATUS_STYLE = {
  available:   { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.3)",   label: "Available" },
  reserved:    { color: "#06b6d4", bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.3)",   label: "Reserved" },
  rented:      { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   label: "Rented" },
  maintenance: { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)", label: "Maintenance" },
};

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [dates, setDates] = useState({ start_date: "", end_date: "" });
  const [focused, setFocused] = useState("");
  const pageRef = useRef(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => api.get(`/vehicles/${id}`).then(r => r.data?.data),
  });
  const v = res;

  useEffect(() => {
    if (!pageRef.current || isLoading) return;
    gsap.fromTo(pageRef.current.querySelectorAll("[data-reveal]"),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.75, ease: "power3.out", delay: 0.1 }
    );
  }, [isLoading]);

  const today = new Date().toISOString().split("T")[0];
  const days = dates.start_date && dates.end_date
    ? Math.max(Math.ceil((new Date(dates.end_date) - new Date(dates.start_date)) / 86400000), 1) : 0;
  const totalPrice = v && days ? (days * Number(v.price_per_day)) : 0;
  const advanceAmount = Math.round(totalPrice * 0.3);

  const booking = useMutation({
    mutationFn: () => api.post("/bookings/", {
      vehicle_id: Number(id),
      start_date: dates.start_date,
      end_date: dates.end_date,
    }),
    onSuccess: () => {
      toast.success("Booking submitted! Awaiting admin approval.", {
        style: { background: "#0d1117", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" },
      });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      navigate("/bookings");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Booking failed", {
        style: { background: "#0d1117", color: "#fff", border: "1px solid rgba(239,68,68,0.3)" },
      });
    },
  });

  const handleBook = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!dates.start_date || !dates.end_date) { toast.error("Please select both dates"); return; }
    if (new Date(dates.end_date) <= new Date(dates.start_date)) { toast.error("End date must be after start date"); return; }
    booking.mutate();
  };

  if (isLoading) return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 66, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, border: `2px solid ${T.border}`, borderTopColor: T.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 13, color: T.gray3, fontFamily: "'Rajdhani', sans-serif" }}>Loading vehicle...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!v) return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 66, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: T.gray3 }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🚗</div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, color: T.white, marginBottom: 8 }}>Vehicle Not Found</h2>
        <button onClick={() => navigate("/vehicles")} style={{ padding: "10px 24px", background: T.primary, border: "none", borderRadius: 6, color: "#000", fontWeight: 700, cursor: "pointer" }}>
          Back to Fleet
        </button>
      </div>
    </div>
  );

  const st = STATUS_STYLE[v.status] || STATUS_STYLE.available;

  return (
    <div ref={pageRef} style={{ background: T.bg, minHeight: "100vh", paddingTop: 66, fontFamily: "'Rajdhani', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@700;900&family=JetBrains+Mono:wght@400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes statusPulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)} 70%{box-shadow:0 0 0 6px transparent} }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5) sepia(1) saturate(2) hue-rotate(170deg); cursor: pointer; }
      `}</style>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 6vw 80px" }}>

        {/* Breadcrumb */}
        <div data-reveal style={{ opacity: 0, display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: 12, color: T.gray3 }}>
          <button onClick={() => navigate("/vehicles")} style={{ background: "none", border: "none", cursor: "pointer", color: T.gray3, padding: 0, fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Rajdhani', sans-serif" }}>
            ← Back to Fleet
          </button>
          <span style={{ opacity: 0.3 }}>/</span>
          <span style={{ color: T.primary }}>{v.brand} {v.model}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>

          {/* ── LEFT COLUMN ────────────────────────────────── */}
          <div>
            {/* Main image */}
            <div data-reveal style={{ opacity: 0, borderRadius: 14, overflow: "hidden", height: 380, background: "#080c18", marginBottom: 20, border: `1px solid ${T.border}`, position: "relative" }}>
              {v.thumbnail ? (
                <img src={v.thumbnail} alt={`${v.brand} ${v.model}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, opacity: 0.08 }}>🚗</div>
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,7,15,0.7) 0%, transparent 60%)" }} />
              {/* Status + Category badges */}
              <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 8 }}>
                <span style={{ padding: "4px 10px", borderRadius: 20, background: st.bg, border: `1px solid ${st.border}`, fontSize: 10, color: st.color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.color, animation: v.status === "available" ? "statusPulse 2s infinite" : "none" }} />
                  {st.label}
                </span>
                <span style={{ padding: "4px 10px", borderRadius: 20, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", fontSize: 10, color: T.primary, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", backdropFilter: "blur(8px)" }}>
                  {v.category}
                </span>
              </div>
            </div>

            {/* Title */}
            <div data-reveal style={{ opacity: 0, marginBottom: 20 }}>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 42, fontWeight: 900, color: T.white, letterSpacing: -1, lineHeight: 1, marginBottom: 6 }}>
                {v.brand} {v.model}
              </h1>
              <p style={{ fontSize: 14, color: T.gray3 }}>{v.year} · {v.category} · {v.transmission} · {v.fuel_type}</p>
            </div>

            {/* Specs grid */}
            <div data-reveal style={{ opacity: 0, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
              {[
                ["Category",     v.category],
                ["Year",         v.year],
                ["Transmission", v.transmission],
                ["Fuel Type",    v.fuel_type],
                ["Seats",        `${v.seats} seats`],
                ["Status",       v.status],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: "14px 16px", borderRadius: 8, background: T.bgCard, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10, color: T.gray5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.white, textTransform: "capitalize" }}>{String(value)}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {v.description && (
              <div data-reveal style={{ opacity: 0, padding: "18px 20px", borderRadius: 10, background: T.bgCard, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, color: T.primary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>About this vehicle</div>
                <p style={{ fontSize: 14, color: T.gray3, lineHeight: 1.7 }}>{v.description}</p>
              </div>
            )}

            {/* Note about documents */}
            <div data-reveal style={{ opacity: 0, marginTop: 16, padding: "14px 16px", borderRadius: 8, background: "rgba(6,182,212,0.05)", border: "1px dashed rgba(6,182,212,0.2)" }}>
              <p style={{ fontSize: 12, color: T.gray3, lineHeight: 1.6 }}>
                <span style={{ color: T.primary, fontWeight: 700 }}>ℹ️ Booking requires: </span>
                Verified driver's license. Upload your documents in the{" "}
                <Link to="/documents" style={{ color: T.primary, textDecoration: "none", fontWeight: 700 }}>Documents section</Link> first.
              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Booking Panel ──────────────── */}
          <div>
            <div data-reveal style={{ opacity: 0, padding: "26px 22px", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, position: "sticky", top: 84 }}>
              {/* Top border accent */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${T.primary}, transparent)`, borderRadius: "4px 4px 0 0", margin: "-26px -22px 22px" }} />

              {/* Price */}
              <div style={{ marginBottom: 20, paddingBottom: 18, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 42, fontWeight: 900, color: T.primary, letterSpacing: -1, lineHeight: 1 }}>
                  Rs. {Number(v.price_per_day).toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: T.gray3, marginTop: 2 }}>per day</div>
              </div>

              {/* Date pickers */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
                {[
                  { key: "start_date", label: "Start Date", min: today },
                  { key: "end_date",   label: "End Date",   min: dates.start_date || today },
                ].map(({ key, label, min }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: T.gray3, letterSpacing: 2, textTransform: "uppercase", marginBottom: 7, fontFamily: "'JetBrains Mono', monospace" }}>
                      {label}
                    </label>
                    <input type="date" min={min} value={dates[key]}
                      onChange={e => setDates(p => ({ ...p, [key]: e.target.value }))}
                      onFocus={() => setFocused(key)} onBlur={() => setFocused("")}
                      style={{
                        width: "100%", padding: "11px 12px", boxSizing: "border-box",
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${focused === key ? T.borderFocus : T.border}`,
                        borderRadius: 6, color: T.white, fontSize: 13.5,
                        fontFamily: "'Rajdhani', sans-serif", colorScheme: "dark",
                        outline: "none", transition: "border-color 0.2s",
                        boxShadow: focused === key ? "0 0 0 3px rgba(6,182,212,0.1)" : "none",
                      }} />
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              {days > 0 && (
                <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.12)", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: T.gray3, marginBottom: 6 }}>
                    <span>Rs. {Number(v.price_per_day).toLocaleString()} × {days} day{days > 1 ? "s" : ""}</span>
                    <span style={{ color: T.white }}>Rs. {totalPrice.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.gray5 }}>
                    <span>Advance (30%)</span>
                    <span style={{ color: T.primary, fontWeight: 700 }}>Rs. {advanceAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 1, background: T.border, margin: "10px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
                    <span style={{ color: T.gray3 }}>Total</span>
                    <span style={{ color: T.white }}>Rs. {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Book button */}
              <button onClick={handleBook}
                disabled={v.status !== "available" || booking.isPending}
                style={{
                  width: "100%", padding: "13px",
                  background: v.status === "available" ? T.primary : "rgba(255,255,255,0.06)",
                  border: "none", borderRadius: 6,
                  cursor: v.status !== "available" ? "not-allowed" : "pointer",
                  color: v.status === "available" ? "#000" : T.gray5,
                  fontSize: 14, fontWeight: 800,
                  fontFamily: "'Rajdhani', sans-serif", letterSpacing: 2,
                  textTransform: "uppercase", transition: "all 0.2s",
                  boxShadow: v.status === "available" ? "0 4px 24px rgba(6,182,212,0.3)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  opacity: booking.isPending ? 0.7 : 1,
                }}
                onMouseEnter={e => v.status === "available" && (e.currentTarget.style.boxShadow = "0 4px 40px rgba(6,182,212,0.5)")}
                onMouseLeave={e => e.currentTarget.style.boxShadow = v.status === "available" ? "0 4px 24px rgba(6,182,212,0.3)" : "none"}
              >
                {booking.isPending ? (
                  <><div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Submitting...</>
                ) : v.status !== "available" ? "Not Available"
                  : !isAuthenticated ? "Login to Book"
                  : "Request Booking"}
              </button>

              {!isAuthenticated && (
                <p style={{ textAlign: "center", fontSize: 12, color: T.gray5, marginTop: 10 }}>
                  <Link to="/login" style={{ color: T.primary, textDecoration: "none" }}>Login</Link> or{" "}
                  <Link to="/register" style={{ color: T.primary, textDecoration: "none" }}>register</Link> to book
                </p>
              )}

              {/* Info badges */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                {[
                  "🔒 Admin review required",
                  "💳 30% advance on approval",
                  "📋 Verified license required",
                ].map(txt => (
                  <div key={txt} style={{ fontSize: 11.5, color: T.gray5, display: "flex", alignItems: "center", gap: 6 }}>
                    {txt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}