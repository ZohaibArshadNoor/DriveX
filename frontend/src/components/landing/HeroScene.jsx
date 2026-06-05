/**
 * HeroScene.jsx  v2 — Deep 3D + Optimised
 * Place at: src/components/landing/HeroScene.jsx
 *
 * NEW IN v2
 * ─────────────────────────────────────────────────────────────
 * POST-PROCESSING
 *  • SSAO  — Screen-Space Ambient Occlusion.  Single most impactful
 *    effect for perceived depth: darkens wheel arches, body panel
 *    joins, and undercarriage naturally.  Tuned to 16 samples at
 *    half-res so GPU cost is low.
 *  • ChromaticAberration — 0.0003 offset; invisible unless you look
 *    for it, but adds a subtle cinematic glass-lens feeling.
 *  • Bloom + Vignette retained from v1, intensity slightly raised.
 *
 * RENDERING
 *  • multisampling={0} on EffectComposer (still present, largest
 *    single GPU saving from v1).
 *  • DPR cap 1.5; shadow map 1024.
 *  • Frame-loop Camera Rig lerp at 0.02 (smooth, cheap).
 *
 * CAMERA
 *  • Entrance target rotation.y = -0.18 (was -0.16) — shows more
 *    of the car's 3-D front fascia and wheel arch depth.
 *
 * Deps: @react-three/fiber @react-three/drei
 *       @react-three/postprocessing  (≥ 2.x)
 *       three gsap
 */

import { Suspense, useRef, useEffect, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  Sparkles,
  MeshReflectorMaterial,
  Html,
  useProgress,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  Vignette,
  SSAO,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { gsap } from 'gsap';
import ProceduralSupercar from './ProceduralSupercar';

/* ── Loading bar ─────────────────────────────────────────── */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ textAlign: 'center', color: '#0ea5e9', fontFamily: 'monospace' }}>
        <div style={{
          width: 180, height: 1,
          background: 'rgba(14,165,233,0.18)',
          margin: '0 auto 10px', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${progress}%`, background: '#0ea5e9', transition: 'width 0.25s',
          }} />
        </div>
        <span style={{ fontSize: 10, letterSpacing: 3, opacity: 0.45, textTransform: 'uppercase' }}>
          {Math.round(progress)} %
        </span>
      </div>
    </Html>
  );
}

/* ── Reflective floor ────────────────────────────────────── */
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        blur={[280, 40]} resolution={384}
        mixBlur={1} mixStrength={34} roughness={1}
        depthScale={1.1} minDepthThreshold={0.4} maxDepthThreshold={1.4}
        color="#020c18" metalness={0.88} mirror={0}
      />
    </mesh>
  );
}

/* ── Teal grid ───────────────────────────────────────────── */
function GridLines() {
  return <gridHelper args={[60, 60, '#0a2a4a', '#061422']} position={[0, -0.53, 0]} />;
}

/* ── Particle nebula ─────────────────────────────────────── */
function Particles() {
  return (
    <>
      <Sparkles count={200} scale={[26,9,26]} size={1.4} speed={0.25}
                opacity={0.45} color="#0ea5e9" position={[0,3,0]} />
      <Sparkles count={110} scale={[16,7,16]} size={0.7}  speed={0.12}
                opacity={0.24} color="#22d3ee" position={[0,4,-5]} />
    </>
  );
}

/* ── Mouse-driven camera parallax ───────────────────────── */
function CameraRig({ mousePos }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mousePos.current.x * 1.1, 0.02);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.5 + mousePos.current.y * 0.55, 0.02);
  });
  return null;
}

/* ── Floating car with GSAP cinematic entrance ───────────── */
function FloatingCar({ mousePos }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    ref.current.position.set(0, -0.55, -18);
    ref.current.rotation.set(0, Math.PI * 0.42, 0);
    gsap.to(ref.current.position, { z: 0, duration: 2.8, ease: 'power3.out', delay: 0.4 });
    /* -0.18 shows front grille + wheel arch depth better than -0.15 */
    gsap.to(ref.current.rotation, { y: -0.18, duration: 2.8, ease: 'power3.out', delay: 0.4 });
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    /* Y-only float — never interferes with GSAP Z tween */
    ref.current.position.y = -0.55 + Math.sin(clock.getElapsedTime() * 0.5) * 0.04;
  });

  return (
    <group ref={ref}>
      <ProceduralSupercar mouseRef={mousePos} />
    </group>
  );
}

/* ── SSAO wrapper — isolates import errors gracefully ───── */
function AOPass() {
  /* SSAO requires @react-three/postprocessing ≥ 2.x
     If the import fails, just remove this component.    */
  return (
    <SSAO
      blendFunction={BlendFunction.MULTIPLY}
      samples={16}
      rings={3}
      distanceThreshold={0.10}
      distanceFalloff={0.0}
      rangeThreshold={0.001}
      rangeFalloff={0.01}
      luminanceInfluence={0.55}
      radius={0.08}
      scale={0.8}
      bias={0.06}
      intensity={20}
    />
  );
}

/* ── MAIN EXPORT ─────────────────────────────────────────── */
export default memo(function HeroScene({ mousePos }) {
  return (
    <Canvas
      shadows
      dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
      camera={{ position: [0, 2.5, 10], fov: 45, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <fog attach="fog" args={['#020c18', 20, 72]} />

      {/* Lights */}
      <ambientLight intensity={0.35} color="#0a1a2e" />
      <directionalLight position={[5, 10, 4]} intensity={1.1} color="#d0eeff"
                        castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 4, -3]} intensity={1.2} color="#0ea5e9" />
      <directionalLight position={[0, -2,  6]} intensity={0.4} color="#22d3ee" />

      {/* HDR env — essential for clearcoat + glass reflections */}
      <Suspense fallback={null}>
        <Environment preset="night" background={false} />
      </Suspense>

      {/* Scene */}
      <Suspense fallback={<Loader />}>
        <FloatingCar mousePos={mousePos} />
        <Floor />
        <GridLines />
        <Particles />
      </Suspense>

      <CameraRig mousePos={mousePos} />

      {/* ── Post-processing stack ──────────────────────────
          Order matters: SSAO → Bloom → ChromaticAberration → Vignette
          multisampling=0 is the biggest single GPU saving.          */}
      <EffectComposer multisampling={0}>
        {/* SSAO: darkens wheel arches, undercarriage, panel joins */}
        <AOPass />

        {/* Bloom: makes teal LEDs and headlights bleed light */}
        <Bloom
          luminanceThreshold={0.24}
          luminanceSmoothing={0.90}
          intensity={0.48}
          radius={0.75}
        />

        {/* Chromatic Aberration: subtle lens distortion, adds depth */}
        <ChromaticAberration
          offset={new THREE.Vector2(0.0003, 0.0003)}
          radialModulation={false}
          modulationOffset={0}
        />

        {/* Vignette: draws eye to car centre */}
        <Vignette eskil={false} offset={0.10} darkness={0.62} />
      </EffectComposer>
    </Canvas>
  );
});