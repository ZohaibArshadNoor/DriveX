/**
 * HolographicStats.jsx
 * Place at: src/components/landing/HolographicStats.jsx
 *
 * Holographic HUD-style statistics display.
 * Features:
 *  - Animated count-up numbers on scroll entry
 *  - CRT scan-line effect
 *  - Glitch text animation
 *  - Hexagonal grid background
 *  - Rotating ring accents
 */

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── Count-up ────────────────────────────────────────────── */
function useCountUp(end, active, decimals = 0) {
  const [val, setVal] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const dur   = 2000;
    const tick  = (now) => {
      const p    = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      const v    = ease * end;
      setVal(decimals ? v.toFixed(decimals) : Math.round(v));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, active, decimals]);

  return val;
}

/* ── Glitch text ─────────────────────────────────────────── */
function GlitchText({ children, active, style }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    if (!active) return;
    const intervals = [];
    let count = 0;
    const run = () => {
      if (count > 5) return;
      count++;
      setGlitch(true);
      setTimeout(() => setGlitch(false), 80 + Math.random() * 60);
      intervals.push(setTimeout(run, 300 + Math.random() * 400));
    };
    const id = setTimeout(run, 200);
    return () => { clearTimeout(id); intervals.forEach(clearTimeout); };
  }, [active]);

  return (
    <span style={{
      ...style,
      textShadow: glitch
        ? '2px 0 #0ea5e9, -2px 0 #22d3ee, 0 0 20px rgba(14,165,233,0.8)'
        : '0 0 30px rgba(14,165,233,0.4)',
      transition: 'text-shadow 0.08s',
      display: 'inline-block',
      transform: glitch ? `translateX(${Math.random() > 0.5 ? 2 : -2}px)` : 'none',
    }}>
      {children}
    </span>
  );
}

/* ── Stat block ──────────────────────────────────────────── */
function StatBlock({ stat, active, delay = 0 }) {
  const count = useCountUp(stat.value, active, stat.decimals ?? 0);
  const blockRef = useRef();

  useEffect(() => {
    if (!blockRef.current) return;
    gsap.fromTo(blockRef.current,
      { opacity: 0, y: 40, scale: 0.9 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.8, delay,
        ease: 'power3.out',
      }
    );
  }, [active, delay]);

  return (
    <div ref={blockRef} style={{
      opacity: 0,
      position: 'relative',
      padding: '36px 28px',
      border: '1px solid rgba(14,165,233,0.15)',
      borderRadius: 4,
      background: 'rgba(2,15,30,0.8)',
      textAlign: 'center',
      overflow: 'hidden',
    }}>
      {/* Corner accents */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
        const isTop    = corner.includes('top');
        const isLeft   = corner.includes('left');
        return (
          <div key={corner} style={{
            position: 'absolute',
            [isTop ? 'top' : 'bottom']: -1,
            [isLeft ? 'left' : 'right']: -1,
            width: 16, height: 16,
            borderTop: isTop    ? '2px solid #0ea5e9' : 'none',
            borderBottom: !isTop  ? '2px solid #0ea5e9' : 'none',
            borderLeft: isLeft  ? '2px solid #0ea5e9' : 'none',
            borderRight: !isLeft ? '2px solid #0ea5e9' : 'none',
          }} />
        );
      })}

      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.5), transparent)',
        animation: active ? 'holo-scan 3s ease-in-out infinite' : 'none',
        animationDelay: `${delay}s`,
      }} />

      {/* Icon */}
      <div style={{ fontSize: 26, marginBottom: 14, opacity: 0.9 }}>{stat.icon}</div>

      {/* Number */}
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 'clamp(36px, 5vw, 58px)',
        fontWeight: 900,
        color: '#0ea5e9',
        letterSpacing: -1,
        lineHeight: 1,
      }}>
        <GlitchText active={active} style={{ fontFamily: "'Orbitron', monospace", fontSize: 'inherit', fontWeight: 'inherit' }}>
          {stat.prefix ?? ''}{count}{stat.suffix ?? ''}
        </GlitchText>
      </div>

      {/* Label */}
      <div style={{
        marginTop: 10,
        fontFamily: 'monospace',
        fontSize: 9, color: '#475569',
        letterSpacing: 3, textTransform: 'uppercase',
      }}>
        {stat.label}
      </div>

      {/* Sub-label */}
      {stat.sub && (
        <div style={{
          marginTop: 6,
          fontSize: 11, color: 'rgba(14,165,233,0.5)',
          fontFamily: 'monospace',
        }}>
          {stat.sub}
        </div>
      )}

      {/* Glow */}
      <div style={{
        position: 'absolute', bottom: -20, left: '50%',
        transform: 'translateX(-50%)',
        width: '60%', height: 40,
        background: 'rgba(14,165,233,0.08)',
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

/* ── Rotating ring SVG ───────────────────────────────────── */
function Ring({ size, opacity, speed }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      rotation: 360, duration: speed,
      repeat: -1, ease: 'none',
      transformOrigin: 'center',
    });
  }, [speed]);
  const r = size / 2 - 2;
  return (
    <svg
      ref={ref}
      width={size} height={size}
      style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity, pointerEvents: 'none',
      }}
    >
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="url(#ring-grad)"
        strokeWidth={1}
        strokeDasharray={`${r * 0.3} ${r * 0.2}`}
      />
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#0ea5e9" stopOpacity="0.8" />
          <stop offset="50%"  stopColor="#22d3ee" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Hexagonal background ────────────────────────────────── */
function HexGrid() {
  const size = 28;
  const cols = Math.ceil(window.innerWidth / (size * 1.73)) + 2;
  const rows = 8;

  const hexPath = (cx, cy, r) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 - 30) * (Math.PI / 180);
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    });
    return `M${pts.join('L')}Z`;
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      opacity: 0.18, pointerEvents: 'none',
    }}>
      <svg width="100%" height="100%">
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const x = col * size * 1.73 + (row % 2 === 0 ? 0 : size * 0.865);
            const y = row * size * 1.5;
            return (
              <path
                key={`${row}-${col}`}
                d={hexPath(x, y, size - 1)}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth={0.5}
                opacity={0.4 + Math.random() * 0.3}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}

/* ── STATS DATA ──────────────────────────────────────────── */
const STATS = [
  {
    icon: '🚗',
    value: 50,
    suffix: '+',
    label: 'Fleet Vehicles',
    sub: 'Across all categories',
  },
  {
    icon: '👥',
    value: 2400,
    suffix: '+',
    label: 'Happy Renters',
    sub: 'Verified reviews',
  },
  {
    icon: '🏙️',
    value: 3,
    label: 'Cities',
    sub: 'Karachi · Lahore · Islamabad',
  },
  {
    icon: '⏱️',
    value: 99,
    suffix: '%',
    label: 'Uptime',
    sub: 'Fleet availability rate',
  },
  {
    icon: '⭐',
    value: 4.9,
    decimals: 1,
    label: 'Avg Rating',
    sub: 'Out of 5.0',
  },
  {
    icon: '🔒',
    value: 100,
    suffix: '%',
    label: 'Secure Bookings',
    sub: 'Encrypted & verified',
  },
];

/* ── MAIN EXPORT ─────────────────────────────────────────── */
export default function HolographicStats() {
  const sectionRef = useRef(null);
  const [active, setActive]   = useState(false);
  const titleRef  = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 65%',
      once: true,
      onEnter: () => setActive(true),
    });
    if (titleRef.current) {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: titleRef.current, start: 'top 75%', once: true },
        }
      );
    }
    return () => st.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        padding: '110px 7vw',
        background: '#010810',
        overflow: 'hidden',
      }}
    >
      <HexGrid />

      {/* Decorative rings */}
      <Ring size={600} opacity={0.04} speed={80} />
      <Ring size={900} opacity={0.025} speed={120} />

      {/* Center glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60%', height: '40%',
        background: 'radial-gradient(ellipse, rgba(14,165,233,0.06), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        {/* Title */}
        <div ref={titleRef} style={{
          opacity: 0, textAlign: 'center', marginBottom: 70,
        }}>
          <p style={{
            fontFamily: 'monospace', fontSize: 10,
            color: '#0ea5e9', letterSpacing: 5,
            textTransform: 'uppercase', marginBottom: 16,
          }}>
            System Status · Live
          </p>
          <h2 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 800, color: '#f1f5f9',
            letterSpacing: -1, lineHeight: 1,
          }}>
            The Numbers<br />
            <span style={{
              background: 'linear-gradient(90deg, #0ea5e9, #22d3ee)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Speak for Themselves</span>
          </h2>
        </div>

        {/* Stat grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 20,
        }}>
          {STATS.map((stat, i) => (
            <StatBlock
              key={i}
              stat={stat}
              active={active}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes holo-scan {
          0%   { top: 0%;   opacity: 0; }
          15%  { opacity: 0.6; }
          85%  { opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}