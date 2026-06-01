/**
 * DriveX — LandingPage.jsx  v2
 * Place at: src/pages/public/LandingPage.jsx
 *
 * Features:
 *  - Three.js hero: animated 3D showroom with floating cars + particle nebula
 *  - Headlight eye-tracking cursor effect
 *  - GSAP ScrollTrigger reveals
 *  - Real vehicles from DB (GET /vehicles/)
 *  - Rs currency
 *  - Teal/cyan/emerald bioluminescent theme
 *  - Vanilla-tilt on vehicle cards (loaded via CDN)
 *  - Countup stats
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosInstance';

gsap.registerPlugin(ScrollTrigger);

/* ── Three.js Hero Scene ─────────────────────────────────── */
function buildHeroScene(canvas, mouseRef) {
  const W = canvas.clientWidth || window.innerWidth;
  const H = canvas.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200);
  camera.position.set(0, 2.5, 10);
  camera.lookAt(0, 0.5, 0);

  scene.fog = new THREE.FogExp2(0x020c18, 0.025);

  /* Ground — reflective */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60, 80, 80),
    new THREE.MeshStandardMaterial({ color: 0x030f1e, metalness: 0.9, roughness: 0.15 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /* Grid */
  const grid = new THREE.GridHelper(60, 60, 0x0a2a4a, 0x061422);
  grid.position.y = 0.02;
  scene.add(grid);

  /* ── Materials ─────────────────────────────────────────── */
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x030f1e, metalness: 0.98, roughness: 0.04,
  });
  const tealMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9, metalness: 0.9, roughness: 0.1,
    emissive: 0x0ea5e9, emissiveIntensity: 0.4,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0a2040, metalness: 0.1, roughness: 0,
    transparent: true, opacity: 0.65,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x8ab4cc, metalness: 1, roughness: 0.05,
  });
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xd0f0ff, emissiveIntensity: 2,
  });
  const taillightMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 1.5,
  });

  /* ── Car Builder ─────────────────────────────────────────── */
  function buildCar(scale = 1) {
    const g = new THREE.Group();

    // Lower body
    const lb = new THREE.Mesh(new THREE.BoxGeometry(4 * scale, 0.6 * scale, 1.8 * scale), bodyMat);
    lb.position.y = 0.5 * scale;
    lb.castShadow = true;
    g.add(lb);

    // Upper cabin
    const ub = new THREE.Mesh(new THREE.BoxGeometry(2.3 * scale, 0.55 * scale, 1.65 * scale), bodyMat);
    ub.position.set(-0.15 * scale, 1.05 * scale, 0);
    ub.castShadow = true;
    g.add(ub);

    // Windshield
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.4 * scale, 0.58 * scale), glassMat);
    ws.position.set(0.85 * scale, 1.08 * scale, 0);
    ws.rotation.y = Math.PI / 2 - 0.38;
    g.add(ws);

    // Rear window
    const rw = new THREE.Mesh(new THREE.PlaneGeometry(1.1 * scale, 0.5 * scale), glassMat);
    rw.position.set(-1.15 * scale, 1.08 * scale, 0);
    rw.rotation.y = -(Math.PI / 2 - 0.42);
    g.add(rw);

    // Teal accent stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(4 * scale, 0.04 * scale, 1.82 * scale), tealMat);
    stripe.position.set(0, 0.82 * scale, 0);
    g.add(stripe);

    // Side skirts
    [-0.92, 0.92].forEach(z => {
      const sk = new THREE.Mesh(new THREE.BoxGeometry(4 * scale, 0.1 * scale, 0.08 * scale), tealMat);
      sk.position.set(0, 0.22 * scale, z * scale);
      g.add(sk);
    });

    // Wheels
    const wheels = [];
    [[1.4, 0, 1], [1.4, 0, -1], [-1.4, 0, 1], [-1.4, 0, -1]].forEach(([x, y, z]) => {
      const wg = new THREE.Group();
      const tire = new THREE.Mesh(
        new THREE.TorusGeometry(0.4 * scale, 0.13 * scale, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0x0a0a0f, roughness: 0.9 })
      );
      tire.rotation.y = Math.PI / 2;
      wg.add(tire);
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3 * scale, 0.3 * scale, 0.15 * scale, 12),
        chromeMat
      );
      rim.rotation.z = Math.PI / 2;
      for (let i = 0; i < 5; i++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04 * scale, 0.52 * scale, 0.04 * scale), chromeMat);
        spoke.rotation.z = (i / 5) * Math.PI * 2;
        rim.add(spoke);
      }
      wg.add(rim);
      wg.position.set(x * scale, y + 0.4 * scale, z * scale);
      wg.castShadow = true;
      g.add(wg);
      wheels.push(wg);
    });

    // Headlights with spotlight
    const spotlights = [];
    const hlGroups = [];
    [[1.95, 0.62, 0.55], [1.95, 0.62, -0.55]].forEach(([x, y, z], i) => {
      const hlg = new THREE.Group();
      hlg.position.set(x * scale, y * scale, z * scale);
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.07 * scale, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), headlightMat);
      lens.position.x = 0.04 * scale;
      lens.rotation.z = -Math.PI / 2;
      hlg.add(lens);
      const drl = new THREE.Mesh(
        new THREE.BoxGeometry(0.02 * scale, 0.04 * scale, 0.26 * scale),
        new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 3 })
      );
      drl.position.set(0.04 * scale, -0.06 * scale, 0);
      hlg.add(drl);
      const spot = new THREE.SpotLight(0xd0f4ff, 3, 14, Math.PI / 9, 0.4);
      spot.castShadow = true;
      hlg.add(spot);
      hlg.add(spot.target);
      spot.target.position.set(8, -1, z > 0 ? 0.6 : -0.6);
      spotlights.push(spot);
      hlGroups.push(hlg);
      g.add(hlg);
    });

    // Taillights — teal
    [0.58, -0.58].forEach(z => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.05 * scale, 0.1 * scale, 0.3 * scale), taillightMat);
      tl.position.set(-2 * scale, 0.65 * scale, z * scale);
      g.add(tl);
    });

    // Under-glow
    const ug = new THREE.PointLight(0x0ea5e9, 1.8, 5);
    ug.position.set(0, -0.05 * scale, 0);
    g.add(ug);

    return { group: g, wheels, spotlights };
  }

  const { group: carGroup, wheels, spotlights } = buildCar(1);
  scene.add(carGroup);

  /* ── Floating particles nebula ─────────────────────────── */
  const PCOUNT = 1200;
  const pPos = new Float32Array(PCOUNT * 3);
  const pCol = new Float32Array(PCOUNT * 3);
  for (let i = 0; i < PCOUNT; i++) {
    const r = 18 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    pPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3 + 2;
    pPos[i * 3 + 2] = r * Math.cos(phi);
    // Color: mix of teal and cyan
    const t = Math.random();
    pCol[i * 3 + 0] = t < 0.5 ? 0.05 : 0.13;
    pCol[i * 3 + 1] = t < 0.5 ? 0.65 : 0.83;
    pCol[i * 3 + 2] = t < 0.5 ? 0.92 : 0.93;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.7 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ── Speed streaks ─────────────────────────────────────── */
  const streaks = [];
  for (let i = 0; i < 20; i++) {
    const len = 0.4 + Math.random() * 1.2;
    const sg = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(-len, 0, 0),
    ]);
    const streak = new THREE.Line(sg,
      new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.15 + Math.random() * 0.2 })
    );
    streak.position.set(3 + Math.random() * 6, Math.random() * 2.5, (Math.random() - 0.5) * 4);
    streak.userData.speed = 0.04 + Math.random() * 0.08;
    scene.add(streak);
    streaks.push(streak);
  }

  /* ── Lights ────────────────────────────────────────────── */
  scene.add(new THREE.AmbientLight(0x0a1a2e, 2));
  const key = new THREE.DirectionalLight(0xd0eeff, 1.0);
  key.position.set(6, 10, 4); key.castShadow = true;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x0ea5e9, 1.2);
  rim.position.set(-5, 4, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x22d3ee, 0.5);
  fill.position.set(0, -2, 6);
  scene.add(fill);

  /* ── GSAP entrance ─────────────────────────────────────── */
  carGroup.position.z = -12;
  carGroup.rotation.y = Math.PI * 0.4;
  gsap.to(carGroup.position, { z: 0, duration: 2.5, ease: 'power3.out' });
  gsap.to(carGroup.rotation, { y: 0, duration: 2.5, ease: 'power3.out' });

  /* ── Animation loop ────────────────────────────────────── */
  let frame = 0;
  let animId;
  function animate() {
    animId = requestAnimationFrame(animate);
    frame++;

    wheels.forEach(w => { w.rotation.x -= 0.025; });
    carGroup.position.y = Math.sin(frame * 0.007) * 0.05;

    // Headlight eye-tracking
    const mx = mouseRef.current.x, my = mouseRef.current.y;
    spotlights.forEach((sp, i) => {
      sp.target.position.set(8 + mx * 5, -1 + my * 2, i === 0 ? 0.6 + mx * 2 : -0.6 + mx * 2);
      sp.target.updateMatrixWorld();
    });

    // Streaks
    streaks.forEach(s => {
      s.position.x -= s.userData.speed;
      if (s.position.x < -6) s.position.x = 10;
    });

    // Particles drift
    particles.rotation.y += 0.0002;
    particles.rotation.x += 0.0001;

    renderer.render(scene, camera);
  }
  animate();

  const onResize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', onResize);

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  };
}

/* ── Count-up component ─────────────────────────────────── */
function CountUp({ end, suffix = '' }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / 1800, 1);
        setV(Math.round((1 - Math.pow(1 - p, 3)) * end));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [end]);
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>;
}

/* ── Vehicle preview card ───────────────────────────────── */
function PreviewCard({ v, i, onBook }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 50, rotateX: 8 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.8, delay: i * 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } }
    );
  }, [i]);

  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(8,28,58,0.9)' : 'rgba(4,18,38,0.8)',
        border: `1px solid ${hovered ? 'rgba(14,165,233,0.4)' : 'rgba(14,165,233,0.1)'}`,
        borderRadius: 18,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? '0 24px 60px rgba(14,165,233,0.15), 0 0 0 1px rgba(14,165,233,0.1)' : 'var(--shadow-card)',
        backdropFilter: 'blur(20px)',
        cursor: 'pointer',
      }}>
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#030f1e' }}>
        {v.thumbnail ? (
          <img src={v.thumbnail} alt={`${v.brand} ${v.model}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.6s ease',
              transform: hovered ? 'scale(1.1)' : 'scale(1)' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, opacity: 0.1 }}>🚗</div>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(2,12,24,0.8) 0%, transparent 60%)',
        }} />
        <div style={{
          position: 'absolute', top: 12, left: 12,
          padding: '4px 10px', borderRadius: 20,
          background: v.status === 'available' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
          border: `1px solid ${v.status === 'available' ? 'rgba(16,185,129,0.35)' : 'rgba(245,158,11,0.35)'}`,
          fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
          color: v.status === 'available' ? '#10b981' : '#f59e0b',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: v.status === 'available' ? '#10b981' : '#f59e0b',
            animation: v.status === 'available' ? 'status-pulse 2s ease infinite' : 'none',
          }} />
          {v.status}
        </div>
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 800,
          color: 'var(--white)', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
        }}>Rs {Number(v.price_per_day).toLocaleString()}<span style={{ fontSize: 11, color: 'var(--gray-300)' }}>/day</span></div>
      </div>

      {/* Details */}
      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800,
              color: 'var(--text-primary)', letterSpacing: -0.3 }}>
              {v.brand} {v.model}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {v.year} · {v.category}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--teal)' }}>
              Rs {Number(v.price_per_day).toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>per day</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {[v.transmission, v.fuel_type, `${v.seats} seats`].map(t => (
            <span key={t} style={{
              padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600,
              background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.15)',
              color: 'var(--text-secondary)', textTransform: 'capitalize',
            }}>{t}</span>
          ))}
        </div>
        <button onClick={() => onBook(v)} disabled={v.status !== 'available'}
          style={{
            width: '100%', padding: '10px', borderRadius: 8, border: 'none',
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
            cursor: v.status === 'available' ? 'pointer' : 'not-allowed',
            background: v.status === 'available'
              ? 'linear-gradient(135deg, #0ea5e9, #22d3ee)'
              : 'rgba(255,255,255,0.04)',
            color: v.status === 'available' ? '#020c18' : 'var(--text-muted)',
            transition: 'all 0.2s',
            boxShadow: v.status === 'available' && hovered ? '0 4px 24px rgba(14,165,233,0.4)' : 'none',
          }}>
          {v.status === 'available' ? 'Book Now' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ──────────────────────────────────────── */
export default function LandingPage() {
  const canvasRef  = useRef(null);
  const mouseRef   = useRef({ x: 0, y: 0 });
  const heroRef    = useRef(null);
  const navigate   = useNavigate();

  const { data: allVehicles = [] } = useQuery({
    queryKey: ['vehicles-landing'],
    queryFn: () => api.get('/vehicles/').then(r => r.data?.data || r.data || []),
    staleTime: 120_000,
  });

  // Show up to 3 available cars on landing
  const featuredCars = allVehicles.filter(v => v.status === 'available').slice(0, 3);
  // If less than 3 available, top up with others
  const displayCars = featuredCars.length >= 3
    ? featuredCars
    : [...featuredCars, ...allVehicles.filter(v => v.status !== 'available').slice(0, 3 - featuredCars.length)];

  useEffect(() => {
    const h = (e) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    return buildHeroScene(canvasRef.current, mouseRef);
  }, []);

  // Hero text GSAP
  useEffect(() => {
    if (!heroRef.current) return;
    const els = heroRef.current.querySelectorAll('[data-reveal]');
    gsap.fromTo(els, { opacity: 0, y: 60 },
      { opacity: 1, y: 0, stagger: 0.14, duration: 1.1, ease: 'power4.out', delay: 0.6 }
    );
    // Scroll reveals
    gsap.utils.toArray('[data-scroll]').forEach(el => {
      gsap.fromTo(el, { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true } }
      );
    });
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  const handleBook = (v) => navigate(`/vehicles/${v.id}`);

  return (
    <div style={{ background: 'var(--bg-root)', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'var(--font-body)' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

        {/* Gradient vignettes */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, rgba(2,12,24,0.92) 0%, rgba(2,12,24,0.5) 40%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, pointerEvents: 'none',
          background: 'linear-gradient(to top, var(--bg-root), transparent)' }} />

        {/* Hero text */}
        <div ref={heroRef} style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          left: 0, padding: '0 7vw', maxWidth: 680, zIndex: 10,
        }}>
          <div data-reveal style={{ opacity: 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 11, fontFamily: 'var(--font-mono)',
              color: 'var(--teal)', letterSpacing: 3, fontWeight: 500,
              textTransform: 'uppercase', marginBottom: 20,
              padding: '6px 14px',
              background: 'rgba(14,165,233,0.08)',
              border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)',
                animation: 'blink-dot 2s ease infinite' }} />
              Premium Car Rental · Pakistan
            </span>
          </div>

          <div data-reveal style={{ opacity: 0 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(52px,7.5vw,90px)',
              fontWeight: 800, lineHeight: 0.95, letterSpacing: -2,
              color: 'var(--white)', marginBottom: 10,
            }}>
              Redefine<br />
              <span style={{
                background: 'linear-gradient(90deg, #0ea5e9, #22d3ee, #10b981)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 100%', animation: 'aurora 4s ease infinite',
              }}>How You</span><br />
              Drive
            </h1>
          </div>

          <div data-reveal style={{ opacity: 0, marginTop: 22, marginBottom: 36 }}>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 400 }}>
              Handpicked premium fleet. Transparent pricing in Rs.
              Book in minutes, not hours.
            </p>
          </div>

          <div data-reveal style={{ opacity: 0, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <GlowButton onClick={() => navigate('/vehicles')} primary>
              Explore Fleet →
            </GlowButton>
            <GlowButton onClick={() => navigate('/register')}>
              Register Free
            </GlowButton>
          </div>

          <div data-reveal style={{ opacity: 0, marginTop: 36,
            display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {[['50+','Vehicles'], ['2,400+','Happy Renters'], ['Rs 2,800','Avg/Day']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
                  color: 'var(--teal)', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1,
                  textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cursor hint */}
        <div style={{
          position: 'absolute', bottom: 80, right: '6vw',
          fontSize: 10, color: 'rgba(14,165,233,0.4)',
          fontFamily: 'var(--font-mono)', letterSpacing: 2,
          textTransform: 'uppercase', writingMode: 'vertical-rl',
        }}>Move cursor · headlights follow</div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          zIndex: 10,
        }}>
          <span style={{ fontSize: 9, color: 'rgba(14,165,233,0.35)', letterSpacing: 3, textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 44,
            background: 'linear-gradient(to bottom, var(--teal), transparent)',
            animation: 'float-y 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ── STATS BAND ─────────────────────────────────────────── */}
      <section data-scroll style={{ opacity: 0, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        padding: '40px 7vw', background: 'rgba(14,165,233,0.02)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {[
            { n: 50, s: '+', l: 'Fleet Vehicles' },
            { n: 2400, s: '+', l: 'Happy Renters' },
            { n: 3, s: '', l: 'Cities' },
            { n: 99, s: '%', l: 'Uptime' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,4vw,52px)',
                fontWeight: 800, color: 'var(--teal)', letterSpacing: -1 }}>
                <CountUp end={stat.n} suffix={stat.s} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1,
                textTransform: 'uppercase', marginTop: 4 }}>{stat.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED VEHICLES ──────────────────────────────────── */}
      <section style={{ padding: '96px 7vw', maxWidth: 1260, margin: '0 auto' }}>
        <div data-scroll style={{ opacity: 0, marginBottom: 52,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--teal)', letterSpacing: 4, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>Our Fleet</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,4vw,50px)',
              fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -1, lineHeight: 1 }}>
              Vehicles Ready<br />
              <span style={{ background: 'linear-gradient(90deg,#0ea5e9,#22d3ee)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>to Drive</span>
            </h2>
          </div>
          <Link to='/vehicles' style={{
            color: 'var(--teal)', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            borderBottom: '1px solid rgba(14,165,233,0.3)', paddingBottom: 2,
          }}>View all vehicles →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
          {displayCars.length > 0
            ? displayCars.map((v, i) => <PreviewCard key={v.id} v={v} i={i} onBook={handleBook} />)
            : [0,1,2].map(i => <SkeletonCard key={i} />)
          }
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ padding: '80px 7vw',
        background: 'linear-gradient(180deg, transparent, rgba(14,165,233,0.03), transparent)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div data-scroll style={{ opacity: 0, textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 11, color: 'var(--teal)', letterSpacing: 4, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>Process</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,46px)',
              fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.8 }}>
              Simple. Fast. Reliable.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 0 }}>
            {[
              { n: '01', title: 'Browse Fleet', desc: 'Explore vehicles freely. No account needed to browse.', icon: '🔍' },
              { n: '02', title: 'Register & Verify', desc: 'Create account and upload your driver\'s license.', icon: '🪪' },
              { n: '03', title: 'Book Your Dates', desc: 'Select start & end dates. Real-time conflict check.', icon: '📅' },
              { n: '04', title: 'Drive Away', desc: 'Admin approves, pay 30% advance, collect keys.', icon: '🚗' },
            ].map((step, i) => (
              <div key={i} data-scroll style={{ opacity: 0 }}>
                <div style={{
                  padding: '32px 24px',
                  borderTop: `2px solid ${i === 0 ? 'var(--teal)' : 'var(--border)'}`,
                  transition: 'border-color 0.3s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderTopColor = 'var(--teal)'}
                  onMouseLeave={e => e.currentTarget.style.borderTopColor = i === 0 ? 'var(--teal)' : 'var(--border)'}
                >
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{step.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800,
                    color: 'var(--teal)', opacity: 0.15, lineHeight: 1, marginBottom: 12 }}>{step.n}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
                    color: 'var(--text-primary)', marginBottom: 8 }}>{step.title}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: '72px 7vw' }}>
        <div data-scroll style={{ opacity: 0, maxWidth: 1100, margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(34,211,238,0.04))',
          border: '1px solid rgba(14,165,233,0.2)', borderRadius: 24, padding: '56px 52px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 28 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--teal)', letterSpacing: 3, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>Ready?</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3.5vw,44px)',
              fontWeight: 800, color: 'var(--text-primary)', letterSpacing: -0.8, lineHeight: 1.1 }}>
              Your next drive<br />starts today.
            </h2>
          </div>
          <GlowButton onClick={() => navigate('/register')} primary large>
            Create Free Account →
          </GlowButton>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 7vw',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
          Drive<span style={{ color: 'var(--teal)' }}>X</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          © 2026 DriveX · Bahria University KHI · BSE-6C
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[['Fleet', '/vehicles'], ['Login', '/login'], ['Register', '/register']].map(([l, to]) => (
            <Link key={l} to={to} style={{ fontSize: 12, color: 'var(--text-secondary)',
              textDecoration: 'none', letterSpacing: 0.5 }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}

/* ── Reusable Glow Button ────────────────────────────────── */
export function GlowButton({ children, onClick, primary = false, large = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: large ? '14px 36px' : '11px 26px',
        fontSize: large ? 15 : 13,
        fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 0.4,
        border: `1px solid ${primary ? 'transparent' : 'rgba(14,165,233,0.25)'}`,
        background: primary
          ? hov ? 'linear-gradient(135deg,#0284c7,#0ea5e9)' : 'linear-gradient(135deg,#0ea5e9,#22d3ee)'
          : hov ? 'rgba(14,165,233,0.1)' : 'transparent',
        color: primary ? '#020c18' : 'var(--text-primary)',
        borderRadius: 8, cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: primary && hov ? '0 0 40px rgba(14,165,233,0.5)' : 'none',
        transform: hov ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >{children}</button>
  );
}

/* ── Skeleton card ───────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(4,18,38,0.8)', border: '1px solid var(--border)',
      borderRadius: 18, overflow: 'hidden', animation: 'shimmer 1.5s ease infinite' }}>
      <div style={{ height: 200, background: 'rgba(14,165,233,0.04)' }} />
      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ height: 18, background: 'rgba(14,165,233,0.06)', borderRadius: 6, marginBottom: 8, width: '60%' }} />
        <div style={{ height: 13, background: 'rgba(14,165,233,0.04)', borderRadius: 6, marginBottom: 14, width: '40%' }} />
        <div style={{ height: 38, background: 'rgba(14,165,233,0.04)', borderRadius: 8 }} />
      </div>
    </div>
  );
}