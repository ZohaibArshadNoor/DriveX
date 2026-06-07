/**
 * DriveX — LoginPage.jsx
 * Place at: src/pages/public/LoginPage.jsx
 *
 * FIXES vs previous version
 * ─────────────────────────────────────────────────────────────
 * 1. Error state managed in React state (errorMsg) — not just
 *    toast.  The message renders inline inside the card where
 *    the user is already looking, so it is impossible to miss.
 *
 * 2. Error cleared on every new keystroke so stale messages
 *    never persist while the user is typing a correction.
 *
 * 3. onError extracts the message from all common backend shapes:
 *      res.data.message  (DRF / FastAPI standard)
 *      res.data.detail   (FastAPI 422)
 *      res.data.error    (some custom shapes)
 *      res.data.non_field_errors[0]  (DRF serializer errors)
 *    Falls back to a friendly generic string so the field
 *    is never blank even if the backend returns HTML or nothing.
 *
 * 4. Input borders turn red while an error is active so the
 *    user immediately sees which fields need attention.
 *
 * 5. shake animation on the card is preserved (visual feedback).
 *
 * 6. FloatingParticles canvas now handles resize correctly via
 *    a ResizeObserver so it never overflows on small screens.
 *
 * 7. Removed the navigation (page reload) that was wiping the
 *    error — onError no longer calls navigate().
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";

/* ── Palette ─────────────────────────────────────────────── */
const T = {
  bg:          "#05070f",
  bgCard:      "#0d1117",
  border:      "rgba(255,255,255,0.08)",
  borderFocus: "#06b6d4",
  borderError: "#ef4444",
  primary:     "#06b6d4",
  white:       "#ffffff",
  gray3:       "#94a3b8",
  gray5:       "#334155",
  error:       "#ef4444",
};

/* ── Extract a human-readable message from an Axios error ─── */
function extractError(err) {
  const d = err?.response?.data;
  if (!d) {
    if (err?.message === "Network Error")
      return "Cannot reach the server. Check your connection.";
    return "Something went wrong. Please try again.";
  }
  /* DRF / FastAPI / custom shapes */
  if (typeof d === "string")                    return d;
  if (d.message)                                return d.message;
  if (d.detail && typeof d.detail === "string") return d.detail;
  if (d.error   && typeof d.error   === "string") return d.error;
  /* DRF non_field_errors array */
  if (Array.isArray(d.non_field_errors) && d.non_field_errors.length)
    return d.non_field_errors[0];
  /* DRF field-level errors (e.g. {email: ["Not valid."]}) */
  const firstKey = Object.keys(d)[0];
  if (firstKey) {
    const val = d[firstKey];
    if (typeof val === "string")  return `${firstKey}: ${val}`;
    if (Array.isArray(val))       return `${firstKey}: ${val[0]}`;
  }
  /* HTTP status fallbacks */
  const status = err?.response?.status;
  if (status === 401) return "Incorrect email or password.";
  if (status === 403) return "Your account is not authorised to log in.";
  if (status === 404) return "No account found with that email address.";
  if (status === 429) return "Too many attempts. Please wait a moment.";
  if (status >= 500)  return "Server error. Please try again shortly.";
  return "Login failed. Please check your credentials.";
}

/* ── Floating particles canvas ───────────────────────────── */
function FloatingParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const particles = Array.from({ length: 60 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -Math.random() * 0.4 - 0.1,
      o:  Math.random() * 0.5 + 0.1,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6,182,212,${p.o})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -5) {
          p.y = canvas.height + 5;
          p.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

/* ── Eye icon SVG ────────────────────────────────────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

/* ── Inline error banner ─────────────────────────────────── */
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "12px 14px",
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.35)",
      borderRadius: 8,
      marginBottom: 22,
      animation: "errFade 0.3s ease",
    }}>
      {/* Warning icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="#ef4444" strokeWidth="2" strokeLinecap="round"
           style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span style={{
        fontSize: 13,
        color: "#fca5a5",
        lineHeight: 1.5,
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 500,
      }}>
        {message}
      </span>
    </div>
  );
}

/* ── Input field ─────────────────────────────────────────── */
function Field({ label, type, value, onChange, onFocus, onBlur,
                 placeholder, isFocused, hasError, onKeyDown, rightSlot }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: "block",
        fontSize: 11, fontWeight: 700,
        color: hasError ? T.error : T.gray3,
        letterSpacing: 2, textTransform: "uppercase",
        marginBottom: 8,
        transition: "color 0.2s",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete={type === "email" ? "email" : "current-password"}
          style={{
            width: "100%",
            padding: rightSlot ? "13px 46px 13px 16px" : "13px 16px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${
              hasError  ? T.borderError  :
              isFocused ? T.borderFocus  :
                          T.border
            }`,
            borderRadius: 6,
            color: T.white,
            fontSize: 14,
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 500,
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: hasError
              ? "0 0 0 3px rgba(239,68,68,0.12)"
              : isFocused
              ? "0 0 0 3px rgba(6,182,212,0.10)"
              : "none",
            boxSizing: "border-box",
          }}
        />
        {rightSlot && (
          <div style={{
            position: "absolute", right: 12, top: "50%",
            transform: "translateY(-50%)",
          }}>
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const [form,     setForm]     = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [focused,  setFocused]  = useState("");
  /* ── NEW: inline error state ────────────────────────── */
  const [errorMsg, setErrorMsg] = useState("");

  const navigate  = useNavigate();
  const { login } = useAuthStore();
  const cardRef   = useRef(null);
  const formRef   = useRef(null);

  /* ── Entrance animation ─────────────────────────────── */
  useEffect(() => {
    if (!cardRef.current || !formRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0,  scale: 1, duration: 0.8, ease: "power3.out" }
    );
    gsap.fromTo(
      formRef.current.querySelectorAll("[data-field]"),
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: "power2.out", delay: 0.3 }
    );
  }, []);

  /* ── Clear error as soon as user starts correcting ──── */
  const set = useCallback((k) => (e) => {
    setErrorMsg("");                          /* ← clears on every keystroke */
    setForm(p => ({ ...p, [k]: e.target.value }));
  }, []);

  /* ── Shake the card on error ─────────────────────────── */
  const shake = useCallback(() => {
    if (!cardRef.current) return;
    gsap.killTweensOf(cardRef.current);
    gsap.fromTo(cardRef.current,
      { x: -10 },
      { x: 0, duration: 0.5, ease: "elastic.out(1,0.3)" }
    );
  }, []);

  /* ── Mutation ────────────────────────────────────────── */
  const mutation = useMutation({
    mutationFn: () => api.post("/auth/login", form),

    onSuccess: (res) => {
      setErrorMsg("");
      const { access_token, user } = res.data.data;
      login(access_token, user);
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}!`, {
        style: {
          background: "#0d1117", color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
        iconTheme: { primary: T.primary, secondary: "#000" },
      });
      navigate(user.role === "admin" ? "/admin" : "/vehicles");
    },

    onError: (err) => {
      /* ── Extract message ─────────────────────────────── */
      const msg = extractError(err);

      /* 1. Set inline error (always visible, inside the card) */
      setErrorMsg(msg);

      /* 2. Also show a toast for redundancy */
      toast.error(msg, {
        id: "login-error",          /* deduplicate rapid retries */
        duration: 4000,
        style: {
          background: "#0d1117", color: "#fff",
          border: "1px solid rgba(239,68,68,0.3)",
        },
      });

      /* 3. Shake the card */
      shake();
    },
  });

  const submit = () => {
    /* Client-side validation before hitting the API */
    if (!form.email.trim()) {
      setErrorMsg("Please enter your email address.");
      shake(); return;
    }
    if (!form.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      shake(); return;
    }
    if (!form.password) {
      setErrorMsg("Please enter your password.");
      shake(); return;
    }
    mutation.mutate();
  };

  const hasError = !!errorMsg;

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "80px 20px 40px",
      position: "relative", overflow: "hidden",
      fontFamily: "'Rajdhani', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,900;1,900&display=swap');
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #0d1117 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes errFade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <FloatingParticles />

      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Card ─────────────────────────────────────────── */}
      <div ref={cardRef} style={{
        width: "100%", maxWidth: 420,
        background: T.bgCard,
        border: `1px solid ${hasError ? "rgba(239,68,68,0.25)" : T.border}`,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        boxShadow: hasError
          ? "0 40px 120px rgba(239,68,68,0.08), 0 0 0 1px rgba(239,68,68,0.12)"
          : "0 40px 120px rgba(0,0,0,0.6)",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}>

        {/* Top accent bar — red when error */}
        <div style={{
          height: 3,
          background: hasError
            ? `linear-gradient(90deg, ${T.error}, transparent)`
            : `linear-gradient(90deg, ${T.primary}, transparent)`,
          transition: "background 0.3s",
        }} />

        <div style={{ padding: "40px 36px 44px" }}>

          {/* Logo + heading */}
          <div style={{ marginBottom: 32 }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 22, fontWeight: 900,
                marginBottom: 24, display: "inline-block",
              }}>
                <span style={{ color: T.white }}>Drive</span>
                <span style={{ color: T.primary }}>X</span>
              </div>
            </Link>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 36, fontWeight: 900, color: T.white,
              textTransform: "uppercase", letterSpacing: -0.5,
              lineHeight: 1, marginBottom: 8,
            }}>
              Welcome<br />
              <span style={{ color: T.primary, fontStyle: "italic" }}>Back</span>
            </h1>
            <p style={{ fontSize: 13.5, color: T.gray3, lineHeight: 1.5 }}>
              Sign in to manage your bookings
            </p>
          </div>

          {/* ── INLINE ERROR BANNER — always in the DOM, visible instantly ── */}
          <ErrorBanner message={errorMsg} />

          {/* ── Form fields ──────────────────────────────── */}
          <div ref={formRef}>

            {/* Email */}
            <div data-field>
              <Field
                label="Email Address"
                type="email"
                value={form.email}
                onChange={set("email")}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                placeholder="you@example.com"
                isFocused={focused === "email"}
                hasError={hasError}
                onKeyDown={e => e.key === "Enter" && submit()}
                rightSlot={
                  <span style={{ color: T.gray3, fontSize: 15, opacity: 0.5 }}>@</span>
                }
              />
            </div>

            {/* Password */}
            <div data-field>
              <Field
                label="Password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                placeholder="••••••••"
                isFocused={focused === "password"}
                hasError={hasError}
                onKeyDown={e => e.key === "Enter" && submit()}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{
                      background: "none", border: "none",
                      cursor: "pointer", color: T.gray3,
                      padding: 2, display: "flex", alignItems: "center",
                    }}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPass} />
                  </button>
                }
              />
            </div>

            {/* Submit */}
            <div data-field style={{ marginTop: 28 }}>
              <button
                onClick={submit}
                disabled={mutation.isPending}
                style={{
                  width: "100%", padding: "14px",
                  background: mutation.isPending
                    ? "rgba(6,182,212,0.55)"
                    : T.primary,
                  border: "none", borderRadius: 6,
                  cursor: mutation.isPending ? "not-allowed" : "pointer",
                  color: "#000", fontSize: 14, fontWeight: 800,
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: 2, textTransform: "uppercase",
                  transition: "all 0.2s",
                  boxShadow: mutation.isPending
                    ? "none"
                    : "0 4px 24px rgba(6,182,212,0.3)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 10,
                }}
                onMouseEnter={e => {
                  if (!mutation.isPending)
                    e.currentTarget.style.boxShadow = "0 4px 40px rgba(6,182,212,0.55)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(6,182,212,0.3)";
                }}
              >
                {mutation.isPending ? (
                  <>
                    <div style={{
                      width: 16, height: 16,
                      border: "2px solid rgba(0,0,0,0.3)",
                      borderTopColor: "#000",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }} />
                    Signing In…
                  </>
                ) : "Sign In →"}
              </button>
            </div>

            {/* Divider */}
            <div data-field style={{
              display: "flex", alignItems: "center", gap: 14,
              margin: "24px 0",
            }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ fontSize: 11, color: T.gray5, letterSpacing: 2 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            {/* Register link */}
            <div data-field style={{ textAlign: "center" }}>
              <span style={{ fontSize: 13, color: T.gray3 }}>No account? </span>
              <Link to="/register" style={{
                fontSize: 13, color: T.primary,
                textDecoration: "none", fontWeight: 700,
                borderBottom: "1px solid rgba(6,182,212,0.3)",
              }}>
                Register Free →
              </Link>
            </div>

            {/* Browse without login */}
            <div data-field style={{
              marginTop: 20, padding: "12px 16px",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${T.border}`,
              borderRadius: 8, textAlign: "center",
            }}>
              <Link to="/vehicles" style={{
                fontSize: 12, color: T.gray3,
                textDecoration: "none", letterSpacing: 0.5,
              }}>
                Just browsing?{" "}
                <span style={{ color: T.white }}>
                  Explore fleet without login →
                </span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}