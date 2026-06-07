/**
 * LandingPage.jsx  v5 — Final
 * Place at: src/pages/public/LandingPage.jsx
 *
 * WHAT THIS FILE DOES
 *  • Orchestrates all 8 cinematic sections.
 *  • Boots Lenis smooth-scroll (synced with GSAP ticker).
 *  • Tracks mouse position via a ref (zero re-renders).
 *  • Lazy-loads every below-fold section via IntersectionObserver
 *    so the browser only downloads chunks as they approach the viewport.
 *
 * WHAT THIS FILE DOES NOT DO
 *  • Render a Navbar — the shared Navbar (src/components/shared/Navbar.jsx)
 *    is already rendered by your App router layout for every route.
 *    Do NOT add another one here.
 *  • Touch auth / RBAC / API endpoints — all unchanged.
 *
 * FONT  (add to public/index.html <head> once):
 *   <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap" rel="stylesheet">
 *
 * DEPS:
 *   npm install @studio-freight/lenis gsap
 *   npm install @react-three/fiber @react-three/drei three
 *   npm install @react-three/postprocessing
 */

import {
  Suspense, lazy,
  useEffect, useRef, useState,
  useMemo, memo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis }            from '../../hooks/useLenis';
import { useScrollAnimations } from '../../hooks/useScrollAnimations';
import RunwaySection from '../../components/landing/RunwaySection';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────
   LAZY SECTIONS
   Each section only starts downloading when the IntersectionObserver
   sentinel (inside LazySection) enters the viewport.
   ───────────────────────────────────────────────────────────── */
const HeroScene        = lazy(() => import('../../components/landing/HeroScene'));
const ScrollStory      = lazy(() => import('../../components/landing/ScrollStory'));
const FleetShowcase    = lazy(() => import('../../components/landing/FleetShowcase'));
const HolographicStats = lazy(() => import('../../components/landing/HolographicStats'));
const BookingJourney   = lazy(() => import('../../components/landing/BookingJourney'));
const FinalCTA         = lazy(() => import('../../components/landing/FinalCTA'));

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES — injected once into <head> via a single <style>
   ───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  canvas { outline: none; }

  ::-webkit-scrollbar              { width: 4px; }
  ::-webkit-scrollbar-track        { background: #010810; }
  ::-webkit-scrollbar-thumb        { background: rgba(14,165,233,0.3); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover  { background: rgba(14,165,233,0.6); }

  @keyframes hero-pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
  @keyframes aurora-text { 0%,100%{background-position:0% 50%}   50%{background-position:100% 50%} }
  @keyframes scroll-cue  {
    0%  {opacity:0;transform:scaleY(0);transform-origin:top}
    40% {opacity:1;transform:scaleY(1)}
    100%{opacity:0;transform:scaleY(1) translateY(18px)}
  }
  @keyframes blink-dim   { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes skel-pulse  { 0%,100%{opacity:.3;transform:scaleX(.5)} 50%{opacity:1;transform:scaleX(1)} }
  @keyframes btn-shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }

  .hero-btn-p:hover {
    background: linear-gradient(135deg,#0284c7,#0ea5e9) !important;
    box-shadow: 0 0 36px rgba(14,165,233,.5);
    transform: translateY(-2px);
  }
  .hero-btn-g:hover {
    background: rgba(14,165,233,.08) !important;
    transform: translateY(-2px);
  }
`;

/* ─────────────────────────────────────────────────────────────
   LAZY SECTION WRAPPER
   Renders a 1px sentinel; once it enters the viewport the real
   Suspense boundary activates and the chunk downloads.
   ───────────────────────────────────────────────────────────── */
function LazySection({ children, fallback, rootMargin = '400px' }) {
  const sentinelRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);

  return (
    <>
      <div ref={sentinelRef} style={{ height: 1 }} aria-hidden />
      {visible
        ? <Suspense fallback={fallback}>{children}</Suspense>
        : fallback}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKELETON FALLBACK
   ───────────────────────────────────────────────────────────── */
function Skeleton({ height = '60vh' }) {
  return (
    <div style={{ height, background: '#010810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 120, height: 1,
        background: 'linear-gradient(90deg,transparent,rgba(14,165,233,.4),transparent)',
        animation: 'skel-pulse 1.5s ease infinite',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO BUTTONS  (CSS hover, no useState = zero re-renders)
   ───────────────────────────────────────────────────────────── */
function HeroBtn({ children, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      className={primary ? 'hero-btn-p' : 'hero-btn-g'}
      style={{
        padding: '12px 28px',
        fontFamily: 'Orbitron, monospace',
        fontSize: 11, fontWeight: 800, letterSpacing: 1.5,
        textTransform: 'uppercase',
        border: primary ? 'none' : '1px solid rgba(14,165,233,.25)',
        borderRadius: 6,
        background: primary
          ? 'linear-gradient(135deg,#0ea5e9,#22d3ee)'
          : 'transparent',
        color: primary ? '#020c18' : '#f1f5f9',
        cursor: 'pointer',
        transition: 'all .25s',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO TEXT  (memo — renders exactly once)
   ───────────────────────────────────────────────────────────── */
const HeroText = memo(function HeroText({ navigate }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-reveal]',
        { opacity: 0, y: 68 },
        { opacity: 1, y: 0, stagger: 0.14, duration: 1.2, ease: 'power4.out', delay: 0.8 },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const miniStats = useMemo(() => [
    ['50+',    'Vehicles'],
    ['2,400+', 'Happy Renters'],
    ['Rs 2,800','Avg / Day'],
  ], []);

  return (
    <div ref={ref} style={{
      position: 'absolute', zIndex: 10,
      top: '50%', transform: 'translateY(-50%)',
      left: 0, padding: '0 7vw', maxWidth: 700,
    }}>
      {/* Badge */}
      <div data-reveal style={{ opacity: 0, marginBottom: 24 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 14px', borderRadius: 20,
          background: 'rgba(14,165,233,.08)',
          border: '1px solid rgba(14,165,233,.2)',
          fontFamily: 'monospace', fontSize: 9,
          color: '#0ea5e9', letterSpacing: 4, textTransform: 'uppercase',
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#10b981',
            animation: 'hero-pulse 2s ease infinite',
          }} />
          Premium Car Rental · Pakistan
        </span>
      </div>

      {/* H1 */}
      <div data-reveal style={{ opacity: 0 }}>
        <h1 style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 'clamp(46px,8vw,98px)',
          fontWeight: 900, lineHeight: 0.92,
          letterSpacing: -3, color: '#f1f5f9', marginBottom: 10,
        }}>
          Redefine<br />
          <span style={{
            background: 'linear-gradient(90deg,#0ea5e9,#22d3ee,#10b981)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 100%',
            animation: 'aurora-text 4s ease infinite',
          }}>How You</span><br />
          Drive.
        </h1>
      </div>

      {/* Sub-copy */}
      <div data-reveal style={{ opacity: 0, marginTop: 22, marginBottom: 40 }}>
        <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.75, maxWidth: 380 }}>
          Handpicked premium fleet. Transparent Rs pricing.
          Book in minutes, drive in hours.
        </p>
      </div>

      {/* CTAs */}
      <div data-reveal style={{ opacity: 0, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <HeroBtn onClick={() => navigate('/vehicles')} primary>Explore Fleet →</HeroBtn>
        <HeroBtn onClick={() => navigate('/register')}>Register Free</HeroBtn>
      </div>

      {/* Mini stats */}
      <div data-reveal style={{ opacity: 0, marginTop: 44, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {miniStats.map(([n, l]) => (
          <div key={l}>
            <div style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: 21, fontWeight: 900, color: '#0ea5e9', lineHeight: 1,
            }}>{n}</div>
            <div style={{
              fontSize: 9, color: '#475569',
              letterSpacing: 2, textTransform: 'uppercase',
              marginTop: 4, fontFamily: 'monospace',
            }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────
   SCROLL CUE  (purely decorative, no state)
   ───────────────────────────────────────────────────────────── */
function ScrollCue() {
  return (
    <div style={{
      position: 'absolute', bottom: 32, left: '50%',
      transform: 'translateX(-50%)', zIndex: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      pointerEvents: 'none',
    }}>
      <span style={{
        fontFamily: 'monospace', fontSize: 8,
        color: 'rgba(14,165,233,.35)', letterSpacing: 4, textTransform: 'uppercase',
      }}>Scroll</span>
      <div style={{
        width: 1, height: 46,
        background: 'linear-gradient(to bottom,#0ea5e9,transparent)',
        animation: 'scroll-cue 2s ease-in-out infinite',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LANDING PAGE
   ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate  = useNavigate();
  const pageRef   = useRef(null);

  /**
   * mouseRef — stores cursor position as {x,y} ∈ [-1,+1].
   * It's a REF, not state.  Mutating it never triggers a React re-render.
   * HeroScene reads .current inside its animation loop.
   */
  const mouseRef = useRef({ x: 0, y: 0 });

  /* Lenis smooth scroll (integrates with GSAP ticker automatically) */
  useLenis();

  /* Attach data-* scroll animations to elements inside pageRef */
  useScrollAnimations(pageRef, []);

  /* Mouse tracking — passive, ref-only, zero re-renders */
  useEffect(() => {
    const fn = (e) => {
      mouseRef.current.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight)  * 2 + 1;
    };
    window.addEventListener('mousemove', fn, { passive: true });
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  /* Debounced resize → ScrollTrigger refresh */
  useEffect(() => {
    let t;
    const fn = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 200); };
    window.addEventListener('resize', fn);
    return () => { window.removeEventListener('resize', fn); clearTimeout(t); };
  }, []);

  return (
    <div
      ref={pageRef}
      style={{
        background: '#020c18',
        minHeight: '100vh',
        overflowX: 'hidden',
        fontFamily: 'Orbitron, monospace',
        color: '#f1f5f9',
      }}
    >
      {/* Inject global CSS once */}
      <style>{GLOBAL_CSS}</style>

      {/* ── SECTION 1: Hero ──────────────────────────────── */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>

        {/* 3-D Canvas (above-the-fold → immediate Suspense, no LazySection) */}
        <Suspense fallback={
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 40% 50%,#031828,#010810)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'monospace', fontSize: 10,
              color: 'rgba(14,165,233,.4)', letterSpacing: 4,
              textTransform: 'uppercase', animation: 'blink-dim 1.5s ease infinite',
            }}>Initializing…</span>
          </div>
        }>
          {/*
           * mouseRef is stable (same object every render).
           * HeroScene reads mouseRef.current inside its R3F animation loop.
           * Changing the mouse NEVER causes this component to re-render.
           */}
          <HeroScene mousePos={mouseRef} />
        </Suspense>

        {/* Gradient overlays */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg,rgba(1,8,16,.92) 0%,rgba(1,8,16,.52) 44%,transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 180,
          background: 'linear-gradient(to top,#020c18,transparent)',
          pointerEvents: 'none',
        }} />

        <HeroText navigate={navigate} />

        <div style={{
          position: 'absolute', bottom: 104, right: '6vw',
          fontFamily: 'monospace', fontSize: 8,
          color: 'rgba(14,165,233,.28)', letterSpacing: 3,
          textTransform: 'uppercase', writingMode: 'vertical-rl',
          animation: 'blink-dim 3s ease infinite', pointerEvents: 'none',
        }}>
          Move cursor · headlights follow
        </div>

        <ScrollCue />
      </section>

      {/* ── SECTIONS 2-4: Scroll Story ───────────────────
          rootMargin="600px" — starts loading 600px before
          the sentinel enters the viewport → no pop-in.     */}
      {/* Runway: CSS-only, zero WebGL, no LazySection needed */}
      <RunwaySection />

      <LazySection fallback={<Skeleton height="300vh" />} rootMargin="600px">
        <ScrollStory />
      </LazySection>

      {/* ── SECTION 5: Fleet Showcase ─────────────────── */}
      <LazySection fallback={<Skeleton height="80vh" />} rootMargin="400px">
        <FleetShowcase />
      </LazySection>

      {/* ── SECTION 6: Holographic Stats ──────────────── */}
      <LazySection fallback={<Skeleton height="60vh" />} rootMargin="300px">
        <HolographicStats />
      </LazySection>

      {/* ── SECTION 7: Booking Journey ────────────────── */}
      <LazySection fallback={<Skeleton height="100vh" />} rootMargin="300px">
        <BookingJourney />
      </LazySection>

      {/* ── SECTION 8: Final CTA + Footer ────────────── */}
      <LazySection fallback={<Skeleton height="100vh" />} rootMargin="200px">
        {/*
         * FinalCTA reads auth from useAuthStore() internally
         * (same as the shared Navbar) — no user prop needed here.
         */}
        <FinalCTA />
      </LazySection>
    </div>
  );
}