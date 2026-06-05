/**
 * ScrollStory.jsx
 * Place at: src/components/landing/ScrollStory.jsx
 *
 * Three scroll-driven sections:
 *   1. Performance Showcase — animated spec counters
 *   2. Exploded View        — ProceduralSupercar with explodeProgress
 *   3. Speed Tunnel         — radial streak shader canvas
 *
 * Bug-fixes vs v1:
 *   - Removed the broken  function useMemo(factory,deps){return factory()}
 *     which was shadowing React's useMemo and causing re-creation of
 *     Three.js geometries on every render.
 *   - Streak parameters moved to module level (stable random values).
 *   - Streak geometries created with real React useMemo.
 *
 * Deps: gsap @react-three/fiber @react-three/drei three
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProceduralSupercar from './ProceduralSupercar';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════
   1 ── PERFORMANCE SHOWCASE
   ═══════════════════════════════════════════════════════════ */
const SPECS = [
  { label: 'Horsepower',  value: 612,  unit: 'HP',   color: '#0ea5e9' },
  { label: 'Torque',      value: 750,  unit: 'Nm',   color: '#22d3ee' },
  { label: 'Top Speed',   value: 305,  unit: 'km/h', color: '#10b981' },
  { label: '0 – 100',     value: 3.4,  unit: 'sec',  color: '#6ee7b7', dec: 1 },
];

function AnimatedStat({ stat, active }) {
  const [val, setVal] = useState(0);
  const raf = useRef();

  useEffect(() => {
    if (!active) return;
    const t0  = performance.now();
    const dur = 1700;
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setVal(stat.dec ? (e * stat.value).toFixed(stat.dec) : Math.round(e * stat.value));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, stat.value, stat.dec]);

  return (
    <div style={{
      textAlign: 'center', padding: '32px 20px',
      border: `1px solid ${stat.color}22`,
      borderRadius: 14,
      background: `linear-gradient(135deg,${stat.color}08,transparent)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Corner accents */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
        <div key={v+h} style={{
          position: 'absolute', [v]: -1, [h]: -1,
          width: 14, height: 14,
          borderTop:    v === 'top'    ? `2px solid ${stat.color}` : 'none',
          borderBottom: v === 'bottom' ? `2px solid ${stat.color}` : 'none',
          borderLeft:   h === 'left'   ? `2px solid ${stat.color}` : 'none',
          borderRight:  h === 'right'  ? `2px solid ${stat.color}` : 'none',
          opacity: active ? 1 : 0, transition: 'opacity 0.5s',
        }} />
      ))}

      {/* Value */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: 'clamp(40px,5.5vw,68px)',
        fontWeight: 900, color: stat.color,
        letterSpacing: -2, lineHeight: 1,
        textShadow: `0 0 40px ${stat.color}55`,
      }}>{val}</div>

      <div style={{ fontFamily: 'monospace', fontSize: 12, color: stat.color,
                    opacity: 0.65, letterSpacing: 3, marginTop: 5,
                    textTransform: 'uppercase' }}>{stat.unit}</div>

      <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 2,
                    marginTop: 8, textTransform: 'uppercase' }}>{stat.label}</div>

      {/* Scan-line animation */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg,transparent,${stat.color},transparent)`,
        animation: active ? 'perf-scan 2.4s ease-in-out infinite' : 'none',
        opacity: 0.35,
      }} />
    </div>
  );
}

function PerformanceSection() {
  const ref    = useRef();
  const title  = useRef();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const st = ScrollTrigger.create({
      trigger: ref.current, start: 'top 60%', once: true,
      onEnter: () => setActive(true),
    });
    gsap.fromTo(title.current,
      { opacity: 0, y: 48 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 72%', once: true } }
    );
    return () => st.kill();
  }, []);

  return (
    <section ref={ref} style={{ padding: '100px 7vw', background: 'var(--bg-root,#020c18)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={title} style={{ opacity: 0, marginBottom: 64, textAlign: 'center' }}>
          <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#0ea5e9',
                      letterSpacing: 5, textTransform: 'uppercase', marginBottom: 14 }}>
            Performance DNA
          </p>
          <h2 style={{
            fontFamily: 'monospace',
            fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800,
            color: '#f1f5f9', letterSpacing: -1, lineHeight: 1,
          }}>
            Numbers That <br />
            <span style={{
              background: 'linear-gradient(90deg,#0ea5e9,#22d3ee,#10b981)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Define Excellence</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24 }}>
          {SPECS.map((s, i) => <AnimatedStat key={i} stat={s} active={active} />)}
        </div>

        <div style={{
          marginTop: 52, height: 1,
          background: 'linear-gradient(90deg,transparent,#0ea5e9,#22d3ee,transparent)',
          opacity: active ? 1 : 0, transition: 'opacity 1s 0.8s',
        }} />
      </div>

      <style>{`
        @keyframes perf-scan {
          0%   { top: 10%; opacity: 0; }
          25%  { opacity: 0.35; }
          75%  { opacity: 0.35; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   2 ── EXPLODED VIEW  (uses ProceduralSupercar)
   ═══════════════════════════════════════════════════════════ */
function ExplodedSection() {
  const sectionRef = useRef();
  const titleRef   = useRef();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;

    /* Pin + scrub: scroll drives the explode animation */
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=110%',
      pin: true,
      scrub: 1.8,
      anticipatePin: 1,
      onUpdate: self => setProgress(self.progress),
    });

    gsap.fromTo(titleRef.current,
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true } }
    );

    return () => st.kill();
  }, []);

  const stageLabel =
    progress < 0.18 ? 'ASSEMBLED' :
    progress < 0.48 ? 'SEPARATING…' :
    progress < 0.82 ? 'EXPLODED VIEW' : 'ANATOMY';

  return (
    <div ref={sectionRef} style={{
      position: 'relative', height: '100vh', overflow: 'hidden',
      background: 'radial-gradient(ellipse at 50% 100%, #031828 0%, #010810 60%)',
    }}>
      {/* 3-D canvas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas
          camera={{ position: [3.2, 2.4, 8.5], fov: 48 }}
          dpr={[1, 1.4]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.0, outputColorSpace: THREE.SRGBColorSpace }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Lights tuned for physical materials without HDR floor */}
          <ambientLight intensity={0.55} color="#0a1825" />
          <directionalLight position={[6, 10, 5]}  intensity={1.2} color="#cce8ff" />
          <directionalLight position={[-5, 4, -4]} intensity={1.1} color="#0ea5e9" />
          <directionalLight position={[0,  2,  8]} intensity={0.6} color="#22d3ee" />
          <pointLight       position={[0, -1,  0]} intensity={1.8} color="#0ea5e9" distance={8} />

          <Environment preset="night" background={false} />

          <ProceduralSupercar explodeProgress={progress} />
        </Canvas>
      </div>

      {/* Text overlay */}
      <div ref={titleRef} style={{
        opacity: 0, position: 'absolute',
        top: '9%', left: '7vw', zIndex: 10, maxWidth: 360,
      }}>
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#0ea5e9',
                    letterSpacing: 5, textTransform: 'uppercase', marginBottom: 12 }}>
          Engineering
        </p>
        <h2 style={{
          fontFamily: 'monospace',
          fontSize: 'clamp(22px,3.2vw,44px)',
          fontWeight: 800, color: '#f1f5f9', letterSpacing: -0.5, lineHeight: 1.1,
        }}>
          Every Component<br />
          Engineered to<br />
          <span style={{
            background: 'linear-gradient(90deg,#0ea5e9,#22d3ee)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Perfection</span>
        </h2>
        <p style={{ marginTop: 18, fontSize: 12, color: '#475569', lineHeight: 1.7 }}>
          Scroll to separate every panel, wheel and component.
        </p>
      </div>

      {/* Stage label */}
      <div style={{
        position: 'absolute', bottom: '12%', left: '50%',
        transform: 'translateX(-50%)', zIndex: 10,
        fontFamily: 'monospace', fontSize: 10,
        color: '#0ea5e9', letterSpacing: 4,
        textTransform: 'uppercase', opacity: 0.65,
      }}>
        {stageLabel}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: '8%', left: '50%',
        transform: 'translateX(-50%)',
        width: 200, height: 1,
        background: 'rgba(14,165,233,0.14)', zIndex: 10,
      }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          background: 'linear-gradient(90deg,#0ea5e9,#22d3ee)',
          transition: 'width 0.08s',
        }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3 ── SPEED TUNNEL
   Random parameters at MODULE LEVEL so values are stable
   across renders (fixes the broken fake-useMemo from v1).
   ═══════════════════════════════════════════════════════════ */
const STREAK_PARAMS = Object.freeze(
  Array.from({ length: 80 }, () => ({
    angle:      Math.random() * Math.PI * 2,
    radius:     0.06 + Math.random() * 0.62,
    len:        0.10 + Math.random() * 0.32,
    speed:      0.4  + Math.random() * 1.8,
    phase:      Math.random(),
    brightness: 0.30 + Math.random() * 0.70,
    isCyan:     Math.random() > 0.72,
  })),
);

/* One StreakLine per entry — animates position & opacity in useFrame */
function StreakLine({ s, geo }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t     = clock.getElapsedTime();
    const phase = ((t * s.speed * 0.25 + s.phase) % 1);
    const r     = s.radius;
    ref.current.position.set(
      Math.cos(s.angle) * r * 3.6,
      Math.sin(s.angle) * r * 3.6,
      -phase * 15,
    );
    ref.current.material.opacity = (1 - phase) * s.brightness * 0.68;
  });
  return (
    <line ref={ref} geometry={geo}>
      <lineBasicMaterial
        color={s.isCyan ? '#22d3ee' : '#0ea5e9'}
        transparent opacity={0.5}
      />
    </line>
  );
}

function SpeedTunnelCanvas() {
  /* Geometries created ONCE via real React useMemo */
  const geoList = useMemo(() =>
    STREAK_PARAMS.map(s => {
      const pts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -s.len * 8),
      ];
      return new THREE.BufferGeometry().setFromPoints(pts);
    }),
  []);

  return (
    <>
      <ambientLight intensity={0.12} />
      <pointLight position={[0, 0, 2.5]} intensity={3.5} color="#0ea5e9" />

      {/* Streaks */}
      {STREAK_PARAMS.map((s, i) => (
        <StreakLine key={i} s={s} geo={geoList[i]} />
      ))}

      {/* Tunnel rings */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[0, 0, -i * 3.2]}>
          <torusGeometry args={[1.65 + i * 0.10, 0.007, 6, 56]} />
          <meshBasicMaterial
            color="#0ea5e9" transparent
            opacity={0.07 + (i / 12) * 0.055}
          />
        </mesh>
      ))}
    </>
  );
}

function SpeedSection() {
  const sectionRef = useRef();
  const textRef    = useRef();

  useEffect(() => {
    if (!textRef.current) return;
    const chars = textRef.current.querySelectorAll('.sp-ch');
    gsap.fromTo(chars,
      { opacity: 0, y: '115%' },
      { opacity: 1, y: '0%', stagger: 0.03, duration: 0.72, ease: 'power4.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', once: true } }
    );
  }, []);

  const HEADLINE = '300 KM/H';

  return (
    <section ref={sectionRef} style={{ position: 'relative', height: '100vh', overflow: 'hidden', background: '#010810' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas
          camera={{ position: [0, 0, 3.6], fov: 74 }}
          dpr={[1, 1.4]}
          style={{ width: '100%', height: '100%' }}
        >
          <SpeedTunnelCanvas />
        </Canvas>
      </div>

      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 28%, rgba(1,8,16,0.82) 100%)',
      }} />

      {/* Big number */}
      <div ref={textRef} style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        textAlign: 'center', zIndex: 10,
      }}>
        <div style={{ overflow: 'hidden', marginBottom: 14 }}>
          {HEADLINE.split('').map((ch, i) => (
            <span key={i} className="sp-ch" style={{
              display: 'inline-block',
              fontFamily: 'monospace',
              fontSize: 'clamp(50px,10vw,128px)',
              fontWeight: 900, color: '#f1f5f9',
              letterSpacing: -3,
              textShadow: '0 0 80px rgba(14,165,233,0.45)',
            }}>{ch === ' ' ? '\u00A0' : ch}</span>
          ))}
        </div>
        <p style={{
          fontFamily: 'monospace', fontSize: 10,
          color: '#0ea5e9', letterSpacing: 6,
          textTransform: 'uppercase', opacity: 0.65,
        }}>
          Pure adrenaline · Tamed for the road
        </p>
      </div>

      <div style={{
        position: 'absolute', left: '6vw', top: '50%',
        transform: 'translateY(-50%)',
        fontFamily: 'monospace', fontSize: 8,
        color: 'rgba(14,165,233,0.28)',
        letterSpacing: 3, textTransform: 'uppercase',
        writingMode: 'vertical-rl', pointerEvents: 'none',
      }}>
        Velocity · Precision · Control
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════ */
export default function ScrollStory() {
  return (
    <>
      <PerformanceSection />
      <ExplodedSection />
      <SpeedSection />
    </>
  );
}