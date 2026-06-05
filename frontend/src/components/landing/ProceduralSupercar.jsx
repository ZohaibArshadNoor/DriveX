/**
 * ProceduralSupercar.jsx  v2 — Deep 3D Edition
 * Place at: src/components/landing/ProceduralSupercar.jsx
 *
 * NEW IN v2 vs v1
 * ───────────────────────────────────────────────────────────
 * GEOMETRY
 *  • Windshield glass slab — BoxGeometry at exact bezier angle (-46.4°)
 *    with MeshPhysicalMaterial transmission.  Zero "flat" look.
 *  • Rear window glass slab — same technique (62° opposite rake)
 *  • Roof glass panel — thin horizontal plane, tinted glass
 *  • Wheel arch lips — half TorusGeometry (arc=π) on BOTH outer sides of
 *    every wheel.  This is the #1 thing that makes arches look 3-D.
 *  • Body character line — dual teal LED strip at door-line height
 *  • Door panel gaps — four thin dark slabs implying body panel separation
 *  • Roof spoiler lip — small fin at leading edge of roof (McLaren detail)
 *  • Airfoil rear wing — ExtrudeGeometry of a real NACA-style profile
 *    replaces the flat box; chord=0.44, max thickness=0.068
 *  • LatheGeometry rim dish — concave alloy wheel face; spokes sit 15mm
 *    proud so they appear to rise out of the dish
 *
 * EXPLODE GROUPS
 *  Pieces now travel with their parent:
 *    Hood group  → headlights + hood details fly forward+up
 *    Cabin group → windshield + roof + rear glass fly straight up
 *    Rear group  → wing + diffuser + taillights fly backward+up
 *    Body        → sills, arch lips, character lines stay put
 *    4 wheels    → spread outward in Z
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

/* ═══════════════════════════════════════════════════════════
   SHAPE BUILDERS
   ═══════════════════════════════════════════════════════════ */

function makeBodyShape() {
  const s = new THREE.Shape();
  s.moveTo(2.30, 0.07);
  s.bezierCurveTo(2.44, 0.07,  2.52, 0.21,  2.44, 0.42);
  s.bezierCurveTo(2.36, 0.59,  2.08, 0.65,  1.76, 0.67);
  s.bezierCurveTo(1.35, 0.69,  0.92, 0.70,  0.66, 0.70);
  s.bezierCurveTo(0.48, 0.70,  0.34, 0.73,  0.24, 0.80);
  s.bezierCurveTo(0.08, 0.93, -0.10, 1.13, -0.18, 1.20);
  s.bezierCurveTo(-0.40, 1.26, -0.76, 1.27, -1.06, 1.20);
  s.bezierCurveTo(-1.34, 1.12, -1.58, 0.96, -1.76, 0.83);
  s.bezierCurveTo(-1.94, 0.72, -2.12, 0.66, -2.28, 0.62);
  s.bezierCurveTo(-2.45, 0.55, -2.50, 0.40, -2.44, 0.22);
  s.lineTo(-2.40, 0.07);
  s.lineTo(-2.12, 0.04);
  s.lineTo( 2.10, 0.04);
  s.lineTo( 2.23, 0.06);
  s.lineTo( 2.30, 0.07);
  const fa = new THREE.Path(); fa.absarc( 1.44, 0.42, 0.39, 0, Math.PI*2, true); s.holes.push(fa);
  const ra = new THREE.Path(); ra.absarc(-1.28, 0.42, 0.40, 0, Math.PI*2, true); s.holes.push(ra);
  return s;
}

function makeCabinShape() {
  const s = new THREE.Shape();
  s.moveTo(0.22, 0.80);
  s.bezierCurveTo(0.06, 0.93, -0.10, 1.13, -0.18, 1.20);
  s.bezierCurveTo(-0.40, 1.26, -0.76, 1.27, -1.06, 1.20);
  s.bezierCurveTo(-1.34, 1.12, -1.58, 0.96, -1.76, 0.83);
  s.lineTo(-1.76, 0.75); s.lineTo(0.22, 0.75); s.lineTo(0.22, 0.80);
  return s;
}

function makeHoodShape() {
  const s = new THREE.Shape();
  s.moveTo(2.30, 0.07);
  s.bezierCurveTo(2.44, 0.07, 2.52, 0.21, 2.44, 0.42);
  s.bezierCurveTo(2.36, 0.59, 2.08, 0.65, 1.76, 0.67);
  s.bezierCurveTo(1.35, 0.69, 0.92, 0.70, 0.66, 0.70);
  s.lineTo(0.66, 0.60); s.lineTo(1.76, 0.60);
  s.bezierCurveTo(2.06, 0.57, 2.32, 0.44, 2.40, 0.26);
  s.lineTo(2.38, 0.08); s.lineTo(2.30, 0.07);
  return s;
}

function makeRearShape() {
  const s = new THREE.Shape();
  s.moveTo(-2.40, 0.07);
  s.bezierCurveTo(-2.50, 0.40, -2.45, 0.55, -2.28, 0.62);
  s.bezierCurveTo(-2.12, 0.66, -1.94, 0.72, -1.76, 0.83);
  s.lineTo(-1.76, 0.74); s.lineTo(-1.96, 0.64);
  s.bezierCurveTo(-2.14, 0.58, -2.38, 0.45, -2.38, 0.15);
  s.lineTo(-2.40, 0.07);
  return s;
}

/**
 * NACA-inspired rear wing airfoil profile.
 * Leading edge at x=0, trailing edge at x=-0.44 (−X = toward rear of car).
 * Upper surface arcs up (positive Y); lower surface nearly flat.
 */
function makeWingProfile() {
  const s = new THREE.Shape();
  const C = 0.44, T = 0.068;
  s.moveTo(0, 0);
  s.bezierCurveTo(-C*0.10,  T*0.62, -C*0.28,  T*0.96, -C*0.50,  T);
  s.bezierCurveTo(-C*0.72,  T*0.96, -C*0.90,  T*0.38, -C,       0);
  s.bezierCurveTo(-C*0.88, -T*0.10, -C*0.25, -T*0.14,  0,       0);
  return s;
}

/* ═══════════════════════════════════════════════════════════
   MODULE-LEVEL SHARED GEOMETRIES
   Created once on import, shared across all car instances.
   ═══════════════════════════════════════════════════════════ */

/* Wheel constants */
const TIRE_R  = 0.42;
const TIRE_W  = 0.22;
const RIM_R   = 0.30;
const N_SPOKE = 5;
const SMID    = (0.08 + RIM_R - 0.02) / 2;
const SLEN    = RIM_R - 0.10;

/* Tyre / rim sub-geometries */
const _tireGeo   = new THREE.CylinderGeometry(TIRE_R, TIRE_R, TIRE_W, 32, 1, false);
const _innerGeo  = new THREE.CylinderGeometry(TIRE_R-0.025, TIRE_R-0.025, TIRE_W*0.84, 28, 1, false);
const _barrelGeo = new THREE.CylinderGeometry(RIM_R+0.012, RIM_R+0.012, TIRE_W-0.04, 24, 1, false);
const _backGeo   = new THREE.CylinderGeometry(RIM_R, RIM_R, 0.007, 24);
const _spokeGeo  = new THREE.BoxGeometry(0.038, SLEN, 0.050);
const _ringGeo   = new THREE.TorusGeometry(RIM_R-0.022, 0.014, 8, 24);
const _hubGeo    = new THREE.CylinderGeometry(0.050, 0.050, 0.022, 12);
const _rotorGeo  = new THREE.CylinderGeometry(0.22, 0.22, 0.016, 20);
const _calGeo    = new THREE.BoxGeometry(0.088, 0.082, 0.195);

/**
 * LatheGeometry concave rim dish — the NEW addition.
 * Profile in XY: x = radius (0→0.312), y = depth (concave dip at r≈0.17).
 * After rotation.x = PI/2 on the mesh, the dish face points in Z → visible
 * from the side of the car.  Spokes sit 15 mm proud in front of it.
 */
const RIM_PROFILE = [
  new THREE.Vector2(0.001,  0.000),
  new THREE.Vector2(0.055,  0.008),
  new THREE.Vector2(0.108,  0.013),
  new THREE.Vector2(0.172, -0.024),   // ← concave low-point
  new THREE.Vector2(0.232, -0.019),
  new THREE.Vector2(0.282, -0.007),
  new THREE.Vector2(0.308, -0.001),
  new THREE.Vector2(0.312,  0.000),
];
const _rimDishGeo = new THREE.LatheGeometry(RIM_PROFILE, 24);

/* Shared euler to avoid per-frame allocation */
const WHEEL_ROT = new THREE.Euler(Math.PI / 2, 0, 0);

/* ═══════════════════════════════════════════════════════════
   WHEEL SUB-COMPONENT
   ═══════════════════════════════════════════════════════════ */
function WheelMeshes({ isFront, matChrome, matTeal, matBrake }) {
  return (
    <>
      {/* Outer tyre */}
      <mesh rotation={WHEEL_ROT} castShadow geometry={_tireGeo}>
        <meshStandardMaterial color={BLACK} roughness={0.92} metalness={0} />
      </mesh>

      {/* Inner tyre wall */}
      <mesh rotation={WHEEL_ROT} geometry={_innerGeo}>
        <meshStandardMaterial color="#101010" roughness={0.95} metalness={0} />
      </mesh>

      {/* Rim barrel (chrome ring) */}
      <mesh rotation={WHEEL_ROT} geometry={_barrelGeo} material={matChrome} />

      {/* ── NEW: concave alloy rim dish (LatheGeometry) ──────
          Sits flush with barrel face. Spokes at z=+0.015 sit proud of it. */}
      <mesh rotation={WHEEL_ROT} geometry={_rimDishGeo} material={matChrome} />

      {/* Dark back-plate behind dish */}
      <mesh rotation={WHEEL_ROT} geometry={_backGeo}>
        <meshStandardMaterial color="#0c1018" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* 5 Y-spokes — z=+0.015 so they read above the dish face */}
      {Array.from({ length: N_SPOKE }, (_, i) => {
        const θ = (i / N_SPOKE) * Math.PI * 2;
        return (
          <mesh
            key={i}
            geometry={_spokeGeo}
            material={matChrome}
            position={[Math.sin(θ) * SMID, Math.cos(θ) * SMID, 0.015]}
            rotation={[0, 0, -θ]}
          />
        );
      })}

      {/* Outer rim ring (raised lip) */}
      <mesh rotation={WHEEL_ROT} geometry={_ringGeo} material={matChrome} />

      {/* Centre cap */}
      <mesh rotation={WHEEL_ROT} geometry={_hubGeo} material={matTeal} />

      {/* Brake rotor */}
      <mesh rotation={WHEEL_ROT} geometry={_rotorGeo}>
        <meshStandardMaterial color="#585858" metalness={0.8} roughness={0.45} />
      </mesh>

      {/* Brake caliper */}
      <mesh position={[0, -0.21, 0]} geometry={_calGeo} material={matBrake} />

      {/* Under-wheel teal glow */}
      <pointLight color={TEAL} intensity={0.50} distance={1.0} position={[0, -0.44, 0]} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function ProceduralSupercar({ explodeProgress = 0, mouseRef }) {
  const groupRef  = useRef();
  const wheelRefs = useRef([null, null, null, null]);
  const spotRefs  = useRef([null, null]);

  /* ── Geometries ─────────────────────────────────────────── */
  const geos = useMemo(() => {
    const ext = (shape, depth) => {
      const g = new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: false, curveSegments: 32, steps: 1,
      });
      g.translate(0, 0, -depth / 2);
      return g;
    };
    const wing = new THREE.ExtrudeGeometry(makeWingProfile(), {
      depth: 1.58, bevelEnabled: false, curveSegments: 12, steps: 1,
    });
    wing.translate(0, 0, -0.79);
    return {
      body:  ext(makeBodyShape(),  1.84),
      cabin: ext(makeCabinShape(), 1.30),
      hood:  ext(makeHoodShape(),  1.82),
      rear:  ext(makeRearShape(),  1.82),
      wing,
    };
  }, []);

  /* ── Materials ──────────────────────────────────────────── */
  const mat = useMemo(() => {
    const bodyPaint = new THREE.MeshPhysicalMaterial({
      color: BODY, metalness: 0.88, roughness: 0.10,
      clearcoat: 1.0, clearcoatRoughness: 0.06, reflectivity: 0.95,
    });
    return {
      body: bodyPaint,
      /* cabin base — opaque dark */
      cabin: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#04090f'), metalness: 0, roughness: 0,
        transmission: 0.65, transparent: true, ior: 1.52,
        thickness: 0.3, opacity: 0.82, side: THREE.DoubleSide,
      }),
      /* pure glass for angled slabs — higher transmission, thinner */
      glass: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#06101a'), metalness: 0, roughness: 0,
        transmission: 0.88, transparent: true, ior: 1.52,
        thickness: 0.15, opacity: 0.68, side: THREE.DoubleSide,
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
      gap: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#010304'), roughness: 1.0, metalness: 0.0,
      }),
    };
  }, []);

  /* ── Animation loop ─────────────────────────────────────── */
  useFrame(() => {
    wheelRefs.current.forEach(w => { if (w) w.rotation.z -= 0.022; });
    if (!mouseRef?.current) return;
    const { x: mx, y: my } = mouseRef.current;
    spotRefs.current.forEach((sp, i) => {
      if (!sp) return;
      sp.target.position.set(8 + mx*5, -1 + my*2, i===0 ? 0.68+mx*1.8 : -0.68+mx*1.8);
      sp.target.updateMatrixWorld();
    });
  });

  /* ── Explode lerp ───────────────────────────────────────── */
  const ep = explodeProgress;
  const L  = (a, b) => THREE.MathUtils.lerp(a, b, ep);

  /* Wheel base → exploded world positions */
  const WHEELS = [
    { b: [ 1.44, 0.42, -0.95], e: [ 2.20, 0.42, -2.28], front: true  },
    { b: [ 1.44, 0.42,  0.95], e: [ 2.20, 0.42,  2.28], front: true  },
    { b: [-1.28, 0.42, -0.95], e: [-2.10, 0.42, -2.28], front: false },
    { b: [-1.28, 0.42,  0.95], e: [-2.10, 0.42,  2.28], front: false },
  ];

  /* ── Windshield geometry
     Bottom (0.24, 0.80) → Top (-0.18, 1.20) in side-profile.
     Length = √(0.42²+0.40²) ≈ 0.580.  Rake angle from +Y = -46.4° = -0.810 rad.
     BoxGeometry: [thickness, slant-length, car-width]               */
  const WS_H   = 0.016;  // glass thickness
  const WS_LEN = 0.580;  // windshield slant length
  const WS_W   = 1.24;   // across-car width
  const WS_ANG = -0.810; // rotation.z in radians

  /* ── Rear window geometry
     Bottom (-1.76, 0.83) → Top (-1.06, 1.20).  Length ≈ 0.792. Angle = +62° = +1.082 rad. */
  const RW_LEN = 0.792;
  const RW_W   = 1.22;
  const RW_ANG =  1.082;

  return (
    <group ref={groupRef}>

      {/* ════════════════════════════════════════════════════
          MAIN BODY — sills, arch lips, character lines stay
          with the chassis throughout the explode animation.
          ════════════════════════════════════════════════════ */}
      <mesh
        geometry={geos.body}
        material={mat.body}
        position={[0, L(0, -0.12), 0]}
        castShadow receiveShadow
      />

      {/* ── Side sill LED strips ──────────────────────────── */}
      {[-0.93, 0.93].map((z, i) => (
        <mesh key={`sill${i}`} material={mat.teal}
              position={[0, 0.19, z]} castShadow={false}>
          <boxGeometry args={[4.60, 0.040, 0.052]} />
        </mesh>
      ))}

      {/* ── Body character lines (door-line LED) — NEW ──────
          Runs at y=0.54, separating upper/lower body panels. */}
      {[-0.93, 0.93].map((z, i) => (
        <mesh key={`char${i}`} material={mat.teal}
              position={[0, 0.54, z]} castShadow={false}>
          <boxGeometry args={[4.20, 0.014, 0.030]} />
        </mesh>
      ))}

      {/* ── Door panel gap lines — NEW ──────────────────────
          Thin dark slabs at the A and B pillar positions,
          implying separate body panels and adding depth.    */}
      {[0.22, -0.82].map((x, i) =>
        [-0.93, 0.93].map((z, j) => (
          <mesh key={`gap${i}${j}`} material={mat.gap}
                position={[x, 0.44, z]} castShadow={false}>
            <boxGeometry args={[0.012, 0.72, 0.028]} />
          </mesh>
        ))
      )}

      {/* ── Wheel arch lips — NEW ───────────────────────────
          Half TorusGeometry (arc=π) arches OVER each wheel.
          rotation=[π/2,0,0] puts the torus ring in the XY plane
          so it follows the side-profile arch cut in the body.
          8 total: both outer sides of all 4 wheel positions.  */}
      {[
        { cx:  1.44, cy: 0.42, r: 0.41 },   // front
        { cx: -1.28, cy: 0.42, r: 0.42 },   // rear
      ].map(({ cx, cy, r }, wi) =>
        [-0.96, 0.96].map((wz, si) => (
          <mesh
            key={`archlip${wi}${si}`}
            position={[cx, cy, wz]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow={false}
          >
            <torusGeometry args={[r, 0.020, 10, 34, Math.PI]} />
            <meshPhysicalMaterial
              color={BODY} metalness={0.88} roughness={0.10}
              clearcoat={1.0} clearcoatRoughness={0.06}
            />
          </mesh>
        ))
      )}

      {/* ── Front splitter ───────────────────────────────── */}
      <mesh material={mat.dark} position={[2.16, 0.054, 0]} castShadow={false}>
        <boxGeometry args={[0.20, 0.028, 1.76]} />
      </mesh>
      {[-0.38, -0.12, 0.12, 0.38].map((z, i) => (
        <mesh key={`sfin${i}`} material={mat.dark}
              position={[2.08, 0.055, z]} castShadow={false}>
          <boxGeometry args={[0.12, 0.055, 0.020]} />
        </mesh>
      ))}

      {/* ── Front air intakes ────────────────────────────── */}
      {[-0.72, 0.72].map((z, i) => (
        <mesh key={`intake${i}`} material={mat.dark}
              position={[2.32, 0.25, z]} castShadow={false}>
          <boxGeometry args={[0.045, 0.17, 0.26]} />
        </mesh>
      ))}

      {/* Under-body glow lights */}
      <pointLight color={TEAL} intensity={2.8} distance={5.5} position={[ 0.0, -0.05, 0]} />
      <pointLight color={TEAL} intensity={1.4} distance={3.0} position={[ 1.8,  0.10, 0]} />
      <pointLight color={TEAL} intensity={1.2} distance={3.0} position={[-1.8,  0.10, 0]} />

      {/* ════════════════════════════════════════════════════
          HOOD GROUP — hood + hood details + headlights
          fly forward+up together during explode.
          ════════════════════════════════════════════════════ */}
      <group position={[L(0, 2.10), L(0, 1.40), 0]}>

        {/* Hood panel */}
        <mesh geometry={geos.hood} material={mat.body} castShadow />

        {/* Hood spine crease — NEW */}
        <mesh material={mat.tealDim} position={[1.28, 0.712, 0]} castShadow={false}>
          <boxGeometry args={[1.65, 0.016, 0.026]} />
        </mesh>

        {/* Hood centre vent strip */}
        <mesh material={mat.teal} position={[1.28, 0.706, 0]} castShadow={false}>
          <boxGeometry args={[1.70, 0.016, 0.20]} />
        </mesh>

        {/* Headlights (travel with hood) */}
        {[[-0.66, 0], [0.66, 1]].map(([z], i) => (
          <group key={`hl${i}`} position={[2.38, 0.60, z]}>
            {/* LED unit */}
            <mesh material={mat.hl} castShadow={false}>
              <boxGeometry args={[0.042, 0.082, 0.26]} />
            </mesh>
            {/* Inner housing depth */}
            <mesh material={mat.dark} position={[-0.018, 0.004, 0]} castShadow={false}>
              <boxGeometry args={[0.038, 0.068, 0.28]} />
            </mesh>
            {/* DRL strip */}
            <mesh material={mat.teal} position={[0.005, -0.056, 0]} castShadow={false}>
              <boxGeometry args={[0.052, 0.020, 0.30]} />
            </mesh>
            {/* Projector lens dome */}
            <mesh material={mat.hl} position={[0.025, 0.010, 0]}
                  rotation={[0, 0, Math.PI / 2]} castShadow={false}>
              <sphereGeometry args={[0.032, 10, 6, 0, Math.PI*2, 0, Math.PI/2]} />
            </mesh>
            {/* Spotlight */}
            <spotLight
              ref={el => (spotRefs.current[i] = el)}
              color="#c0e8ff" intensity={3.8} distance={18}
              angle={Math.PI / 9} penumbra={0.5} castShadow={false}
            />
          </group>
        ))}

        {/* Side mirrors (travel with hood/body join area) */}
        {[-0.93, 0.93].map((z, i) => (
          <group key={`mir${i}`} position={[0.58, 0.91, z]}>
            <mesh material={mat.body} castShadow={false}>
              <boxGeometry args={[0.11, 0.055, 0.20]} />
            </mesh>
            <mesh material={mat.dark} position={[0.055, 0, 0]} castShadow={false}>
              <boxGeometry args={[0.022, 0.050, 0.18]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ════════════════════════════════════════════════════
          CABIN GROUP — glass panels + roof fly straight up.
          ════════════════════════════════════════════════════ */}
      <group position={[0, L(0, 2.60), 0]}>

        {/* Cabin base (dark glass extrusion) */}
        <mesh geometry={geos.cabin} material={mat.cabin} />

        {/* ── Windshield glass slab — NEW ─────────────────
            Exact angle: -0.810 rad from +Y toward rear.
            Center of the slab (0.03, 1.00) matches the
            midpoint of the side-profile bezier segment.    */}
        <mesh
          material={mat.glass}
          position={[0.03, 1.00, 0]}
          rotation={[0, 0, WS_ANG]}
          castShadow={false}
        >
          <boxGeometry args={[WS_H, WS_LEN, WS_W]} />
        </mesh>

        {/* ── Rear window glass slab — NEW ────────────────
            Angle: +1.082 rad (forward rake opposite to ws). */}
        <mesh
          material={mat.glass}
          position={[-1.41, 1.015, 0]}
          rotation={[0, 0, RW_ANG]}
          castShadow={false}
        >
          <boxGeometry args={[WS_H, RW_LEN, RW_W]} />
        </mesh>

        {/* ── Roof glass panel — NEW ──────────────────────
            Thin horizontal pane between A and C pillars.  */}
        <mesh
          material={mat.glass}
          position={[-0.62, 1.284, 0]}
          castShadow={false}
        >
          <boxGeometry args={[0.84, 0.013, 1.14]} />
        </mesh>

        {/* ── Roof spoiler lip — NEW ──────────────────────
            Small fin at the A-pillar/roof junction (McLaren detail). */}
        <mesh material={mat.body} position={[-0.20, 1.28, 0]} castShadow={false}>
          <boxGeometry args={[0.038, 0.058, 1.10]} />
        </mesh>
      </group>

      {/* ════════════════════════════════════════════════════
          REAR GROUP — engine lid + wing + diffuser + taillights
          fly backward+up together during explode.
          ════════════════════════════════════════════════════ */}
      <group position={[L(0, -2.10), L(0, 1.20), 0]}>

        {/* Rear engine lid */}
        <mesh geometry={geos.rear} material={mat.body} castShadow />

        {/* ── Airfoil wing (replaces flat box) — NEW ──────
            Leading edge at local x=-1.84, trailing x=-2.28.
            ExtrudeGeometry spans 1.58 in Z (centred).       */}
        <mesh geometry={geos.wing} material={mat.body}
              position={[-1.84, 1.05, 0]} castShadow />

        {/* Wing Gurney flap (teal micro-strip at trailing edge) */}
        <mesh material={mat.teal} position={[-2.28, 1.082, 0]} castShadow={false}>
          <boxGeometry args={[0.016, 0.052, 1.56]} />
        </mesh>

        {/* Wing endplates */}
        {[-0.80, 0.80].map((z, i) => (
          <mesh key={`wep${i}`} material={mat.dark}
                position={[-2.06, 1.08, z]} castShadow={false}>
            <boxGeometry args={[0.46, 0.22, 0.026]} />
          </mesh>
        ))}

        {/* Wing pillars */}
        {[-0.68, 0.68].map((z, i) => (
          <mesh key={`wpi${i}`} material={mat.chrome}
                position={[-1.90, 0.88, z]} castShadow={false}>
            <boxGeometry args={[0.036, 0.34, 0.036]} />
          </mesh>
        ))}

        {/* Rear diffuser fins */}
        {[-0.54, -0.18, 0.18, 0.54].map((z, i) => (
          <mesh key={`dfin${i}`} material={mat.dark}
                position={[-2.24, 0.11, z]} castShadow={false}>
            <boxGeometry args={[0.25, 0.21, 0.030]} />
          </mesh>
        ))}

        {/* Tail lights (travel with rear lid) */}
        {[[-0.68, 0], [0.68, 1]].map(([z], i) => (
          <group key={`tl${i}`} position={[-2.42, 0.54, z]}>
            <mesh material={mat.tl} castShadow={false}>
              <boxGeometry args={[0.036, 0.072, 0.33]} />
            </mesh>
            <mesh material={mat.teal} position={[0, -0.043, 0]} castShadow={false}>
              <boxGeometry args={[0.026, 0.011, 0.35]} />
            </mesh>
          </group>
        ))}
        {/* Full-width tail bar */}
        <mesh material={mat.tl} position={[-2.42, 0.50, 0]} castShadow={false}>
          <boxGeometry args={[0.023, 0.011, 0.80]} />
        </mesh>
      </group>

      {/* ════════════════════════════════════════════════════
          WHEELS × 4
          ════════════════════════════════════════════════════ */}
      {WHEELS.map(({ b, e, front }, idx) => (
        <group
          key={`wh${idx}`}
          ref={el => (wheelRefs.current[idx] = el)}
          position={[L(b[0],e[0]), L(b[1],e[1]), L(b[2],e[2])]}
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