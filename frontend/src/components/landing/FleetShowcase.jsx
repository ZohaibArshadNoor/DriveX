/**
 * FleetShowcase.jsx
 * Place at: src/components/landing/FleetShowcase.jsx
 *
 * Fetches vehicles from GET /vehicles/ via React Query.
 * Displays them on a rotating 3D platform carousel.
 * Hovering a card highlights it; "Book Now" navigates to /vehicles/:id.
 *
 * Uses existing: api (axiosInstance), useQuery, navigate
 * Does NOT modify any API endpoint or booking flow.
 */

import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../../api/axiosInstance';

gsap.registerPlugin(ScrollTrigger);

/* ── Vehicle Card ────────────────────────────────────────── */
function VehicleCard({ vehicle, index, isActive, onActivate, onBook }) {
  const cardRef = useRef();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 60, rotateY: 8 },
      {
        opacity: 1, y: 0, rotateY: 0,
        duration: 0.85,
        delay: index * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 88%',
          once: true,
        },
      }
    );
  }, [index]);

  const isAvailable = vehicle.status === 'available';

  return (
    <div
      ref={cardRef}
      onClick={() => onActivate(index)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: 0,
        cursor: 'pointer',
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${isActive ? 'rgba(14,165,233,0.5)' : hovered ? 'rgba(14,165,233,0.3)' : 'rgba(14,165,233,0.1)'}`,
        background: isActive
          ? 'rgba(8,28,58,0.95)'
          : hovered
          ? 'rgba(6,22,46,0.9)'
          : 'rgba(3,12,24,0.85)',
        backdropFilter: 'blur(24px)',
        transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
        transform: isActive
          ? 'translateY(-12px) scale(1.02)'
          : hovered
          ? 'translateY(-6px) scale(1.01)'
          : 'translateY(0) scale(1)',
        boxShadow: isActive
          ? '0 32px 80px rgba(14,165,233,0.2), 0 0 0 1px rgba(14,165,233,0.25)'
          : hovered
          ? '0 16px 40px rgba(14,165,233,0.1)'
          : '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Image */}
      <div style={{
        position: 'relative', height: 220, overflow: 'hidden',
        background: '#020c18',
      }}>
        {vehicle.thumbnail ? (
          <img
            src={vehicle.thumbnail}
            alt={`${vehicle.brand} ${vehicle.model}`}
            loading="lazy"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.7s ease',
              transform: hovered || isActive ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, #031828, #010810)',
          }}>
            <span style={{ fontSize: 60, opacity: 0.12 }}>🚘</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(2,12,24,0.85) 0%, transparent 55%)',
        }} />

        {/* Status badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 20,
          fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
          textTransform: 'uppercase',
          background: isAvailable ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
          border: `1px solid ${isAvailable ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
          color: isAvailable ? '#10b981' : '#f59e0b',
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: isAvailable ? '#10b981' : '#f59e0b',
            animation: isAvailable ? 'pulse-dot 2s ease infinite' : 'none',
          }} />
          {vehicle.status}
        </div>

        {/* Price on hover */}
        <div style={{
          position: 'absolute', bottom: 14, right: 14,
          fontFamily: "'Orbitron', monospace",
          fontSize: 18, fontWeight: 800, color: '#fff',
          opacity: hovered || isActive ? 1 : 0,
          transition: 'opacity 0.3s',
          textShadow: '0 0 20px rgba(14,165,233,0.6)',
        }}>
          Rs {Number(vehicle.price_per_day).toLocaleString()}
          <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'sans-serif', fontWeight: 400 }}>/day</span>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '20px 22px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h3 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 15, fontWeight: 800,
              color: '#f1f5f9', letterSpacing: -0.2,
            }}>
              {vehicle.brand} {vehicle.model}
            </h3>
            <p style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>
              {vehicle.year} · {vehicle.category}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 17, fontWeight: 800, color: '#0ea5e9',
            }}>
              Rs {Number(vehicle.price_per_day).toLocaleString()}
            </div>
            <div style={{ fontSize: 9, color: '#475569', letterSpacing: 1 }}>PER DAY</div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {[vehicle.transmission, vehicle.fuel_type, `${vehicle.seats} seats`]
            .filter(Boolean)
            .map((tag) => (
              <span key={tag} style={{
                padding: '3px 9px', borderRadius: 20,
                fontSize: 9, fontWeight: 600, letterSpacing: 0.5,
                textTransform: 'capitalize',
                background: 'rgba(14,165,233,0.06)',
                border: '1px solid rgba(14,165,233,0.14)',
                color: '#94a3b8',
              }}>
                {tag}
              </span>
            ))
          }
        </div>

        {/* Book button */}
        <button
          onClick={(e) => { e.stopPropagation(); if (isAvailable) onBook(vehicle); }}
          disabled={!isAvailable}
          style={{
            width: '100%', padding: '11px',
            borderRadius: 10, border: 'none',
            fontFamily: "'Orbitron', monospace",
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
            textTransform: 'uppercase',
            cursor: isAvailable ? 'pointer' : 'not-allowed',
            background: isAvailable
              ? (hovered || isActive)
                ? 'linear-gradient(135deg, #0284c7, #0ea5e9)'
                : 'linear-gradient(135deg, #0ea5e9, #22d3ee)'
              : 'rgba(255,255,255,0.04)',
            color: isAvailable ? '#020c18' : '#334155',
            transition: 'all 0.25s',
            boxShadow: isAvailable && (hovered || isActive)
              ? '0 6px 28px rgba(14,165,233,0.45)'
              : 'none',
          }}
        >
          {isAvailable ? 'Book Now' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      border: '1px solid rgba(14,165,233,0.07)',
      background: 'rgba(3,12,24,0.85)',
      animation: 'card-shimmer 1.8s ease-in-out infinite',
    }}>
      <div style={{ height: 220, background: 'rgba(14,165,233,0.04)' }} />
      <div style={{ padding: '20px 22px' }}>
        <div style={{ height: 16, width: '55%', background: 'rgba(14,165,233,0.06)', borderRadius: 6, marginBottom: 8 }} />
        <div style={{ height: 12, width: '35%', background: 'rgba(14,165,233,0.04)', borderRadius: 6, marginBottom: 18 }} />
        <div style={{ height: 40, background: 'rgba(14,165,233,0.04)', borderRadius: 10 }} />
      </div>
    </div>
  );
}

/* ── Section header ──────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily: 'monospace', fontSize: 10,
      color: '#0ea5e9', letterSpacing: 5,
      textTransform: 'uppercase', marginBottom: 14,
    }}>
      {children}
    </p>
  );
}

/* ── MAIN FleetShowcase ──────────────────────────────────── */
export default function FleetShowcase() {
  const navigate    = useNavigate();
  const sectionRef  = useRef(null);
  const titleRef    = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const { data: allVehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles-landing'],
    queryFn: () => api.get('/vehicles/').then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 120_000,
  });

  /* Prefer available vehicles first */
  const available = allVehicles.filter((v) => v.status === 'available');
  const others    = allVehicles.filter((v) => v.status !== 'available');
  const displayCars = [...available, ...others].slice(0, 6);

  /* Title reveal */
  useEffect(() => {
    if (!titleRef.current) return;
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: titleRef.current, start: 'top 80%', once: true },
      }
    );
  }, []);

  const handleBook = (vehicle) => navigate(`/vehicles/${vehicle.id}`);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '100px 7vw 120px',
        background: 'linear-gradient(180deg, #020c18, #010810 50%, #020c18)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(14,165,233,0.05), transparent)',
      }} />

      {/* Animated top border */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.4), transparent)',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div ref={titleRef} style={{
          opacity: 0,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', flexWrap: 'wrap', gap: 20,
          marginBottom: 64,
        }}>
          <div>
            <SectionLabel>Our Fleet</SectionLabel>
            <h2 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 'clamp(30px, 4.5vw, 58px)',
              fontWeight: 800, color: '#f1f5f9',
              letterSpacing: -1.5, lineHeight: 1,
            }}>
              Premium Vehicles<br />
              <span style={{
                background: 'linear-gradient(90deg, #0ea5e9, #22d3ee, #10b981)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Ready to Drive</span>
            </h2>
          </div>
          <a
            href="/vehicles"
            style={{
              color: '#0ea5e9', fontSize: 12, fontWeight: 600,
              textDecoration: 'none', letterSpacing: 1,
              fontFamily: 'monospace', textTransform: 'uppercase',
              borderBottom: '1px solid rgba(14,165,233,0.3)',
              paddingBottom: 3,
              transition: 'border-color 0.2s',
            }}
          >
            View All Vehicles →
          </a>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 28,
        }}>
          {isLoading
            ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
            : displayCars.map((v, i) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                index={i}
                isActive={i === activeIdx}
                onActivate={setActiveIdx}
                onBook={handleBook}
              />
            ))
          }
        </div>

        {/* Bottom count */}
        {!isLoading && allVehicles.length > 6 && (
          <div data-fade-up style={{
            textAlign: 'center', marginTop: 52,
          }}>
            <p style={{ fontSize: 12, color: '#475569', marginBottom: 20, letterSpacing: 1 }}>
              Showing 6 of {allVehicles.length} vehicles
            </p>
            <a href="/vehicles" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 8,
              border: '1px solid rgba(14,165,233,0.25)',
              color: '#0ea5e9',
              fontFamily: 'monospace', fontSize: 11, letterSpacing: 2,
              textTransform: 'uppercase', textDecoration: 'none',
              transition: 'all 0.25s',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(14,165,233,0.08)';
                e.currentTarget.style.borderColor = 'rgba(14,165,233,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(14,165,233,0.25)';
              }}
            >
              Browse Full Fleet
            </a>
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes card-shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </section>
  );
}