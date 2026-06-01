/**
 * DriveX — VehiclesPage.jsx  (PUBLIC — no login required)
 * Place at: src/pages/user/VehiclesPage.jsx  OR  src/pages/public/VehiclesPage.jsx
 *
 * Features:
 * - No auth required — guests can browse freely
 * - Filters: category, fuel, transmission, price range
 * - GSAP card stagger on load + filter change
 * - Clicking "Book Now" redirects to login if not authenticated
 * - Connects to GET /api/v1/vehicles/
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";

gsap.registerPlugin(ScrollTrigger);

const T = {
  bg: "#05070f", bgCard: "#0d1117", bgCardHover: "#111827",
  border: "rgba(255,255,255,0.08)", borderHover: "#06b6d4",
  primary: "#06b6d4", primaryDark: "#0891b2",
  white: "#ffffff", gray1: "#f8fafc", gray3: "#94a3b8", gray5: "#334155",
  green: "#22c55e", available: "rgba(34,197,94,0.12)", availableBorder: "rgba(34,197,94,0.3)",
  reserved: "rgba(6,182,212,0.12)", reservedBorder: "rgba(6,182,212,0.3)",
};

const CATEGORIES = ["All", "Sedan", "SUV", "Hatchback", "Luxury", "Van"];
const FUELS      = ["All", "Petrol", "Diesel", "Electric", "Hybrid"];
const TRANS      = ["All", "Automatic", "Manual"];

const STATUS_STYLE = {
  available:   { bg: T.available,   border: T.availableBorder, color: T.green,     label: "Available" },
  reserved:    { bg: T.reserved,    border: T.reservedBorder,  color: T.primary,    label: "Reserved"  },
  rented:      { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", color: "#ef4444", label: "Rented" },
  maintenance: { bg: "rgba(148,163,184,0.1)", border: T.border, color: T.gray3,    label: "Maintenance" },
};

function Skeleton() {
  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${T.border}`,
      borderRadius: 14, overflow: "hidden",
      animation: "shimmer 1.6s ease-in-out infinite",
    }}>
      <div style={{ height: 210, background: "rgba(255,255,255,0.04)" }} />
      <div style={{ padding: "20px 22px 24px" }}>
        <div style={{ height: 20, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: 10, width: "60%" }} />
        <div style={{ height: 14, background: "rgba(255,255,255,0.04)", borderRadius: 4, marginBottom: 16, width: "40%" }} />
        <div style={{ height: 36, background: "rgba(255,255,255,0.04)", borderRadius: 4 }} />
      </div>
      <style>{`@keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
    </div>
  );
}

function VehicleCard({ vehicle, onBook }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const status = STATUS_STYLE[vehicle.status] || STATUS_STYLE.available;

  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? T.bgCardHover : T.bgCard,
        border: `1px solid ${hovered ? T.borderHover : T.border}`,
        borderRadius: 14, overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? "0 24px 64px rgba(6,182,212,0.12)" : "none",
        display: "flex", flexDirection: "column",
      }}>

      {/* Image */}
      <div style={{ position: "relative", height: 210, overflow: "hidden", background: "#080c18" }}>
        {vehicle.thumbnail ? (
          <img
            src={vehicle.thumbnail}
            alt={`${vehicle.brand} ${vehicle.model}`}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
              transform: hovered ? "scale(1.08)" : "scale(1)",
            }}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: "100%", height: "100%", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 48, opacity: 0.15,
          }}>🚗</div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(13,17,23,0.8) 0%, transparent 50%)",
        }} />

        {/* Status badge */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: status.bg, border: `1px solid ${status.border}`,
          borderRadius: 20, padding: "4px 10px",
          fontSize: 10, color: status.color, fontWeight: 700,
          letterSpacing: 1, textTransform: "uppercase",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: "50%",
            background: status.color,
            animation: vehicle.status === "available" ? "statusPulse 2s ease infinite" : "none",
          }} />
          {status.label}
        </div>

        {/* Category badge */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
          borderRadius: 20, padding: "4px 10px",
          fontSize: 10, color: T.primary, fontWeight: 700,
          letterSpacing: 1, textTransform: "uppercase",
          backdropFilter: "blur(8px)",
        }}>{vehicle.category}</div>

        {/* Price overlay on hover */}
        <div style={{
          position: "absolute", bottom: 12, right: 12,
          opacity: hovered ? 1 : 0, transition: "opacity 0.3s",
        }}>
          <span style={{
            fontSize: 22, fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, color: T.white,
          }}>Rs. {vehicle.price_per_day}</span>
          <span style={{ fontSize: 11, color: T.gray3 }}>/day</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 20, fontWeight: 900, color: T.white,
            letterSpacing: -0.3, marginBottom: 3,
          }}>
            {vehicle.brand} {vehicle.model}
          </h3>
          <div style={{ fontSize: 12, color: T.gray3 }}>
            {vehicle.year} · {vehicle.transmission} · {vehicle.fuel_type}
          </div>
        </div>

        {/* Specs row */}
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16,
        }}>
          {[`${vehicle.seats} Seats`, vehicle.fuel_type, vehicle.transmission].map(tag => (
            <span key={tag} style={{
              padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
              color: T.gray3, letterSpacing: 0.5, textTransform: "uppercase",
            }}>{tag}</span>
          ))}
        </div>

        {/* Price + CTA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <div>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 26, fontWeight: 900, color: T.primary, letterSpacing: -0.5,
            }}>Rs. {vehicle.price_per_day}</span>
            <span style={{ fontSize: 11, color: T.gray3 }}> /day</span>
          </div>

          <button
            onClick={() => onBook(vehicle)}
            disabled={vehicle.status !== "available"}
            style={{
              padding: "9px 20px", fontSize: 12, fontWeight: 700,
              fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1,
              textTransform: "uppercase", border: "none", borderRadius: 6,
              cursor: vehicle.status === "available" ? "pointer" : "not-allowed",
              background: vehicle.status === "available"
                ? `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`
                : "rgba(255,255,255,0.06)",
              color: vehicle.status === "available" ? "#000" : T.gray5,
              transition: "all 0.2s",
              boxShadow: vehicle.status === "available" && hovered
                ? "0 4px 20px rgba(6,182,212,0.4)" : "none",
            }}
          >
            {vehicle.status === "available" ? "Book Now" : status.label}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 16px", fontSize: 12, fontWeight: 600,
      fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.8,
      textTransform: "uppercase", borderRadius: 4, border: `1px solid ${active ? T.primary : T.border}`,
      background: active ? "rgba(6,182,212,0.15)" : "transparent",
      color: active ? T.primary : T.gray3, cursor: "pointer",
      transition: "all 0.2s",
    }}
      onMouseEnter={e => !active && (e.currentTarget.style.borderColor = T.gray3)}
      onMouseLeave={e => !active && (e.currentTarget.style.borderColor = T.border)}
    >
      {label}
    </button>
  );
}

export default function VehiclesPage() {
  const [category, setCategory]   = useState("All");
  const [fuel, setFuel]           = useState("All");
  const [trans, setTrans]         = useState("All");
  const [search, setSearch]       = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const gridRef = useRef(null);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.get("/vehicles/").then(r => r.data.data),
    staleTime: 60_000,
  });

  // Client-side filter
  const vehicles = raw.filter(v => {
    if (category !== "All" && v.category?.toLowerCase() !== category.toLowerCase()) return false;
    if (fuel !== "All" && v.fuel_type?.toLowerCase() !== fuel.toLowerCase()) return false;
    if (trans !== "All" && v.transmission?.toLowerCase() !== trans.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return v.brand?.toLowerCase().includes(q) || v.model?.toLowerCase().includes(q);
    }
    return true;
  });

  // GSAP stagger on filter change
  useEffect(() => {
    if (!gridRef.current || isLoading) return;
    const cards = gridRef.current.querySelectorAll("[data-vehicle-card]");
    gsap.fromTo(cards,
      { opacity: 0, y: 30, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.5, ease: "power2.out" }
    );
  }, [vehicles.length, category, fuel, trans, search, isLoading]);

  const handleBook = (vehicle) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/vehicles/${vehicle.id}` } });
      return;
    }
    navigate(`/vehicles/${vehicle.id}`);
  };

  return (
    <div style={{
      background: T.bg, minHeight: "100vh",
      paddingTop: 80, fontFamily: "'Rajdhani', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,900;1,900&family=JetBrains+Mono:wght@400&display=swap');
        @keyframes statusPulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)} 50%{box-shadow:0 0 0 5px transparent} }
        input::placeholder { color: rgba(148,163,184,0.5); }
        input:focus { outline: none; }
      `}</style>

      {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: `1px solid ${T.border}`,
        padding: "40px 6vw 36px",
        background: `linear-gradient(180deg, rgba(6,182,212,0.03), transparent)`,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: T.primary, letterSpacing: 4, fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>
            Our Fleet
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900,
              color: T.white, textTransform: "uppercase", letterSpacing: -0.5, lineHeight: 1,
            }}>
              Browse <span style={{ color: T.primary, fontStyle: "italic" }}>All</span> Vehicles
            </h1>
            <div style={{ fontSize: 12, color: T.gray3 }}>
              <span style={{ color: T.white, fontWeight: 700 }}>{vehicles.length}</span> vehicles found
              {!isAuthenticated && (
                <span style={{ marginLeft: 12, color: T.primary }}>
                  · <Link to="/login" style={{ color: T.primary, textDecoration: "none", fontWeight: 700 }}>Login to book</Link>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 6vw 80px" }}>

        {/* ── FILTERS ──────────────────────────────────────────────────────────── */}
        <div style={{
          marginBottom: 36,
          padding: "24px",
          background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12,
        }}>
          {/* Search bar */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              fontSize: 16, opacity: 0.4,
            }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search brand or model..."
              style={{
                width: "100%", padding: "11px 14px 11px 40px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${searchFocused ? T.primary : T.border}`,
                borderRadius: 6, color: T.white, fontSize: 14,
                fontFamily: "'Rajdhani', sans-serif", fontWeight: 500,
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Filter rows */}
          {[
            { label: "Category", items: CATEGORIES, state: category, set: setCategory },
            { label: "Fuel",     items: FUELS,      state: fuel,     set: setFuel },
            { label: "Trans",    items: TRANS,      state: trans,    set: setTrans },
          ].map(({ label, items, state, set }) => (
            <div key={label} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{
                fontSize: 10, color: T.gray5, fontWeight: 700, letterSpacing: 2,
                textTransform: "uppercase", minWidth: 52,
              }}>{label}</span>
              {items.map(item => (
                <FilterChip key={item} label={item} active={state === item} onClick={() => set(item)} />
              ))}
              {state !== "All" && (
                <button onClick={() => set("All")} style={{
                  fontSize: 10, color: T.gray3, background: "none", border: "none",
                  cursor: "pointer", textDecoration: "underline", padding: "0 4px",
                }}>clear</button>
              )}
            </div>
          ))}
        </div>

        {/* ── GRID ────────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : vehicles.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 20px",
            color: T.gray3,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🚗</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: T.white, marginBottom: 8 }}>
              No Vehicles Found
            </div>
            <div style={{ fontSize: 14, marginBottom: 24 }}>Try adjusting your filters</div>
            <button onClick={() => { setCategory("All"); setFuel("All"); setTrans("All"); setSearch(""); }}
              style={{
                padding: "10px 24px", background: T.primary, border: "none",
                borderRadius: 6, color: "#000", fontWeight: 700, cursor: "pointer",
                fontFamily: "'Rajdhani', sans-serif", fontSize: 13, letterSpacing: 1,
              }}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div ref={gridRef}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}
          >
            {vehicles.map(v => (
              <div key={v.id} data-vehicle-card>
                <VehicleCard vehicle={v} onBook={handleBook} />
              </div>
            ))}
          </div>
        )}

        {/* Guest nudge banner */}
        {!isAuthenticated && vehicles.length > 0 && (
          <div style={{
            marginTop: 48,
            padding: "24px 32px",
            background: "rgba(6,182,212,0.06)",
            border: "1px solid rgba(6,182,212,0.2)",
            borderRadius: 12,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.white, marginBottom: 4 }}>
                Ready to book your perfect ride?
              </div>
              <div style={{ fontSize: 13, color: T.gray3 }}>
                Create a free account to start booking. Takes 30 seconds.
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Link to="/login" style={{
                padding: "9px 20px", fontSize: 12, fontWeight: 700,
                border: `1px solid ${T.border}`, borderRadius: 6,
                color: T.white, textDecoration: "none",
                fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1, textTransform: "uppercase",
              }}>Login</Link>
              <Link to="/register" style={{
                padding: "9px 20px", fontSize: 12, fontWeight: 700,
                background: T.primary, border: "none", borderRadius: 6,
                color: "#000", textDecoration: "none",
                fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1, textTransform: "uppercase",
              }}>Register Free →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}