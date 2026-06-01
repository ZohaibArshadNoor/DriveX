/**
 * DriveX — Navbar.jsx
 * Place at: src/components/shared/Navbar.jsx
 * 
 * Features:
 * - Transparent on hero, solid on scroll
 * - GSAP entrance animation
 * - Active route highlighting
 * - Responsive mobile menu
 * - Magnetic logo
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Barlow+Condensed:wght@900&display=swap');
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

        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

        {/* Desktop Links */}
        <div style={{
          display: "flex", alignItems: "center", gap: 32,
        }} className="desktop-nav">
          <NavLink to="/vehicles" label="Fleet" />
          {isAuthenticated && user?.role === "customer" && (
            <NavLink to="/bookings" label="My Bookings" />
          )}
          {isAuthenticated && user?.role === "admin" && (
            <NavLink to="/admin" label="Dashboard" />
          )}
        </div>

        {/* Desktop Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="desktop-nav">
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: 12, color: T.gray3, letterSpacing: 0.5 }}>
                {user?.full_name?.split(" ")[0]}
              </span>
              {user?.role === "admin" && (
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 10,
                  background: "rgba(6,182,212,0.15)", border: `1px solid ${T.primary}`,
                  color: T.primary, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                }}>Admin</span>
              )}
              <button onClick={handleLogout} style={{
                padding: "7px 18px", fontSize: 12,
                fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: 1,
                background: "transparent", border: `1px solid ${T.border}`,
                color: T.gray3, borderRadius: 4, cursor: "pointer",
                textTransform: "uppercase", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.target.style.borderColor = T.white; e.target.style.color = T.white; }}
                onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.color = T.gray3; }}
              >Logout</button>
            </>
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
            {isAuthenticated && user?.role !== "admin" && (
              <Link to="/bookings" onClick={() => setMobileOpen(false)}
                style={{ color: T.white, textDecoration: "none", fontSize: 18, fontWeight: 700 }}>
                My Bookings
              </Link>
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