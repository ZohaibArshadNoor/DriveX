/**
 * FinalCTA.jsx
 * Place at: src/components/landing/FinalCTA.jsx
 *
 * Cinematic final section:
 *  - Aurora sky shader (via Three.js ShaderMaterial on a full-screen plane)
 *  - Reflective rooftop floor
 *  - Magnetic CTA button
 *  - Split-text headline reveal
 *  - Particle drift overlay
 *  - Footer
 *
 * Navigation links preserved; no RBAC changes.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuroraShader } from '../../shaders/AuroraShader';

gsap.registerPlugin(ScrollTrigger);

/* ── Aurora background plane ─────────────────────────────── */
function AuroraPlane() {
  const matRef = useRef();

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh scale={[20, 12, 1]} position={[0, 0, -2]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={AuroraShader.vertexShader}
        fragmentShader={AuroraShader.fragmentShader}
        uniforms={THREE.UniformsUtils.clone(AuroraShader.uniforms)}
      />
    </mesh>
  );
}

/* ── Reflective floor plane ─────────────────────────────────── */
function CTAFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial
        color="#010810"
        metalness={0.95}
        roughness={0.08}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}

/* ── Floating particles ──────────────────────────────────── */
function CTAParticles() {
  const ref = useRef();
  const count = 300;

  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 24;
    positions[i * 3 + 1] = Math.random() * 8 - 1;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    const c = Math.random() > 0.5;
    colors[i * 3]     = c ? 0.05 : 0.13;
    colors[i * 3 + 1] = c ? 0.65 : 0.83;
    colors[i * 3 + 2] = 0.92;
  }

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y += 0.0003;
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color"    array={colors}    count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} />
    </points>
  );
}

/* ── 3D CTA Canvas ───────────────────────────────────────── */
function CTACanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      dpr={[1, 1.5]}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.3} color="#0a1a2e" />
      <pointLight position={[0, 4, 2]} intensity={2} color="#0ea5e9" />
      <AuroraPlane />
      <CTAFloor />
      <CTAParticles />
    </Canvas>
  );
}

/* ── Magnetic button ─────────────────────────────────────── */
function MagneticButton({ children, onClick, primary = true }) {
  const btnRef    = useRef(null);
  const [hov, setHov] = useState(false);

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const dx   = e.clientX - (rect.left + rect.width / 2);
    const dy   = e.clientY - (rect.top  + rect.height / 2);
    gsap.to(btnRef.current, {
      x: dx * 0.28, y: dy * 0.28,
      duration: 0.35, ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    setHov(false);
  };

  return (
    <div
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setHov(true)}
      style={{ display: 'inline-block' }}
    >
      <button
        onClick={onClick}
        style={{
          padding: '16px 44px',
          fontSize: 13,
          fontFamily: "'Orbitron', monospace",
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          border: primary
            ? 'none'
            : '1px solid rgba(14,165,233,0.3)',
          borderRadius: 6,
          cursor: 'pointer',
          background: primary
            ? hov
              ? 'linear-gradient(135deg, #0284c7, #0ea5e9)'
              : 'linear-gradient(135deg, #0ea5e9, #22d3ee)'
            : hov
              ? 'rgba(14,165,233,0.12)'
              : 'transparent',
          color: primary ? '#020c18' : '#f1f5f9',
          boxShadow: primary && hov
            ? '0 0 50px rgba(14,165,233,0.55), 0 0 120px rgba(14,165,233,0.15)'
            : primary
              ? '0 0 30px rgba(14,165,233,0.25)'
              : 'none',
          transition: 'background 0.25s, box-shadow 0.25s, color 0.25s',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer */}
        {primary && hov && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
            animation: 'cta-shimmer 0.6s ease',
          }} />
        )}
        {children}
      </button>
    </div>
  );
}

/* ── Split headline ──────────────────────────────────────── */
function SplitHeadline({ text, gradient = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const spans = ref.current.querySelectorAll('.hl-char');
    gsap.fromTo(spans,
      { opacity: 0, y: '110%', rotateX: 45 },
      {
        opacity: 1, y: '0%', rotateX: 0,
        stagger: 0.025, duration: 0.75, ease: 'power4.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
      }
    );
  }, []);

  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <span style={{
        display: 'inline-block',
        fontFamily: "'Orbitron', monospace",
        fontSize: 'clamp(36px, 5.5vw, 78px)',
        fontWeight: 900,
        letterSpacing: -2,
        lineHeight: 1,
        ...(gradient ? {
          background: 'linear-gradient(90deg, #0ea5e9, #22d3ee, #10b981)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% 100%',
          animation: 'aurora-text 4s ease infinite',
        } : { color: '#f1f5f9' }),
      }}>
        {text.split('').map((ch, i) => (
          <span key={i} className="hl-char" style={{
            display: 'inline-block',
            ...(ch === ' ' ? { minWidth: '0.3em' } : {}),
          }}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </span>
    </div>
  );
}

/* ── Trust badges ────────────────────────────────────────── */
function TrustBadge({ icon, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 16px',
      border: '1px solid rgba(14,165,233,0.15)',
      borderRadius: 20,
      background: 'rgba(14,165,233,0.05)',
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 10, color: '#64748b', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'monospace' }}>
        {label}
      </span>
    </div>
  );
}

/* ── MAIN EXPORT ─────────────────────────────────────────── */
export default function FinalCTA({ user }) {
  const navigate   = useNavigate();
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  /* Content parallax-fade on scroll */
  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
      }
    );
  }, []);

  return (
    <>
      {/* ── CTA Section ────────────────────────────────────── */}
      <section
        ref={sectionRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '100px 7vw 80px',
        }}
      >
        {/* 3D Aurora Canvas */}
        <CTACanvas />

        {/* Vignette overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(1,8,16,0.3) 0%, rgba(1,8,16,0.75) 100%)',
        }} />

        {/* Ground fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
          background: 'linear-gradient(to top, #020c18, transparent)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div
          ref={contentRef}
          style={{
            position: 'relative', zIndex: 10,
            textAlign: 'center',
            maxWidth: 760,
            opacity: 0,
          }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 20,
            background: 'rgba(14,165,233,0.08)',
            border: '1px solid rgba(14,165,233,0.2)',
            marginBottom: 36,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse-dot 2s ease infinite',
            }} />
            <span style={{
              fontFamily: 'monospace', fontSize: 9,
              color: '#0ea5e9', letterSpacing: 4,
              textTransform: 'uppercase',
            }}>
              Premium Car Rental · Pakistan
            </span>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: 12 }}>
            <SplitHeadline text="The Future of" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <SplitHeadline text="Driving Starts" gradient />
          </div>
          <div style={{ marginBottom: 36 }}>
            <SplitHeadline text="Here." />
          </div>

          {/* Sub */}
          <p style={{
            fontSize: 15, color: '#64748b', lineHeight: 1.8,
            maxWidth: 480, margin: '0 auto 48px',
          }}>
            Join thousands of drivers who've discovered the DriveX difference.
            Premium fleet. Transparent pricing. Unforgettable journeys.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex', gap: 16, justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: 48,
          }}>
            {!user ? (
              <>
                <MagneticButton onClick={() => navigate('/register')} primary>
                  Start Your Journey →
                </MagneticButton>
                <MagneticButton onClick={() => navigate('/login')} primary={false}>
                  Sign In
                </MagneticButton>
              </>
            ) : (
              <MagneticButton onClick={() => navigate('/vehicles')} primary>
                Browse Fleet →
              </MagneticButton>
            )}
          </div>

          {/* Trust badges */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
          }}>
            <TrustBadge icon="🔒" label="Secure Booking" />
            <TrustBadge icon="⚡" label="Instant Confirmation" />
            <TrustBadge icon="📞" label="24/7 Support" />
          </div>
        </div>

        {/* Side decorations */}
        <div style={{
          position: 'absolute', left: '5vw', top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'monospace', fontSize: 9,
          color: 'rgba(14,165,233,0.2)',
          letterSpacing: 3, textTransform: 'uppercase',
          writingMode: 'vertical-rl',
        }}>
          DriveX Premium · Est. 2024
        </div>
        <div style={{
          position: 'absolute', right: '5vw', top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'monospace', fontSize: 9,
          color: 'rgba(14,165,233,0.2)',
          letterSpacing: 3, textTransform: 'uppercase',
          writingMode: 'vertical-lr',
        }}>
          Bahria University KHI · Zohaib Arshad Noor
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(14,165,233,0.08)',
        padding: '32px 7vw',
        background: '#010810',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 22, fontWeight: 900,
          color: '#f1f5f9', letterSpacing: -0.5,
        }}>
          Drive<span style={{ color: '#0ea5e9' }}>X</span>
        </div>

        {/* Copyright */}
        <div style={{ fontSize: 11, color: '#334155', letterSpacing: 0.5 }}>
          © 2026 DriveX · Bahria University KHI · Zohaib Arshad Noor
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {[['Fleet', '/vehicles'], ['Login', '/login'], ['Register', '/register']].map(([label, to]) => (
            <Link key={label} to={to} style={{
              fontSize: 11, color: '#475569',
              textDecoration: 'none', letterSpacing: 1,
              fontFamily: 'monospace', textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0ea5e9'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
            >
              {label}
            </Link>
          ))}
        </nav>
      </footer>

      {/* Keyframes */}
      <style>{`
        @keyframes cta-shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%);  }
        }
        @keyframes aurora-text {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </>
  );
}