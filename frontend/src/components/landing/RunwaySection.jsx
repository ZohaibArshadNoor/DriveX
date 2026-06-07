/**
 * RunwaySection.jsx
 * Place at: src/components/landing/RunwaySection.jsx
 *
 * Animated runway — pure CSS, zero WebGL, zero React state.
 * Four distinct SVG car silhouettes (supercar, luxury sedan,
 * low racer, SUV) drive past on a teal-lit road strip.
 *
 * Inspired by the HTML runway prototype, restyled to match
 * the DriveX teal/midnight theme.  Add between <HeroSection>
 * and <LazySection> in LandingPage.jsx.
 *
 * Performance: CSS keyframes are GPU-composited by the browser.
 * Zero JS on the hot path — no requestAnimationFrame, no state.
 */

const CARS = [
  /* duration, delay, bottom-offset, car component */
  { dur: '8s',  delay: '-1s',  bot: 2, Car: Supercar   },
  { dur: '13s', delay: '-6s',  bot: 2, Car: LuxurySed  },
  { dur: '9.5s',delay: '-9s',  bot: 2, Car: LowRacer   },
  { dur: '16s', delay: '-3s',  bot: 1, Car: SUVCar      },
];

/* ── Car SVGs ──────────────────────────────────────────────
   Each returns a pure SVG element (no React state).
   Colours kept within the teal/midnight palette.
   ───────────────────────────────────────────────────────── */

function Supercar() {
  return (
    <svg width="240" height="80" viewBox="0 0 240 80" fill="none">
      <ellipse cx="120" cy="72" rx="108" ry="7" fill="rgba(14,165,233,0.18)"/>
      {/* Lower body */}
      <rect x="8" y="42" width="224" height="22" rx="6" fill="#07182e"/>
      {/* Cabin */}
      <path d="M30 42 Q46 10 90 8 L158 8 Q196 14 210 42Z" fill="#0d2848"/>
      {/* Windshield */}
      <rect x="56" y="11" width="54" height="25" rx="3"
            fill="rgba(14,165,233,0.2)" stroke="rgba(14,165,233,0.55)" strokeWidth="0.7"/>
      {/* Rear window */}
      <rect x="118" y="11" width="54" height="25" rx="3"
            fill="rgba(14,165,233,0.2)" stroke="rgba(14,165,233,0.55)" strokeWidth="0.7"/>
      {/* Rear spoiler */}
      <rect x="194" y="35" width="38" height="4" rx="2" fill="#0ea5e9" opacity="0.75"/>
      <rect x="197" y="28" width="3" height="14" rx="1.5" fill="#0ea5e9" opacity="0.5"/>
      <rect x="228" y="28" width="3" height="14" rx="1.5" fill="#0ea5e9" opacity="0.5"/>
      {/* Sill LED */}
      <rect x="20" y="57" width="198" height="2" rx="1" fill="#0ea5e9" opacity="0.28"/>
      {/* Front wheel */}
      <circle cx="50"  cy="62" r="14" fill="#040e1c" stroke="#0ea5e9" strokeWidth="2.2"/>
      <circle cx="50"  cy="62" r="8"  fill="#081a30" stroke="#0ea5e9" strokeWidth="1.2"/>
      <circle cx="50"  cy="62" r="3"  fill="#0ea5e9"/>
      {/* Rear wheel */}
      <circle cx="189" cy="62" r="14" fill="#040e1c" stroke="#0ea5e9" strokeWidth="2.2"/>
      <circle cx="189" cy="62" r="8"  fill="#081a30" stroke="#0ea5e9" strokeWidth="1.2"/>
      <circle cx="189" cy="62" r="3"  fill="#0ea5e9"/>
      {/* Headlight */}
      <rect x="10" y="46" width="20" height="6" rx="3" fill="#fde68a" opacity="0.85"/>
      {/* DRL */}
      <rect x="10" y="53" width="13" height="2" rx="1" fill="#0ea5e9" opacity="0.5"/>
      {/* Tail light */}
      <rect x="212" y="46" width="22" height="6" rx="3" fill="#0ea5e9" opacity="0.95"/>
      {/* Speed streaks */}
      <rect x="0" y="47" width="55" height="1.5" rx="1" fill="rgba(14,165,233,0.15)"/>
      <rect x="0" y="52" width="40" height="1"   rx="1" fill="rgba(14,165,233,0.10)"/>
      <rect x="0" y="57" width="28" height="1"   rx="1" fill="rgba(14,165,233,0.07)"/>
    </svg>
  );
}

function LuxurySed() {
  return (
    <svg width="220" height="76" viewBox="0 0 220 76" fill="none">
      <ellipse cx="110" cy="69" rx="98" ry="6" fill="rgba(14,165,233,0.14)"/>
      <rect x="8" y="40" width="204" height="22" rx="6" fill="#061424"/>
      {/* Long elegant cabin */}
      <path d="M26 40 Q40 16 85 13 L145 13 Q178 18 196 40Z" fill="#0b2038"/>
      {/* Windshield */}
      <rect x="52" y="16" width="58" height="22" rx="3"
            fill="rgba(14,165,233,0.18)" stroke="rgba(14,165,233,0.45)" strokeWidth="0.6"/>
      {/* Rear window */}
      <rect x="118" y="16" width="50" height="22" rx="3"
            fill="rgba(14,165,233,0.18)" stroke="rgba(14,165,233,0.45)" strokeWidth="0.6"/>
      {/* Chrome belt line */}
      <rect x="28" y="38" width="164" height="1.5" rx="1" fill="rgba(14,165,233,0.35)"/>
      {/* Sill */}
      <rect x="18" y="55" width="182" height="2" rx="1" fill="rgba(14,165,233,0.22)"/>
      {/* Front wheel */}
      <circle cx="46"  cy="60" r="12" fill="#040e1c" stroke="#22d3ee" strokeWidth="2"/>
      <circle cx="46"  cy="60" r="7"  fill="#081a30" stroke="#22d3ee" strokeWidth="1"/>
      <circle cx="46"  cy="60" r="2.5" fill="#22d3ee"/>
      {/* Rear wheel */}
      <circle cx="176" cy="60" r="12" fill="#040e1c" stroke="#22d3ee" strokeWidth="2"/>
      <circle cx="176" cy="60" r="7"  fill="#081a30" stroke="#22d3ee" strokeWidth="1"/>
      <circle cx="176" cy="60" r="2.5" fill="#22d3ee"/>
      {/* Lights */}
      <rect x="8"   y="44" width="18" height="5" rx="2.5" fill="#fde68a" opacity="0.8"/>
      <rect x="195" y="44" width="18" height="5" rx="2.5" fill="#22d3ee" opacity="0.9"/>
      {/* Speed streaks */}
      <rect x="0" y="45" width="45" height="1.5" rx="1" fill="rgba(14,165,233,0.12)"/>
      <rect x="0" y="50" width="32" height="1"   rx="1" fill="rgba(14,165,233,0.08)"/>
    </svg>
  );
}

function LowRacer() {
  return (
    <svg width="260" height="72" viewBox="0 0 260 72" fill="none">
      <ellipse cx="130" cy="65" rx="118" ry="6" fill="rgba(14,165,233,0.18)"/>
      {/* Ultra-low body */}
      <rect x="6" y="44" width="248" height="18" rx="5" fill="#060e22"/>
      {/* Flat cabin */}
      <path d="M24 44 Q38 16 96 12 L172 12 Q218 16 236 44Z" fill="#0b1e3a"/>
      {/* Windshield very steep */}
      <rect x="60" y="14" width="58" height="26" rx="3"
            fill="rgba(14,165,233,0.22)" stroke="rgba(14,165,233,0.55)" strokeWidth="0.7"/>
      <rect x="128" y="14" width="58" height="26" rx="3"
            fill="rgba(14,165,233,0.22)" stroke="rgba(14,165,233,0.55)" strokeWidth="0.7"/>
      {/* Big rear wing */}
      <rect x="222" y="34" width="50" height="6" rx="3" fill="#0ea5e9" opacity="0.82"/>
      <rect x="226" y="25" width="4" height="20" rx="2" fill="#0ea5e9" opacity="0.55"/>
      <rect x="264" y="25" width="4" height="20" rx="2" fill="#0ea5e9" opacity="0.55"/>
      {/* Front splitter */}
      <rect x="4" y="56" width="30" height="3" rx="1.5" fill="#0ea5e9" opacity="0.4"/>
      {/* Dual exhaust */}
      <rect x="4" y="50" width="14" height="4" rx="2" fill="#1a2a40"/>
      <rect x="4" y="55" width="14" height="4" rx="2" fill="#1a2a40"/>
      {/* Sill */}
      <rect x="18" y="55" width="218" height="2" rx="1" fill="#0ea5e9" opacity="0.3"/>
      {/* Front wheel */}
      <circle cx="52"  cy="58" r="13" fill="#040e1c" stroke="#0ea5e9" strokeWidth="2.2"/>
      <circle cx="52"  cy="58" r="7"  fill="#081a30" stroke="#0ea5e9" strokeWidth="1.2"/>
      <circle cx="52"  cy="58" r="2.5" fill="#0ea5e9"/>
      {/* Rear wheel */}
      <circle cx="204" cy="58" r="13" fill="#040e1c" stroke="#0ea5e9" strokeWidth="2.2"/>
      <circle cx="204" cy="58" r="7"  fill="#081a30" stroke="#0ea5e9" strokeWidth="1.2"/>
      <circle cx="204" cy="58" r="2.5" fill="#0ea5e9"/>
      {/* Lights */}
      <rect x="8"   y="47" width="18" height="5" rx="2" fill="#fde68a" opacity="0.85"/>
      <rect x="234" y="47" width="18" height="5" rx="2" fill="#0ea5e9"/>
      {/* Speed streaks */}
      <rect x="0" y="47" width="60" height="2"   rx="1" fill="rgba(14,165,233,0.2)"/>
      <rect x="0" y="52" width="44" height="1.5" rx="1" fill="rgba(14,165,233,0.12)"/>
      <rect x="0" y="57" width="30" height="1"   rx="1" fill="rgba(14,165,233,0.08)"/>
    </svg>
  );
}

function SUVCar() {
  return (
    <svg width="250" height="90" viewBox="0 0 250 90" fill="none">
      <ellipse cx="125" cy="83" rx="112" ry="7" fill="rgba(14,165,233,0.15)"/>
      {/* Body */}
      <rect x="10" y="36" width="230" height="40" rx="7" fill="#07152a"/>
      {/* Cabin */}
      <path d="M26 36 Q42 8 94 4 L168 4 Q208 8 224 36Z" fill="#0e2840"/>
      {/* Roof rails */}
      <rect x="60"  y="3" width="130" height="2.5" rx="1.5" fill="rgba(14,165,233,0.3)"/>
      <rect x="60"  y="0" width="130" height="1.5" rx="1"   fill="rgba(14,165,233,0.15)"/>
      {/* Windshield */}
      <rect x="58" y="6" width="65" height="28" rx="4"
            fill="rgba(14,165,233,0.18)" stroke="rgba(14,165,233,0.45)" strokeWidth="0.7"/>
      {/* Rear window */}
      <rect x="132" y="6" width="65" height="28" rx="4"
            fill="rgba(14,165,233,0.18)" stroke="rgba(14,165,233,0.45)" strokeWidth="0.7"/>
      {/* Belt line */}
      <rect x="26" y="34" width="198" height="1.5" rx="1" fill="rgba(14,165,233,0.28)"/>
      {/* Sill */}
      <rect x="20" y="67" width="210" height="2.5" rx="1" fill="rgba(14,165,233,0.22)"/>
      {/* Front wheel */}
      <circle cx="56"  cy="74" r="16" fill="#040e1c" stroke="#0ea5e9" strokeWidth="2.5"/>
      <circle cx="56"  cy="74" r="9"  fill="#081a30" stroke="#0ea5e9" strokeWidth="1.2"/>
      <circle cx="56"  cy="74" r="3.5" fill="#0ea5e9"/>
      {/* Rear wheel */}
      <circle cx="194" cy="74" r="16" fill="#040e1c" stroke="#0ea5e9" strokeWidth="2.5"/>
      <circle cx="194" cy="74" r="9"  fill="#081a30" stroke="#0ea5e9" strokeWidth="1.2"/>
      <circle cx="194" cy="74" r="3.5" fill="#0ea5e9"/>
      {/* Lights */}
      <rect x="10"  y="50" width="22" height="7" rx="3.5" fill="#fde68a" opacity="0.85"/>
      <rect x="218" y="50" width="22" height="7" rx="3.5" fill="#0ea5e9" opacity="0.95"/>
      {/* Orange DRL accent */}
      <rect x="10" y="58" width="14" height="3" rx="1.5" fill="#f97316" opacity="0.5"/>
      {/* Speed streaks */}
      <rect x="0" y="50" width="50" height="2"   rx="1" fill="rgba(14,165,233,0.13)"/>
      <rect x="0" y="56" width="36" height="1.5" rx="1" fill="rgba(14,165,233,0.08)"/>
    </svg>
  );
}

/* ── Main component ────────────────────────────────────────── */
export default function RunwaySection() {
  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(180deg, #020c18 0%, #010810 100%)',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 32,
    }}>

      {/* Section label */}
      <div style={{
        textAlign: 'center',
        marginBottom: 14,
        fontFamily: 'monospace',
        fontSize: 9,
        color: 'rgba(14,165,233,0.38)',
        letterSpacing: 5,
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}>
        <span style={{ width: 48, height: 1, background: 'rgba(14,165,233,0.2)', display: 'inline-block' }}/>
        Premium Fleet · Always Moving
        <span style={{ width: 48, height: 1, background: 'rgba(14,165,233,0.2)', display: 'inline-block' }}/>
      </div>

      {/* Road container */}
      <div style={{
        position: 'relative',
        height: 108,
        background: 'rgba(3,10,20,0.96)',
        borderTop:    '1.5px solid rgba(14,165,233,0.22)',
        borderBottom: '1px   solid rgba(14,165,233,0.10)',
        overflow: 'hidden',
      }}>

        {/* Top glow pulse */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '1.5px',
          background: 'linear-gradient(90deg, transparent 0%, #0ea5e9 50%, transparent 100%)',
          animation: 'rwGlow 3.2s ease-in-out infinite',
        }}/>

        {/* Road dashes (animate left → simulate motion) */}
        {[3, 18, 35, 52, 68, 84].map((pct, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: '50%',
            left: `${pct}%`,
            width: 68,
            height: 3,
            borderRadius: 2,
            background: 'rgba(14,165,233,0.22)',
            transform: 'translateY(-50%)',
            animation: 'rwDash 1.5s linear infinite',
            animationDelay: `${-i * 0.25}s`,
          }}/>
        ))}

        {/* Edge fade masks (pure CSS, no image) */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, #010810 0%, transparent 8%, transparent 92%, #010810 100%)',
          zIndex: 10,
        }}/>

        {/* Cars */}
        {CARS.map(({ dur, delay, bot, Car }, i) => (
          <div key={i} style={{
            position: 'absolute',
            bottom: bot,
            left: -300,
            animation: `rwDrive ${dur} ${delay} linear infinite`,
            zIndex: 5,
            filter: 'drop-shadow(0 4px 12px rgba(14,165,233,0.35))',
          }}>
            <Car />
          </div>
        ))}
      </div>

      {/* Bottom fade to next section */}
      <div style={{
        height: 40,
        background: 'linear-gradient(to bottom, #010810, #020c18)',
      }}/>

      {/* CSS keyframes */}
      <style>{`
        @keyframes rwDrive {
          from { left: -300px; }
          to   { left: 110%;   }
        }
        @keyframes rwDash {
          from { transform: translateX(0)      translateY(-50%); }
          to   { transform: translateX(-140px) translateY(-50%); }
        }
        @keyframes rwGlow {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 1.0;  }
        }
      `}</style>
    </div>
  );
}