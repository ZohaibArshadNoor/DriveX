/**
 * ScrollStory.jsx
 * Place at: src/components/landing/ScrollStory.jsx
 *
 * Three pinned scroll-driven sections:
 *   1. Performance Showcase — animated spec counters with energy lines
 *   2. Exploded View         — 3D car panels separate on scroll
 *   3. Speed Tunnel          — fullscreen streak shader + camera shake text
 *
 * Uses GSAP ScrollTrigger pinning + scrubbing.
 * Three sections are wrapped in a single <div> that gets pinned by a parent.
 *
 * Dependencies:
 *   npm install gsap @studio-freight/lenis
 *   npm install @react-three/fiber @react-three/drei three
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────────────────────
 * 1. PERFORMANCE SHOWCASE
 * ──────────────────────────────────────────────────────────── */
const SPECS = [
  { label: 'Horsepower',    value: 612,  unit: 'HP',    color: '#0ea5e9' },
  { label: 'Torque',        value: 750,  unit: 'Nm',    color: '#22d3ee' },
  { label: 'Top Speed',     value: 305,  unit: 'km/h',  color: '#10b981' },
  { label: '0-100 km/h',    value: 3.4,  unit: 'sec',   color: '#6ee7b7' },
];

function AnimatedStat({ stat, active }) {
  const [val, setVal] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    if (!active) return;
    const start   = performance.now();
    const dur     = 1600;
    const isFloat = stat.value % 1 !== 0;

    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      const v = ease * stat.value;
      setVal(isFloat ? v.toFixed(1) : Math.round(v));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, stat.value]);

  return (
    <div style={{
      textAlign: 'center',
      padding: '32px 24px',
      border: `1px solid ${stat.color}22`,
      borderRadius: 16,
      background: `linear-gradient(135deg, ${stat.color}08, transparent)`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated corner accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 40, height: 40,
        borderTop: `2px solid ${stat.color}`,
        borderLeft: `2px solid ${stat.color}`,
        borderRadius: '16px 0 0 0',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.5s',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, right: 0, width: 40, height: 40,
        borderBottom: `2px solid ${stat.color}`,
        borderRight: `2px solid ${stat.color}`,
        borderRadius: '0 0 16px 0',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.5s 0.2s',
      }} />

      <div style={{
        fontFamily: "'Orbitron', 'Rajdhani', monospace",
        fontSize: 'clamp(42px, 6vw, 72px)',
        fontWeight: 900,
        color: stat.color,
        letterSpacing: -2,
        lineHeight: 1,
        textShadow: `0 0 40px ${stat.color}60`,
        transition: 'text-shadow 0.3s',
      }}>{val}</div>

      <div style={{
        fontFamily: 'monospace',
        fontSize: 13,
        color: stat.color,
        opacity: 0.7,
        letterSpacing: 3,
        marginTop: 6,
        textTransform: 'uppercase',
      }}>{stat.unit}</div>

      <div style={{
        fontSize: 11,
        color: '#64748b',
        letterSpacing: 2,
        marginTop: 10,
        textTransform: 'uppercase',
      }}>{stat.label}</div>

      {/* Scan line animation */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
        animation: active ? `scan-line 2s ease-in-out ${0.3}s infinite` : 'none',
        top: '50%',
        opacity: 0.4,
      }} />
    </div>
  );
}

function PerformanceSection({ sectionRef }) {
  const [active, setActive] = useState(false);
  const titleRef = useRef();

  useEffect(() => {
    if (!sectionRef.current) return;
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 60%',
      once: true,
      onEnter: () => setActive(true),
    });
    if (titleRef.current) {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
        }
      );
    }
    return () => trigger.kill();
  }, [sectionRef]);

  return (
    <div style={{ padding: '100px 7vw', background: 'var(--bg-root)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={titleRef} style={{ opacity: 0, marginBottom: 64, textAlign: 'center' }}>
          <p style={{
            fontFamily: 'monospace',
            fontSize: 10, color: '#0ea5e9', letterSpacing: 5,
            textTransform: 'uppercase', marginBottom: 14,
          }}>Performance DNA</p>
          <h2 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 800,
            color: '#f1f5f9',
            letterSpacing: -1,
            lineHeight: 1,
          }}>
            Numbers That<br />
            <span style={{
              background: 'linear-gradient(90deg, #0ea5e9, #22d3ee, #10b981)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Define Excellence</span>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
        }}>
          {SPECS.map((s, i) => (
            <AnimatedStat key={i} stat={s} active={active} />
          ))}
        </div>

        {/* Energy line */}
        <div style={{
          marginTop: 56,
          height: 1,
          background: 'linear-gradient(90deg, transparent, #0ea5e9, #22d3ee, transparent)',
          opacity: active ? 1 : 0,
          transition: 'opacity 1s 0.8s',
        }} />
        <p style={{
          marginTop: 24, textAlign: 'center',
          fontSize: 13, color: '#475569', letterSpacing: 2, textTransform: 'uppercase',
          opacity: active ? 1 : 0, transition: 'opacity 0.8s 1.2s',
        }}>
          Best-in-class benchmark across our entire premium fleet
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 2. EXPLODED VIEW — 3D canvas
 * ──────────────────────────────────────────────────────────── */
function ExplodedCarCanvas({ progress }) {
  /* progress: 0 = assembled, 1 = fully exploded */
  const parts = useMemo(() => [
    { pos: [0, 0.5, 0],          explode: [0, 0, 0],          name: 'body',     color: '#030f1e' },
    { pos: [-0.15, 1.0, 0],      explode: [0, 1.2, 0],        name: 'cabin',    color: '#031220' },
    { pos: [0, 0.82, 0],         explode: [0, 0.4, 2.2],      name: 'stripe',   color: '#0ea5e9', emissive: true },
    { pos: [1.4, -0.1, 0.95],    explode: [2.2, -0.5, 1.5],   name: 'wheel-fr', color: '#0a0a0f' },
    { pos: [1.4, -0.1, -0.95],   explode: [2.2, -0.5, -1.5],  name: 'wheel-fl', color: '#0a0a0f' },
    { pos: [-1.4, -0.1, 0.95],   explode: [-2.2, -0.5, 1.5],  name: 'wheel-rr', color: '#0a0a0f' },
    { pos: [-1.4, -0.1, -0.95],  explode: [-2.2, -0.5, -1.5], name: 'wheel-rl', color: '#0a0a0f' },
    { pos: [0.82, 1.05, 0],      explode: [1.8, 1.5, 0],      name: 'glass',    color: '#0a2040', transparent: true },
    { pos: [-1.05, 1.05, 0],     explode: [-2.2, 1.8, 0],     name: 'rear-glass',color: '#0a2040', transparent: true },
  ], []);

  return (
    <>
      <ambientLight intensity={0.4} color="#0a1a2e" />
      <pointLight position={[5, 5, 5]} intensity={2} color="#d0eeff" />
      <pointLight position={[-5, 3, -3]} intensity={1.5} color="#0ea5e9" />
      <pointLight position={[0, -1, 0]} intensity={1} color="#0ea5e9" />

      {parts.map((part, i) => {
        const x = THREE.MathUtils.lerp(part.pos[0], part.pos[0] + part.explode[0], progress);
        const y = THREE.MathUtils.lerp(part.pos[1], part.pos[1] + part.explode[1], progress);
        const z = THREE.MathUtils.lerp(part.pos[2], part.pos[2] + part.explode[2], progress);

        const isWheel = part.name.startsWith('wheel');
        const isStripe = part.name === 'stripe';

        return (
          <mesh key={part.name} position={[x, y, z]} castShadow>
            {isWheel ? (
              <torusGeometry args={[0.42, 0.14, 16, 32]} />
            ) : isStripe ? (
              <boxGeometry args={[4.2, 0.045, 1.92]} />
            ) : part.name === 'cabin' ? (
              <boxGeometry args={[2.4, 0.58, 1.72]} />
            ) : part.transparent ? (
              <planeGeometry args={[1.5, 0.62]} />
            ) : (
              <boxGeometry args={[4.2, 0.6, 1.9]} />
            )}
            <meshStandardMaterial
              color={part.color}
              metalness={part.name === 'body' || part.name === 'cabin' ? 0.98 : 0.5}
              roughness={part.name === 'body' || part.name === 'cabin' ? 0.04 : 0.8}
              emissive={part.emissive ? new THREE.Color('#0ea5e9') : undefined}
              emissiveIntensity={part.emissive ? 1.5 * progress + 0.3 : 0}
              transparent={!!part.transparent}
              opacity={part.transparent ? 0.65 : 1}
              side={part.transparent ? THREE.DoubleSide : THREE.FrontSide}
            />
          </mesh>
        );
      })}
    </>
  );
}

function useMemo(factory, deps) {
  return factory();
}

function ExplodedSection({ sectionRef }) {
  const canvasRef   = useRef();
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const titleRef    = useRef();
  const labelRef    = useRef();

  useEffect(() => {
    if (!sectionRef.current) return;

    /* Scrub the explosion with scroll */
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=100%',
      pin: true,
      scrub: 1.5,
      anticipatePin: 1,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        setProgress(self.progress);
      },
    });

    gsap.fromTo(titleRef.current,
      { opacity: 0, x: -40 },
      {
        opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
      }
    );

    return () => st.kill();
  }, [sectionRef]);

  const labelText = progress < 0.2 ? 'ASSEMBLED' : progress < 0.5 ? 'SEPARATING…' : progress < 0.85 ? 'EXPLODED VIEW' : 'ANATOMY';

  return (
    <div style={{
      position: 'relative', height: '100vh', overflow: 'hidden',
      background: 'radial-gradient(ellipse at 50% 100%, #031828 0%, #020c18 60%)',
    }}>
      {/* 3D Canvas */}
      <div ref={canvasRef} style={{ position: 'absolute', inset: 0 }}>
        <Canvas
          camera={{ position: [0, 2, 8], fov: 50 }}
          dpr={[1, 1.5]}
          style={{ width: '100%', height: '100%' }}
        >
          <ExplodedCarCanvas progress={progress} />
        </Canvas>
      </div>

      {/* Overlay text */}
      <div ref={titleRef} style={{
        opacity: 0,
        position: 'absolute', top: '10%', left: '7vw', zIndex: 10,
        maxWidth: 380,
      }}>
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#0ea5e9', letterSpacing: 5, textTransform: 'uppercase', marginBottom: 12 }}>
          Engineering
        </p>
        <h2 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 'clamp(24px, 3.5vw, 46px)',
          fontWeight: 800, color: '#f1f5f9', letterSpacing: -0.5, lineHeight: 1.1,
        }}>
          Every Component<br />Engineered to<br />
          <span style={{
            background: 'linear-gradient(90deg, #0ea5e9, #22d3ee)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Perfection</span>
        </h2>
        <p style={{ marginTop: 18, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
          Scroll to explore the architecture that defines every vehicle in our fleet.
        </p>
      </div>

      {/* Dynamic label */}
      <div style={{
        position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)',
        zIndex: 10,
        fontFamily: 'monospace',
        fontSize: 11, color: '#0ea5e9', letterSpacing: 4,
        textTransform: 'uppercase',
        transition: 'all 0.4s',
        opacity: 0.7,
      }}>
        {labelText}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)',
        width: 200, height: 1, background: 'rgba(14,165,233,0.15)',
        zIndex: 10,
      }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          background: 'linear-gradient(90deg, #0ea5e9, #22d3ee)',
          transition: 'width 0.1s',
        }} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * 3. SPEED TUNNEL
 * ──────────────────────────────────────────────────────────── */
function SpeedTunnelCanvas() {
  const streakRef = useRef([]);
  const STREAK_COUNT = 80;

  const streaks = Array.from({ length: STREAK_COUNT }, (_, i) => ({
    angle:  (Math.random() * Math.PI * 2),
    radius: 0.06 + Math.random() * 0.65,
    len:    0.08 + Math.random() * 0.3,
    speed:  0.4 + Math.random() * 1.8,
    phase:  Math.random(),
    brightness: 0.3 + Math.random() * 0.7,
    color:  Math.random() > 0.7 ? new THREE.Color('#22d3ee') : new THREE.Color('#0ea5e9'),
  }));

  const meshes = useMemo(() => {
    return streaks.map((s, i) => {
      const pts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -s.len * 8),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      return { geo, s, key: i };
    });
  }, []);

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 2]} intensity={3} color="#0ea5e9" />
      {meshes.map(({ geo, s, key }) => (
        <StreakMesh key={key} geo={geo} s={s} />
      ))}
      {/* Tunnel rings */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[0, 0, -i * 3]}>
          <torusGeometry args={[1.6 + i * 0.12, 0.008, 8, 60]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.08 + (i / 12) * 0.06} />
        </mesh>
      ))}
    </>
  );
}

function StreakMesh({ geo, s }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const phase = ((t * s.speed * 0.25 + s.phase) % 1);
    const r = s.radius;
    const x = Math.cos(s.angle) * r * 3.5;
    const y = Math.sin(s.angle) * r * 3.5;
    meshRef.current.position.set(x, y, -phase * 14);
    meshRef.current.material.opacity = (1 - phase) * s.brightness * 0.7;
  });

  return (
    <line ref={meshRef} geometry={geo}>
      <lineBasicMaterial color={s.color} transparent opacity={0.5} />
    </line>
  );
}

function SpeedSection({ sectionRef }) {
  const textRef = useRef();

  useEffect(() => {
    if (!sectionRef.current) return;
    if (!textRef.current) return;
    const chars = textRef.current.querySelectorAll('.speed-char');
    gsap.fromTo(chars,
      { opacity: 0, y: '120%' },
      {
        opacity: 1, y: '0%', stagger: 0.03, duration: 0.7, ease: 'power4.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', once: true },
      }
    );
  }, [sectionRef]);

  const word = '300 KM/H';

  return (
    <div style={{
      position: 'relative', height: '100vh', overflow: 'hidden',
      background: '#010810',
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas
          camera={{ position: [0, 0, 3.5], fov: 75 }}
          dpr={[1, 1.5]}
          style={{ width: '100%', height: '100%' }}
        >
          <SpeedTunnelCanvas />
        </Canvas>
      </div>

      {/* Overlay vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(1,8,16,0.8) 100%)',
      }} />

      {/* Speed text */}
      <div ref={textRef} style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', zIndex: 10, overflow: 'hidden',
      }}>
        <div style={{ overflow: 'hidden', marginBottom: 12 }}>
          {word.split('').map((ch, i) => (
            <span key={i} className="speed-char" style={{
              display: 'inline-block',
              fontFamily: "'Orbitron', monospace",
              fontSize: 'clamp(52px, 10vw, 130px)',
              fontWeight: 900,
              color: '#f1f5f9',
              letterSpacing: -2,
              textShadow: '0 0 80px rgba(14,165,233,0.5)',
            }}>{ch === ' ' ? '\u00A0' : ch}</span>
          ))}
        </div>
        <p style={{
          fontFamily: 'monospace',
          fontSize: 11, color: '#0ea5e9', letterSpacing: 6,
          textTransform: 'uppercase', opacity: 0.7,
        }}>
          Pure adrenaline · Tamed for the road
        </p>
      </div>

      {/* Side labels */}
      <div style={{
        position: 'absolute', left: '7vw', top: '50%', transform: 'translateY(-50%)',
        fontFamily: 'monospace', fontSize: 10, color: 'rgba(14,165,233,0.35)',
        letterSpacing: 3, textTransform: 'uppercase', writingMode: 'vertical-rl',
      }}>
        Velocity · Precision · Control
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * MAIN ScrollStory EXPORT
 * ──────────────────────────────────────────────────────────── */
export default function ScrollStory() {
  const perfRef  = useRef(null);
  const explRef  = useRef(null);
  const speedRef = useRef(null);

  return (
    <>
      {/* Section 1: Performance */}
      <section ref={perfRef}>
        <PerformanceSection sectionRef={perfRef} />
      </section>

      {/* Section 2: Exploded View */}
      <section ref={explRef}>
        <ExplodedSection sectionRef={explRef} />
      </section>

      {/* Section 3: Speed Tunnel */}
      <section ref={speedRef} style={{ position: 'relative' }}>
        <SpeedSection sectionRef={speedRef} />
      </section>

      {/* Global scan-line keyframe */}
      <style>{`
        @keyframes scan-line {
          0%   { top: 10%; opacity: 0; }
          30%  { opacity: 0.4; }
          70%  { opacity: 0.4; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </>
  );
}