/**
 * DriveX — RegisterPage.jsx
 * Place at: src/pages/public/RegisterPage.jsx
 * After register → /dashboard (customer)
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";

const T = {
  bg: "#05070f", bgCard: "#0d1117",
  border: "rgba(255,255,255,0.08)", borderFocus: "#06b6d4",
  primary: "#06b6d4", primaryDark: "#0891b2",
  white: "#ffffff", gray3: "#94a3b8", gray5: "#334155",
};

function FloatingParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none",
    }} />
  );
}

const inputStyle = (focused) => ({
  width: "100%", padding: "12px 14px", boxSizing: "border-box",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${focused ? T.borderFocus : T.border}`,
  borderRadius: 6, color: T.white, fontSize: 14,
  fontFamily: "'Rajdhani', sans-serif", fontWeight: 500,
  outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  boxShadow: focused ? "0 0 0 3px rgba(6,182,212,0.1)" : "none",
});

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "" });
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
    if (formRef.current) {
      gsap.fromTo(formRef.current.querySelectorAll("[data-field]"),
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.08, duration: 0.6, ease: "power2.out", delay: 0.3 }
      );
    }
  }, []);

  // Password strength
  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#06b6d4", "#22c55e"][strength];

  const mutation = useMutation({
    mutationFn: () => api.post("/auth/register", form),
    onSuccess: (res) => {
      const { access_token, user } = res.data.data;
      login(access_token, user);
      toast.success("Welcome to DriveX! 🚗", {
        style: { background: "#0d1117", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" },
        iconTheme: { primary: "#06b6d4", secondary: "#000" },
      });
      // Always go to dashboard after register
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Registration failed", {
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
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,900;1,900&family=JetBrains+Mono:wght@400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #0d1117 inset !important; -webkit-text-fill-color: #fff !important; }
        input::placeholder { color: rgba(148,163,184,0.4); }
      `}</style>

      <FloatingParticles />

      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: 700, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div ref={cardRef} style={{
        width: "100%", maxWidth: 440,
        background: T.bgCard, border: `1px solid ${T.border}`,
        borderRadius: 16, overflow: "hidden", position: "relative",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
      }}>
        {/* Top accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${T.primary}, #22d3ee, transparent)` }} />

        <div style={{ padding: "36px 36px 40px" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 24, display: "inline-block" }}>
              <span style={{ color: T.white }}>Drive</span>
              <span style={{ color: T.primary }}>X</span>
            </div>
          </Link>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 34, fontWeight: 900, color: T.white,
              textTransform: "uppercase", letterSpacing: -0.5, lineHeight: 1, marginBottom: 8,
            }}>
              Create<br /><span style={{ color: T.primary, fontStyle: "italic" }}>Account</span>
            </h1>
            <p style={{ fontSize: 13.5, color: T.gray3, lineHeight: 1.5 }}>
              Join DriveX and start renting today
            </p>
          </div>

          <div ref={formRef} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Full Name */}
            <div data-field style={{ opacity: 0 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.gray3, letterSpacing: 2, textTransform: "uppercase", marginBottom: 7 }}>
                Full Name
              </label>
              <input type="text" value={form.full_name} onChange={set("full_name")}
                onFocus={() => setFocused("full_name")} onBlur={() => setFocused("")}
                placeholder="Muhammad Ali" style={inputStyle(focused === "full_name")} />
            </div>

            {/* Email */}
            <div data-field style={{ opacity: 0 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.gray3, letterSpacing: 2, textTransform: "uppercase", marginBottom: 7 }}>
                Email Address
              </label>
              <input type="email" value={form.email} onChange={set("email")}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                placeholder="you@example.com" style={inputStyle(focused === "email")} />
            </div>

            {/* Phone */}
            {/* <div data-field style={{ opacity: 0 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.gray3, letterSpacing: 2, textTransform: "uppercase", marginBottom: 7 }}>
                Phone <span style={{ color: T.gray5, fontWeight: 400 }}>(optional)</span>
              </label>
              <input type="tel" value={form.phone} onChange={set("phone")}
                onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
                placeholder="+92 300 0000000" style={inputStyle(focused === "phone")} />
            </div> */}

            {/* Password */}
            <div data-field style={{ opacity: 0 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.gray3, letterSpacing: 2, textTransform: "uppercase", marginBottom: 7 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={form.password}
                  onChange={set("password")} onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                  placeholder="Min 8 chars, uppercase, number"
                  style={{ ...inputStyle(focused === "password"), paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: T.gray3, fontSize: 14, padding: 4,
                }}>{showPass ? "🙈" : "👁"}</button>
              </div>
              {/* Strength bar */}
              {form.password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i < strength ? strengthColor : T.border,
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 10, color: strengthColor, fontWeight: 700, letterSpacing: 1 }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <div data-field style={{ opacity: 0, marginTop: 8 }}>
              <button onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !form.full_name || !form.email || !form.password}
                style={{
                  width: "100%", padding: "14px",
                  background: mutation.isPending ? `rgba(6,182,212,0.6)` : T.primary,
                  border: "none", borderRadius: 6,
                  cursor: mutation.isPending ? "not-allowed" : "pointer",
                  color: "#000", fontSize: 14, fontWeight: 800,
                  fontFamily: "'Rajdhani', sans-serif", letterSpacing: 2,
                  textTransform: "uppercase", transition: "all 0.2s",
                  boxShadow: mutation.isPending ? "none" : "0 4px 24px rgba(6,182,212,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  opacity: (!form.full_name || !form.email || !form.password) ? 0.5 : 1,
                }}
                onMouseEnter={e => !mutation.isPending && (e.currentTarget.style.boxShadow = "0 4px 40px rgba(6,182,212,0.55)")}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(6,182,212,0.3)"}
              >
                {mutation.isPending ? (
                  <><div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Creating...</>
                ) : "Create Account →"}
              </button>
            </div>

            <div data-field style={{ opacity: 0, display: "flex", alignItems: "center", gap: 14, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ fontSize: 11, color: T.gray5, letterSpacing: 2 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            <div data-field style={{ opacity: 0, textAlign: "center" }}>
              <span style={{ fontSize: 13, color: T.gray3 }}>Already have an account? </span>
              <Link to="/login" style={{ fontSize: 13, color: T.primary, textDecoration: "none", fontWeight: 700, borderBottom: `1px solid rgba(6,182,212,0.3)` }}>
                Sign In →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}