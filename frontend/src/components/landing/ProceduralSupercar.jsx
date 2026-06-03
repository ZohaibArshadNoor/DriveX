/**
 * ProceduralSupercar.jsx
 * Place at: src/components/landing/ProceduralSupercar.jsx
 *
 * A realistic-looking procedural supercar — no GLB file required.
 * Modelled after McLaren 720S proportions (4.54 × 2.16 × 1.20 m).
 *
 * Key technique: THREE.Shape side-profile with bezier curves + wheel-arch
 * holes → ExtrudeGeometry.  This is what the industry uses for procedural
 * car bodies and is the single biggest visual upgrade over BoxGeometry.
 *
 * Props
 *   explodeProgress {0–1}  drives the exploded-view animation
 *   mouseRef        {ref}  headlight cursor tracking (HeroScene only)
 *
 * Deps: @react-three/fiber, three
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Palette ──────────────────────────────────────────────── */
const TEAL   = new THREE.Color('#0ea5e9');
const BODY   = new THREE.Color('#060d1a');
const CHROME = new THREE.Color('#a8bece');
const BLACK  = new THREE.Color('#060606');
const WHITE  = new THREE.Color('#ffffff');

/* ══════════════════════════════════════════════════════════
   SHAPE BUILDERS  (run once at module level for speed)
   Each function returns a fresh THREE.Shape consumed by
   ExtrudeGeometry — shapes are not reusable after extrusion.
   ══════════════════════════════════════════════════════════ */

/** Full car side profile.  Wheel arches are punched as holes. */
function makeBodyShape() {
  const s = new THREE.Shape();

  /* ── outer profile (clockwise, XY plane) ────────────────
     X = car length (+X = front), Y = height              */
  s.moveTo(2.30, 0.07);                           // front splitter tip

  /* front nose — rises sharply like a McLaren */
  s.bezierCurveTo(2.44, 0.07,  2.52, 0.21,  2.44, 0.42);

  /* front fascia → hood leading edge */
  s.bezierCurveTo(2.36, 0.59,  2.08, 0.65,  1.76, 0.67);

  /* long sweeping hood */
  s.bezierCurveTo(1.35, 0.69,  0.92, 0.70,  0.66, 0.70);

  /* A-pillar base */
  s.bezierCurveTo(0.48, 0.70,  0.34, 0.73,  0.24, 0.80);

  /* steep windshield rake — McLaren signature */
  s.bezierCurveTo(0.08, 0.93, -0.10, 1.13, -0.18, 1.20);

  /* roof — nearly flat */
  s.bezierCurveTo(-0.40, 1.26, -0.76, 1.27, -1.06, 1.20);

  /* C-pillar / flying buttress */
  s.bezierCurveTo(-1.34, 1.12, -1.58, 0.96, -1.76, 0.83);

  /* rear deck */
  s.bezierCurveTo(-1.94, 0.72, -2.12, 0.66, -2.28, 0.62);

  /* Kamm-tail drop */
  s.bezierCurveTo(-2.45, 0.55, -2.50, 0.40, -2.44, 0.22);

  /* rear bumper base */
  s.lineTo(-2.40, 0.07);

  /* diffuser → flat underbody → front splitter */
  s.lineTo(-2.12, 0.04);
  s.lineTo( 2.10, 0.04);
  s.lineTo( 2.23, 0.06);
  s.lineTo( 2.30, 0.07);                          // close

  /* ── wheel arch holes ─────────────────────────────────── */
  const fa = new THREE.Path();
  fa.absarc(1.44, 0.42, 0.39, 0, Math.PI * 2, true);
  s.holes.push(fa);

  const ra = new THREE.Path();
  ra.absarc(-1.28, 0.42, 0.40, 0, Math.PI * 2, true);
  s.holes.push(ra);

  return s;
}

/** Greenhouse / cabin glass overlay — narrower extrusion */
function makeCabinShape() {
  const s = new THREE.Shape();
  s.moveTo(0.22, 0.80);
  s.bezierCurveTo(0.06, 0.93, -0.10, 1.13, -0.18, 1.20);
  s.bezierCurveTo(-0.40, 1.26, -0.76, 1.27, -1.06, 1.20);
  s.bezierCurveTo(-1.34, 1.12, -1.58, 0.96, -1.76, 0.83);
  s.lineTo(-1.76, 0.75);
  s.lineTo( 0.22, 0.75);
  s.lineTo( 0.22, 0.80);
  return s;
}

/** Hood section — separate piece for exploded view */
function makeHoodShape() {
  const s = new THREE.Shape();
  s.moveTo(2.30, 0.07);
  s.bezierCurveTo(2.44, 0.07,  2.52, 0.21,  2.44, 0.42);
  s.bezierCurveTo(2.36, 0.59,  2.08, 0.65,  1.76, 0.67);
  s.bezierCurveTo(1.35, 0.69,  0.92, 0.70,  0.66, 0.70);
  s.lineTo( 0.66, 0.60);
  s.lineTo( 1.76, 0.60);
  s.bezierCurveTo(2.06, 0.57,  2.32, 0.44,  2.40, 0.26);
  s.lineTo( 2.38, 0.08);
  s.lineTo( 2.30, 0.07);
  return s;
}

/** Rear engine lid — separate piece for exploded view */
function makeRearShape() {
  const s = new THREE.Shape();
  s.moveTo(-2.40, 0.07);
  s.bezierCurveTo(-2.50, 0.40, -2.45, 0.55, -2.28, 0.62);
  s.bezierCurveTo(-2.12, 0.66, -1.94, 0.72, -1.76, 0.83);
  s.lineTo(-1.76, 0.74);
  s.lineTo(-1.96, 0.64);
  s.bezierCurveTo(-2.14, 0.58, -2.38, 0.45, -2.38, 0.15);
  s.lineTo(-2.40, 0.07);
  return s;
}

/* ── Module-level shared wheel sub-geometries ─────────────
   Shared across all 4 wheel instances — only allocated once. */
const TIRE_R  = 0.42;
const TIRE_W  = 0.22;
const RIM_R   = 0.30;
const N_SPOKE = 5;
const SMID    = (0.08 + RIM_R - 0.02) / 2;   // spoke midpoint radius
const SLEN    = RIM_R - 0.10;                  // spoke length

const _tireGeo   = new THREE.CylinderGeometry(TIRE_R, TIRE_R, TIRE_W, 32, 1, false);
const _innerGeo  = new THREE.CylinderGeometry(TIRE_R - 0.025, TIRE_R - 0.025, TIRE_W * 0.84, 28, 1, false);
const _barrelGeo = new THREE.CylinderGeometry(RIM_R + 0.012, RIM_R + 0.012, TIRE_W - 0.04, 24, 1, false);
const _backGeo   = new THREE.CylinderGeometry(RIM_R, RIM_R, 0.007, 24);
const _spokeGeo  = new THREE.BoxGeometry(0.038, SLEN, 0.050);
const _ringGeo   = new THREE.TorusGeometry(RIM_R - 0.022, 0.014, 8, 24);
const _hubGeo    = new THREE.CylinderGeometry(0.050, 0.050, 0.022, 12);
const _rotorGeo  = new THREE.CylinderGeometry(0.22, 0.22, 0.016, 20);
const _calGeo    = new THREE.BoxGeometry(0.088, 0.082, 0.195);

// 90° rotation shared by all cylinder/torus wheel parts
const WHEEL_ROT = new THREE.Euler(Math.PI / 2, 0, 0);

/* ── Wheel sub-component ──────────────────────────────────── */
function WheelMeshes({ isFront, matChrome, matTeal, matBrake }) {
  return (
    <>
      {/* Outer tyre */}
      <mesh rotation={WHEEL_ROT} castShadow geometry={_tireGeo}>
        <meshStandardMaterial color={BLACK} roughness={0.92} metalness={0} />
      </mesh>

      {/* Inner tyre wall (slightly smaller) */}
      <mesh rotation={WHEEL_ROT} geometry={_innerGeo}>
        <meshStandardMaterial color="#101010" roughness={0.95} metalness={0} />
      </mesh>

      {/* Rim barrel */}
      <mesh rotation={WHEEL_ROT} geometry={_barrelGeo} material={matChrome} />

      {/* Rim back-face disc */}
      <mesh rotation={WHEEL_ROT} geometry={_backGeo}>
        <meshStandardMaterial color="#0c1018" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* 5 Y-spokes radiating in local XY plane */}
      {Array.from({ length: N_SPOKE }, (_, i) => {
        const θ = (i / N_SPOKE) * Math.PI * 2;
        return (
          <mesh
            key={i}
            geometry={_spokeGeo}
            material={matChrome}
            position={[Math.sin(θ) * SMID, Math.cos(θ) * SMID, 0]}
            rotation={[0, 0, -θ]}
          />
        );
      })}

      {/* Outer rim ring */}
      <mesh rotation={WHEEL_ROT} geometry={_ringGeo} material={matChrome} />

      {/* Centre cap with teal glow */}
      <mesh rotation={WHEEL_ROT} geometry={_hubGeo} material={matTeal} />

      {/* Brake rotor */}
      <mesh rotation={WHEEL_ROT} geometry={_rotorGeo}>
        <meshStandardMaterial color="#585858" metalness={0.8} roughness={0.45} />
      </mesh>

      {/* Brake caliper */}
      <mesh position={[0, -0.21, 0]} geometry={_calGeo} material={matBrake} />

      {/* Under-wheel glow */}
      <pointLight color={TEAL} intensity={0.50} distance={1.0} position={[0, -0.44, 0]} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function ProceduralSupercar({ explodeProgress = 0, mouseRef }) {
  const groupRef     = useRef();
  const wheelRefs    = useRef([null, null, null, null]);
  const spotRefs     = useRef([null, null]);

  /* ── Geometries — built once ──────────────────────────── */
  const geos = useMemo(() => {
    const ext = (shape, depth) => {
      const g = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: false,
        curveSegments: 32,
        steps: 1,
      });
      g.translate(0, 0, -depth / 2); // centre along Z (width)
      return g;
    };
    return {
      body:  ext(makeBodyShape(),  1.84),
      cabin: ext(makeCabinShape(), 1.30),
      hood:  ext(makeHoodShape(),  1.82),
      rear:  ext(makeRearShape(),  1.82),
    };
  }, []);

  /* ── Materials — created once ─────────────────────────── */
  const mat = useMemo(() => ({
    body: new THREE.MeshPhysicalMaterial({
      color: BODY,
      metalness: 0.88,
      roughness: 0.10,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.95,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#04090f'),
      metalness: 0,
      roughness: 0,
      transmission: 0.65,
      transparent: true,
      ior: 1.52,
      thickness: 0.3,
      opacity: 0.82,
      side: THREE.DoubleSide,
    }),
    teal: new THREE.MeshStandardMaterial({
      color: TEAL, emissive: TEAL, emissiveIntensity: 2.2,
      metalness: 0.7, roughness: 0.1,
    }),
    tealDim: new THREE.MeshStandardMaterial({
      color: TEAL, emissive: TEAL, emissiveIntensity: 0.55,
      metalness: 0.85, roughness: 0.2,
    }),
    hl: new THREE.MeshStandardMaterial({
      color: WHITE, emissive: new THREE.Color('#b8dfff'), emissiveIntensity: 4.0,
    }),
    tl: new THREE.MeshStandardMaterial({
      color: TEAL, emissive: TEAL, emissiveIntensity: 3.2,
    }),
    chrome: new THREE.MeshStandardMaterial({
      color: CHROME, metalness: 0.98, roughness: 0.03,
    }),
    brake: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#cc3300'), roughness: 0.22, metalness: 0.74,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#020608'), roughness: 0.9, metalness: 0.1,
    }),
  }), []);

  /* ── Animation ────────────────────────────────────────── */
  useFrame(() => {
    /* Roll wheels (around Z = tyre axis) */
    wheelRefs.current.forEach(w => { if (w) w.rotation.z -= 0.022; });

    /* Track headlights to mouse cursor */
    if (!mouseRef?.current) return;
    const { x: mx, y: my } = mouseRef.current;
    spotRefs.current.forEach((sp, i) => {
      if (!sp) return;
      sp.target.position.set(
        8 + mx * 5,
        -1 + my * 2,
        i === 0 ? 0.68 + mx * 1.8 : -0.68 + mx * 1.8,
      );
      sp.target.updateMatrixWorld();
    });
  });

  /* ── Explode lerp helper ──────────────────────────────── */
  const ep = explodeProgress;
  const L  = (a, b) => THREE.MathUtils.lerp(a, b, ep);

  /* Wheel base / exploded positions */
  const WHEELS = [
    { b: [ 1.44, 0.42, -0.95], e: [ 2.20, 0.42, -2.25], front: true  }, // FL
    { b: [ 1.44, 0.42,  0.95], e: [ 2.20, 0.42,  2.25], front: true  }, // FR
    { b: [-1.28, 0.42, -0.95], e: [-2.10, 0.42, -2.25], front: false }, // RL
    { b: [-1.28, 0.42,  0.95], e: [-2.10, 0.42,  2.25], front: false }, // RR
  ];

  /* ── Reusable small geometries ────────────────────────── */
  const sillGeo    = useMemo(() => new THREE.BoxGeometry(4.60, 0.040, 0.052), []);
  const hoodVentG  = useMemo(() => new THREE.BoxGeometry(1.70, 0.016, 0.20),  []);
  const splitterG  = useMemo(() => new THREE.BoxGeometry(0.20, 0.028, 1.76),  []);
  const splFinG    = useMemo(() => new THREE.BoxGeometry(0.12, 0.055, 0.020), []);
  const diffFinG   = useMemo(() => new THREE.BoxGeometry(0.25, 0.21, 0.030),  []);
  const wingMainG  = useMemo(() => new THREE.BoxGeometry(0.46, 0.040, 1.60),  []);
  const wingFlap   = useMemo(() => new THREE.BoxGeometry(0.018, 0.055, 1.58), []);
  const wingEndG   = useMemo(() => new THREE.BoxGeometry(0.44, 0.21, 0.026),  []);
  const wingPilG   = useMemo(() => new THREE.BoxGeometry(0.036, 0.34, 0.036), []);
  const intakeG    = useMemo(() => new THREE.BoxGeometry(0.045, 0.17, 0.26),  []);
  const mirrorBodyG = useMemo(() => new THREE.BoxGeometry(0.11, 0.055, 0.20), []);
  const mirrorFaceG = useMemo(() => new THREE.BoxGeometry(0.022, 0.050, 0.18),[]);
  const hlBoxG     = useMemo(() => new THREE.BoxGeometry(0.042, 0.082, 0.26), []);
  const drlG       = useMemo(() => new THREE.BoxGeometry(0.052, 0.020, 0.30), []);
  const lensGeo    = useMemo(() => {
    const g = new THREE.SphereGeometry(0.032, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    return g;
  }, []);
  const tlBoxG     = useMemo(() => new THREE.BoxGeometry(0.036, 0.072, 0.33), []);
  const tlStripG   = useMemo(() => new THREE.BoxGeometry(0.026, 0.011, 0.35), []);
  const tlBarG     = useMemo(() => new THREE.BoxGeometry(0.023, 0.011, 0.80), []);

  return (
    <group ref={groupRef}>

      {/* ════ BODY PANELS ════════════════════════════════ */}

      {/* Main body — stays mostly put during explode */}
      <mesh
        geometry={geos.body}
        material={mat.body}
        position={[0, L(0, -0.12), 0]}
        castShadow receiveShadow
      />

      {/* Hood — flies forward + up */}
      <mesh
        geometry={geos.hood}
        material={mat.body}
        position={[L(0, 2.10), L(0, 1.40), 0]}
        castShadow
      />

      {/* Cabin glass overlay */}
      <mesh
        geometry={geos.cabin}
        material={mat.glass}
        position={[0, L(0, 2.60), 0]}
      />

      {/* Rear engine lid — flies back + up */}
      <mesh
        geometry={geos.rear}
        material={mat.body}
        position={[L(0, -2.10), L(0, 1.20), 0]}
        castShadow
      />

      {/* ════ DETAILS ════════════════════════════════════ */}

      {/* Side sill LED strips */}
      {[-0.93, 0.93].map((z, i) => (
        <mesh key={`sill${i}`} geometry={sillGeo} material={mat.teal}
              position={[0, 0.19, z]} />
      ))}

      {/* Hood centre vent / crease strip */}
      <mesh geometry={hoodVentG} material={mat.teal}
            position={[1.28, 0.706, 0]} />

      {/* Front splitter */}
      <mesh geometry={splitterG} material={mat.dark}
            position={[2.16, 0.054, 0]} />
      {[-0.38, -0.12, 0.12, 0.38].map((z, i) => (
        <mesh key={`sfin${i}`} geometry={splFinG} material={mat.dark}
              position={[2.08, 0.055, z]} />
      ))}

      {/* Rear diffuser fins */}
      {[-0.54, -0.18, 0.18, 0.54].map((z, i) => (
        <mesh key={`dfin${i}`} geometry={diffFinG} material={mat.dark}
              position={[-2.24, 0.11, z]} />
      ))}

      {/* Rear wing */}
      <mesh geometry={wingMainG} material={mat.body}
            position={[-2.06, 1.07, 0]} />
      <mesh geometry={wingFlap} material={mat.teal}
            position={[-2.28, 1.05, 0]} />
      {[-0.81, 0.81].map((z, i) => (
        <mesh key={`wep${i}`} geometry={wingEndG} material={mat.dark}
              position={[-2.06, 0.96, z]} />
      ))}
      {[-0.69, 0.69].map((z, i) => (
        <mesh key={`wpi${i}`} geometry={wingPilG} material={mat.chrome}
              position={[-1.90, 0.88, z]} />
      ))}

      {/* Front air intakes (flanks) */}
      {[-0.72, 0.72].map((z, i) => (
        <mesh key={`in${i}`} geometry={intakeG} material={mat.dark}
              position={[2.32, 0.25, z]} />
      ))}

      {/* Side mirrors */}
      {[-0.93, 0.93].map((z, i) => (
        <group key={`mir${i}`} position={[0.58, 0.91, z]}>
          <mesh geometry={mirrorBodyG} material={mat.body} />
          <mesh geometry={mirrorFaceG} material={mat.dark}
                position={[0.055, 0, 0]} />
        </group>
      ))}

      {/* ════ LIGHTING ═══════════════════════════════════ */}

      {/* Headlights */}
      {[[-0.66, 1], [0.66, -1]].map(([z, side], i) => (
        <group key={`hl${i}`} position={[2.38, 0.60, z]}>
          {/* LED unit */}
          <mesh geometry={hlBoxG} material={mat.hl} />
          {/* Inner housing (dark behind lens) */}
          <mesh material={mat.dark} position={[-0.018, 0.004, 0]}>
            <boxGeometry args={[0.038, 0.068, 0.28]} />
          </mesh>
          {/* DRL strip */}
          <mesh geometry={drlG} material={mat.teal}
                position={[0.005, -0.056, 0]} />
          {/* Projector lens dome */}
          <mesh geometry={lensGeo} material={mat.hl}
                position={[0.025, 0.010, 0]}
                rotation={[0, 0, Math.PI / 2]} />
          {/* Spot */}
          <spotLight
            ref={el => (spotRefs.current[i] = el)}
            color="#c0e8ff"
            intensity={3.8}
            distance={18}
            angle={Math.PI / 9}
            penumbra={0.5}
            castShadow={false}
          />
        </group>
      ))}

      {/* Tail lights */}
      {[[-0.68, 0], [0.68, 1]].map(([z], i) => (
        <group key={`tl${i}`} position={[-2.42, 0.54, z]}>
          <mesh geometry={tlBoxG}  material={mat.tl} />
          <mesh geometry={tlStripG} material={mat.teal}
                position={[0, -0.043, 0]} />
        </group>
      ))}
      {/* Full-width tail bar connecting both clusters */}
      <mesh geometry={tlBarG} material={mat.tl}
            position={[-2.42, 0.50, 0]} />

      {/* Under-body glow */}
      <pointLight color={TEAL} intensity={2.8} distance={5.5} position={[ 0.0, -0.05, 0]} />
      <pointLight color={TEAL} intensity={1.4} distance={3.0} position={[ 1.8,  0.10, 0]} />
      <pointLight color={TEAL} intensity={1.2} distance={3.0} position={[-1.8,  0.10, 0]} />

      {/* ════ WHEELS ═════════════════════════════════════ */}
      {WHEELS.map(({ b, e, front }, idx) => (
        <group
          key={`wh${idx}`}
          ref={el => (wheelRefs.current[idx] = el)}
          position={[L(b[0], e[0]), L(b[1], e[1]), L(b[2], e[2])]}
        >
          <WheelMeshes
            isFront={front}
            matChrome={mat.chrome}
            matTeal={mat.tealDim}
            matBrake={mat.brake}
          />
        </group>
      ))}

    </group>
  );
}