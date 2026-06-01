/**
 * DriveX — LoginPage.jsx
 * Place at: src/pages/public/LoginPage.jsx
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";

const T = {
  bg: "#05070f", bgCard: "#0d1117", border: "rgba(255,255,255,0.08)",
  borderFocus: "#06b6d4", primary: "#06b6d4", primaryDark: "#0891b2",
  white: "#ffffff",
  gray3: "#94a3b8", gray5: "#334155", error: "#ef4444",
};

function FloatingParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -Math.random() * 0.4 - 0.1,
      o: Math.random() * 0.5 + 0.1,
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6,182,212,${p.o})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const cardRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
    );
    gsap.fromTo(formRef.current.querySelectorAll("[data-field]"),
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: "power2.out", delay: 0.3 }
    );
  }, []);

  const mutation = useMutation({
    mutationFn: () => api.post("/auth/login", form),
    onSuccess: (res) => {
      const { access_token, user } = res.data.data;
      login(access_token, user);
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}!`, {
        style: { background: "#0d1117", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" },
        iconTheme: { primary: "#06b6d4", secondary: "#000" },
      });
      navigate(user.role === "admin" ? "/admin" : "/vehicles");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Invalid credentials", {
        style: { background: "#0d1117", color: "#fff", border: "1px solid rgba(239,68,68,0.3)" },
      });
      gsap.fromTo(cardRef.current,
        { x: -8 }, { x: 0, duration: 0.4, ease: "elastic.out(1,0.3)", repeat: 3, yoyo: true }
      );
    },
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "80px 20px 40px", position: "relative", overflow: "hidden",
      fontFamily: "'Rajdhani', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,900;1,900&display=swap');
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #0d1117 inset !important; -webkit-text-fill-color: #fff !important; }
      `}</style>

      <FloatingParticles />

      {/* Background glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div ref={cardRef} style={{
        width: "100%", maxWidth: 420,
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
      }}>

        {/* Top primary accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${T.primary}, transparent)` }} />

        <div style={{ padding: "40px 36px 44px" }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 22, fontWeight: 900, marginBottom: 24, display: "inline-block",
              }}>
                <span style={{ color: T.white }}>Drive</span>
                <span style={{ color: T.primary }}>X</span>
              </div>
            </Link>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 36, fontWeight: 900, color: T.white,
              textTransform: "uppercase", letterSpacing: -0.5, lineHeight: 1, marginBottom: 8,
            }}>
              Welcome<br /><span style={{ color: T.primary, fontStyle: "italic" }}>Back</span>
            </h1>
            <p style={{ fontSize: 13.5, color: T.gray3, lineHeight: 1.5 }}>
              Sign in to manage your bookings
            </p>
          </div>

          {/* Form */}
          <div ref={formRef}>
            {/* Email */}
            <div data-field style={{ marginBottom: 18 }}>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 700, color: T.gray3,
                letterSpacing: 2, textTransform: "uppercase", marginBottom: 8,
              }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  placeholder="you@example.com"
                  style={{
                    width: "100%", padding: "13px 44px 13px 16px",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${focused === "email" ? T.borderFocus : T.border}`,
                    borderRadius: 6, color: T.white, fontSize: 14,
                    fontFamily: "'Rajdhani', sans-serif", fontWeight: 500,
                    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                    boxShadow: focused === "email" ? "0 0 0 3px rgba(6,182,212,0.1)" : "none",
                    boxSizing: "border-box",
                  }}
                />
                <span style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  fontSize: 16, opacity: 0.4,
                }}>@</span>
              </div>
            </div>

            {/* Password */}
            <div data-field style={{ marginBottom: 10 }}>
              <label style={{
                display: "block", fontSize: 11, fontWeight: 700, color: T.gray3,
                letterSpacing: 2, textTransform: "uppercase", marginBottom: 8,
              }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === "Enter" && mutation.mutate()}
                  style={{
                    width: "100%", padding: "13px 44px 13px 16px",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${focused === "password" ? T.borderFocus : T.border}`,
                    borderRadius: 6, color: T.white, fontSize: 14,
                    fontFamily: "'Rajdhani', sans-serif", fontWeight: 500,
                    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                    boxShadow: focused === "password" ? "0 0 0 3px rgba(6,182,212,0.1)" : "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: T.gray3, fontSize: 14, padding: 4,
                  }}
                >{showPass ? "🙈" : "👁"}</button>
              </div>
            </div>

            {/* Submit */}
            <div data-field style={{ marginTop: 28 }}>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !form.email || !form.password}
                style={{
                  width: "100%", padding: "14px",
                  background: mutation.isPending ? "rgba(6,182,212,0.6)" : T.primary,
                  border: "none", borderRadius: 6, cursor: mutation.isPending ? "not-allowed" : "pointer",
                  color: "#000", fontSize: 14, fontWeight: 800,
                  fontFamily: "'Rajdhani', sans-serif", letterSpacing: 2,
                  textTransform: "uppercase", transition: "all 0.2s",
                  boxShadow: mutation.isPending ? "none" : "0 4px 24px rgba(6,182,212,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
                onMouseEnter={e => !mutation.isPending && (e.currentTarget.style.boxShadow = "0 4px 40px rgba(6,182,212,0.55)")}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(6,182,212,0.3)"}
              >
                {mutation.isPending ? (
                  <>
                    <div style={{
                      width: 16, height: 16, border: "2px solid rgba(0,0,0,0.3)",
                      borderTopColor: "#000", borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }} />
                    Signing In...
                  </>
                ) : "Sign In →"}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>

            {/* Divider */}
            <div data-field style={{
              display: "flex", alignItems: "center", gap: 14, margin: "24px 0",
            }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ fontSize: 11, color: T.gray5, letterSpacing: 2 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            {/* Register link */}
            <div data-field style={{ textAlign: "center" }}>
              <span style={{ fontSize: 13, color: T.gray3 }}>No account? </span>
              <Link to="/register" style={{
                fontSize: 13, color: T.primary, textDecoration: "none",
                fontWeight: 700, borderBottom: `1px solid rgba(6,182,212,0.3)`,
              }}>Register Free →</Link>
            </div>

            {/* Browse without login hint */}
            <div data-field style={{
              marginTop: 20, padding: "12px 16px",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${T.border}`, borderRadius: 8,
              textAlign: "center",
            }}>
              <Link to="/vehicles" style={{
                fontSize: 12, color: T.gray3, textDecoration: "none",
                letterSpacing: 0.5,
              }}>
                Just browsing? <span style={{ color: T.white }}>Explore fleet without login →</span>
              </Link>
            </div>

            {/* Dev hint */}
            <div data-field style={{
              marginTop: 16, padding: "10px 14px",
              background: "rgba(6,182,212,0.05)",
              border: "1px dashed rgba(6,182,212,0.2)", borderRadius: 6,
            }}>
              <div style={{ fontSize: 10, color: T.gray5, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
                <div style={{ color: T.primary, marginBottom: 2 }}>// Demo credentials</div>
                <div>Admin: admin@drivex.com / Admin@123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}