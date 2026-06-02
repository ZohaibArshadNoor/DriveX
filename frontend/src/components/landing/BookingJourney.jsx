/**
 * BookingJourney.jsx
 * Place at: src/components/landing/BookingJourney.jsx
 *
 * Horizontally-scrolled (GSAP-pinned) booking process steps.
 * Each step is a glowing panel that lights up as the path
 * progresses across the screen.
 *
 * Does NOT touch any booking logic — purely presentational.
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── Step data ───────────────────────────────────────────── */
const STEPS = [
  {
    number: '01',
    icon: '🔍',
    title: 'Browse Fleet',
    description: 'Explore our curated premium fleet. Filter by category, price, or availability. No account needed to browse.',
    color: '#0ea5e9',
    detail: 'Sedans · SUVs · Luxury · Sports',
  },
  {
    number: '02',
    icon: '🪪',
    title: 'Verify Identity',
    description: "Create your account and upload your driver's license. Verification takes under 24 hours.",
    color: '#22d3ee',
    detail: 'CNIC · License · Selfie Verification',
  },
  {
    number: '03',
    icon: '📅',
    title: 'Book Your Dates',
    description: 'Select your pick-up and drop-off dates. Real-time conflict detection prevents double booking.',
    color: '#10b981',
    detail: 'Hourly · Daily · Weekly rates',
  },
  {
    number: '04',
    icon: '💳',
    title: 'Secure Payment',
    description: 'Pay 30% advance to confirm. Multiple payment options. Your booking is instantly locked in.',
    color: '#6ee7b7',
    detail: 'JazzCash · EasyPaisa · Bank Transfer',
  },
  {
    number: '05',
    icon: '🚗',
    title: 'Drive Away',
    description: 'Admin approves your booking. Collect the keys at pick-up time. Your journey begins.',
    color: '#34d399',
    detail: 'GPS Tracker · 24/7 Support',
  },
];

/* ── Step card ───────────────────────────────────────────── */
function StepCard({ step, index, isLast }) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch',
      flexShrink: 0,
    }}>
      {/* Card */}
      <div className={`step-card step-${index}`} style={{
        width: 320,
        padding: '40px 32px',
        border: `1px solid rgba(14,165,233,0.12)`,
        borderRadius: 16,
        background: 'rgba(2,12,24,0.9)',
        backdropFilter: 'blur(24px)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.4s, box-shadow 0.4s',
        flexShrink: 0,
      }}>
        {/* Top accent bar */}
        <div className={`step-accent step-accent-${index}`} style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${step.color}80, ${step.color})`,
          transform: 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.5s ease',
        }} />

        {/* Corner brackets */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          width: 16, height: 16,
          borderTop: `1px solid ${step.color}50`,
          borderLeft: `1px solid ${step.color}50`,
        }} />
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          width: 16, height: 16,
          borderBottom: `1px solid ${step.color}50`,
          borderRight: `1px solid ${step.color}50`,
        }} />

        {/* Step number */}
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 72, fontWeight: 900,
          color: step.color,
          opacity: 0.07,
          lineHeight: 1,
          position: 'absolute',
          top: 20, right: 20,
          userSelect: 'none',
        }}>
          {step.number}
        </div>

        {/* Icon */}
        <div style={{
          fontSize: 36, marginBottom: 20,
          filter: `drop-shadow(0 0 12px ${step.color}60)`,
        }}>
          {step.icon}
        </div>

        {/* Step label */}
        <div style={{
          fontFamily: 'monospace',
          fontSize: 9, color: step.color,
          letterSpacing: 4, textTransform: 'uppercase',
          marginBottom: 10, opacity: 0.7,
        }}>
          Step {step.number}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 20, fontWeight: 800,
          color: '#f1f5f9', letterSpacing: -0.3,
          marginBottom: 14,
        }}>
          {step.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 13.5, color: '#64748b',
          lineHeight: 1.75, marginBottom: 20,
        }}>
          {step.description}
        </p>

        {/* Detail tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 20,
          fontSize: 9, letterSpacing: 1, fontFamily: 'monospace',
          textTransform: 'uppercase',
          background: `${step.color}0d`,
          border: `1px solid ${step.color}22`,
          color: step.color,
        }}>
          {step.detail}
        </div>

        {/* Glow on active */}
        <div className={`step-glow step-glow-${index}`} style={{
          position: 'absolute', bottom: -30, left: '50%',
          transform: 'translateX(-50%)',
          width: '80%', height: 60,
          background: `radial-gradient(ellipse, ${step.color}20, transparent)`,
          filter: 'blur(20px)',
          opacity: 0,
          transition: 'opacity 0.4s',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Connector arrow (not on last) */}
      {!isLast && (
        <div className={`step-arrow step-arrow-${index}`} style={{
          display: 'flex', alignItems: 'center',
          padding: '0 20px', flexShrink: 0,
        }}>
          <div style={{ position: 'relative', width: 60, height: 1 }}>
            <div className={`arrow-line arrow-line-${index}`} style={{
              position: 'absolute', left: 0, right: 0, top: 0,
              height: 1, background: 'rgba(14,165,233,0.15)',
              transformOrigin: 'left',
            }} />
            <div style={{
              position: 'absolute', right: -4, top: -3,
              width: 0, height: 0,
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderLeft: '8px solid rgba(14,165,233,0.2)',
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── MAIN BookingJourney ─────────────────────────────────── */
export default function BookingJourney() {
  const sectionRef  = useRef(null);
  const trackRef    = useRef(null);
  const titleRef    = useRef(null);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const track      = trackRef.current;
    const totalScroll = track.scrollWidth - window.innerWidth + 140;

    /* Horizontal scroll pin */
    const st = gsap.to(track, {
      x: () => -totalScroll,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        start: 'top top',
        end: () => `+=${totalScroll + 400}`,
        scrub: 1.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          /* Activate cards progressively */
          STEPS.forEach((_, i) => {
            const threshold = i / STEPS.length;
            const isActive  = self.progress >= threshold - 0.05;
            const card    = sectionRef.current?.querySelector(`.step-accent-${i}`);
            const glow    = sectionRef.current?.querySelector(`.step-glow-${i}`);
            const line    = sectionRef.current?.querySelector(`.arrow-line-${i}`);
            if (card) card.style.transform = isActive ? 'scaleX(1)' : 'scaleX(0)';
            if (glow) glow.style.opacity   = isActive ? '1' : '0';
            if (line && i < STEPS.length - 1) {
              const activated = self.progress >= (i + 1) / STEPS.length - 0.08;
              line.style.background = activated
                ? 'linear-gradient(90deg, #0ea5e9, #22d3ee)'
                : 'rgba(14,165,233,0.15)';
            }
          });
        },
      },
    });

    /* Title reveal */
    if (titleRef.current) {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
        }
      );
    }

    return () => { st.scrollTrigger?.kill(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #010810, #020c18)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 100% 60% at 50% 50%, rgba(14,165,233,0.04), transparent)',
      }} />

      {/* Title (stays fixed while cards scroll) */}
      <div ref={titleRef} style={{
        opacity: 0,
        flexShrink: 0,
        padding: '0 7vw',
        marginBottom: 52,
      }}>
        <p style={{
          fontFamily: 'monospace', fontSize: 10, color: '#0ea5e9',
          letterSpacing: 5, textTransform: 'uppercase', marginBottom: 14,
        }}>
          How It Works
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 'clamp(26px, 3.5vw, 48px)',
            fontWeight: 800, color: '#f1f5f9',
            letterSpacing: -1, lineHeight: 1,
          }}>
            Your Journey<br />
            <span style={{
              background: 'linear-gradient(90deg, #0ea5e9, #22d3ee)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Starts Here</span>
          </h2>
          <p style={{
            fontSize: 13, color: '#475569', maxWidth: 260,
            lineHeight: 1.6,
          }}>
            Five simple steps from browsing to driving. Scroll to explore the journey.
          </p>
        </div>
      </div>

      {/* Horizontal track */}
      <div style={{
        overflow: 'hidden',
        flexShrink: 0,
        paddingBottom: 8,
      }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            alignItems: 'stretch',
            paddingLeft: '7vw',
            paddingRight: '7vw',
            gap: 0,
            willChange: 'transform',
          }}
        >
          {STEPS.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              index={i}
              isLast={i === STEPS.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'rgba(14,165,233,0.25)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Scroll hint */}
      <div style={{
        position: 'absolute', right: '5vw', top: '50%',
        transform: 'translateY(-50%)',
        fontFamily: 'monospace', fontSize: 9,
        color: 'rgba(14,165,233,0.3)',
        letterSpacing: 3, textTransform: 'uppercase',
        writingMode: 'vertical-rl',
      }}>
        Scroll →
      </div>
    </section>
  );
}