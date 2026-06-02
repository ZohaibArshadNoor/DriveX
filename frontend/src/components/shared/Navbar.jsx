/**
 * DriveX — Navbar.jsx
 * Place at: src/components/shared/Navbar.jsx
 *
 * Updated: RBAC‑aware center links and dropdown for guests, customers, and admins.
 *          Keeps the same theme and styling.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useAuthStore } from "../../store/authStore";

const T = {
  bg:       "#05070f",
  bgSolid:  "rgba(5,7,15,0.97)",
  border:   "rgba(255,255,255,0.08)",
  primary:  "#06b6d4",
  white:    "#ffffff",
  gray3:    "#94a3b8",
  gray5:    "#334155",
};

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // GSAP entrance
  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, label }) => (
    <Link to={to} onClick={() => setMobileOpen(false)}
      style={{
        fontSize: 13, fontWeight: 600, letterSpacing: 1.5,
        textTransform: "uppercase", textDecoration: "none",
        color: isActive(to) ? T.primary : T.gray3,
        fontFamily: "'Rajdhani', sans-serif",
        transition: "color 0.2s",
        position: "relative", paddingBottom: 2,
      }}
      onMouseEnter={e => !isActive(to) && (e.target.style.color = T.white)}
      onMouseLeave={e => !isActive(to) && (e.target.style.color = T.gray3)}
    >
      {label}
      {isActive(to) && (
        <span style={{
          position: "absolute", bottom: -2, left: 0, right: 0,
          height: 1, background: T.primary, borderRadius: 2,
        }} />
      )}
    </Link>
  );

  // ── Quick links inside dropdown (same for mobile menu) ──────────────────
  const dropdownLinks = [];
  if (user?.role === "customer") {
    dropdownLinks.push(
      { to: "/dashboard", label: "Dashboard", icon: "📊" },
      { to: "/bookings", label: "My Bookings", icon: "📋" },
      { to: "/documents", label: "My Documents", icon: "🪪" }
    );
  } else if (user?.role === "admin") {
    dropdownLinks.push(
      { to: "/admin", label: "Dashboard", icon: "📊" },
      { to: "/admin/bookings", label: "Bookings", icon: "📋" },
      { to: "/admin/vehicles", label: "Vehicles", icon: "🚗" },
      { to: "/admin/users", label: "Users", icon: "👥" },
      { to: "/admin/documents", label: "Documents", icon: "🪪" }
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Barlow+Condensed:wght@900&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <nav ref={navRef} style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: "0 5vw",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? T.bgSolid : "transparent",
        borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        transition: "background 0.4s, border-color 0.4s, backdrop-filter 0.4s",
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 26, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1,
          }}>
            <span style={{ color: T.white }}>Drive</span>
            <span style={{ color: T.primary }}>X</span>
          </div>
          <div style={{
            width: 6, height: 6, background: T.primary,
            borderRadius: "50%", marginBottom: 8,
            animation: "blink 2s ease-in-out infinite",
          }} />
        </Link>

        {/* ── Desktop Links (center) ──────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="desktop-nav">

          {/* Everyone sees Fleet */}
          <NavLink to="/vehicles" label="Fleet" />

          {/* Customer links */}
          {isAuthenticated && user?.role === "customer" && (
            <>
              <NavLink to="/dashboard" label="Dashboard" />
              <NavLink to="/bookings" label="My Bookings" />
              <NavLink to="/documents" label="My Documents" />
            </>
          )}

          {/* Admin links */}
          {isAuthenticated && user?.role === "admin" && (
            <>
              <NavLink to="/admin" label="Dashboard" />
              <NavLink to="/admin/bookings" label="Bookings" />
              <NavLink to="/admin/vehicles" label="Vehicles" />
              <NavLink to="/admin/users" label="Users" />
              <NavLink to="/admin/documents" label="Documents" />
            </>
          )}
        </div>

        {/* ── Desktop Auth / User menu ────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="desktop-nav">
          {isAuthenticated ? (
            <div ref={userMenuRef} style={{ position: "relative" }}>
              {/* User button */}
              <button
                onClick={() => setUserMenuOpen(p => !p)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 14px 6px 10px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${userMenuOpen ? T.primary : T.border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  color: T.white,
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={e => !userMenuOpen && (e.currentTarget.style.borderColor = T.white)}
                onMouseLeave={e => !userMenuOpen && (e.currentTarget.style.borderColor = T.border)}
              >
                {/* Person SVG icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" />
                </svg>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  fontFamily: "'Rajdhani', sans-serif",
                  color: T.white,
                }}>
                  {user?.full_name?.split(" ")[0]}
                </span>
                {user?.role === "admin" && (
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 10,
                    background: "rgba(6,182,212,0.15)", border: `1px solid ${T.primary}`,
                    color: T.primary, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                  }}>Admin</span>
                )}
                {/* Chevron */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.gray3} strokeWidth="2" style={{ transition: "transform 0.2s", transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 280,
                  background: "rgba(5,7,15,0.97)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "18px 20px",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                  zIndex: 1001,
                  fontFamily: "'Rajdhani', sans-serif",
                }}>
                  {/* User info */}
                  <div style={{
                    borderBottom: `1px solid ${T.border}`,
                    paddingBottom: 14,
                    marginBottom: 12,
                  }}>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: T.white,
                      wordBreak: "break-word",
                      lineHeight: 1.3,
                    }}>
                      {user?.full_name}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: T.gray3,
                      fontFamily: "'JetBrains Mono', monospace",
                      marginTop: 4,
                      wordBreak: "break-word",
                    }}>
                      {user?.email}
                    </div>
                    {user?.role === "admin" && (
                      <div style={{
                        fontSize: 11,
                        color: T.primary,
                        marginTop: 6,
                        textTransform: "uppercase",
                        fontWeight: 700,
                        letterSpacing: 0.5,
                      }}>
                        Administrator
                      </div>
                    )}
                  </div>

                  {/* Page links – same as center for the user's role */}
                  {dropdownLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 6,
                        marginBottom: 4,
                        textDecoration: "none",
                        color: T.gray3,
                        fontSize: 15,
                        fontWeight: 600,
                        transition: "background 0.2s, color 0.2s",
                        background: "transparent",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(6,182,212,0.08)";
                        e.currentTarget.style.color = T.white;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = T.gray3;
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{link.icon}</span> {link.label}
                    </Link>
                  ))}

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "12px 0",
                      marginTop: 4,
                      background: "none",
                      border: "none",
                      color: T.gray3,
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontFamily: "'Rajdhani', sans-serif",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = T.red}
                    onMouseLeave={e => e.currentTarget.style.color = T.gray3}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" style={{
                fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                color: T.gray3, textDecoration: "none", fontFamily: "'Rajdhani', sans-serif",
                padding: "7px 18px", border: `1px solid ${T.border}`, borderRadius: 4,
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.target.style.color = T.white; e.target.style.borderColor = T.white; }}
                onMouseLeave={e => { e.target.style.color = T.gray3; e.target.style.borderColor = T.border; }}
              >Login</Link>
              <Link to="/register" style={{
                fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                color: "#000", textDecoration: "none", fontFamily: "'Rajdhani', sans-serif",
                padding: "8px 20px", background: T.primary, borderRadius: 4,
                transition: "box-shadow 0.2s",
              }}
                onMouseEnter={e => e.target.style.boxShadow = "0 0 24px rgba(6,182,212,0.5)"}
                onMouseLeave={e => e.target.style.boxShadow = "none"}
              >Register</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMobileOpen(p => !p)}
          style={{
            display: "none", background: "none", border: "none",
            cursor: "pointer", padding: 8, color: T.white,
          }}
          className="mobile-menu-btn"
        >
          <div style={{ width: 22, height: 2, background: mobileOpen ? T.primary : T.white, marginBottom: 5, transition: "all 0.3s", transform: mobileOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
          <div style={{ width: 22, height: 2, background: T.white, marginBottom: 5, opacity: mobileOpen ? 0 : 1, transition: "opacity 0.3s" }} />
          <div style={{ width: 22, height: 2, background: mobileOpen ? T.primary : T.white, transition: "all 0.3s", transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, zIndex: 999,
          background: T.bgSolid, borderBottom: `1px solid ${T.border}`,
          padding: "24px 5vw 32px",
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Link to="/vehicles" onClick={() => setMobileOpen(false)}
              style={{ color: T.white, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
              Fleet
            </Link>

            {isAuthenticated && user?.role === "customer" && (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                  style={{ color: T.white, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
                  Dashboard
                </Link>
                <Link to="/bookings" onClick={() => setMobileOpen(false)}
                  style={{ color: T.white, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
                  My Bookings
                </Link>
                <Link to="/documents" onClick={() => setMobileOpen(false)}
                  style={{ color: T.white, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
                  My Documents
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === "admin" && (
              <>
                <Link to="/admin" onClick={() => setMobileOpen(false)}
                  style={{ color: T.white, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
                  Dashboard
                </Link>
                <Link to="/admin/bookings" onClick={() => setMobileOpen(false)}
                  style={{ color: T.white, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
                  Bookings
                </Link>
                <Link to="/admin/vehicles" onClick={() => setMobileOpen(false)}
                  style={{ color: T.white, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
                  Vehicles
                </Link>
                <Link to="/admin/users" onClick={() => setMobileOpen(false)}
                  style={{ color: T.white, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
                  Users
                </Link>
                <Link to="/admin/documents" onClick={() => setMobileOpen(false)}
                  style={{ color: T.white, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
                  Documents
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <button onClick={handleLogout}
                style={{ color: T.primary, background: "none", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 700, textAlign: "left" }}>
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  style={{ color: T.white, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  style={{ color: T.primary, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
                  Register →
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}