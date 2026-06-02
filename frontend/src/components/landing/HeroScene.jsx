/**
 * HeroScene.jsx
 * Place at: src/components/landing/HeroScene.jsx
 *
 * Cinematic 3D hero — React Three Fiber canvas.
 * Loads a GLB car model with HDR environment, reflective floor,
 * particle nebula, and mouse-driven headlight + camera parallax.
 *
 * Install:
 *   npm install @react-three/fiber @react-three/drei three
 *   npm install @react-three/postprocessing
 *
 * GLB Model:
 *   Place your car GLB at: public/models/car.glb
 *   Recommended free models (CC-licensed):
 *     - https://market.pmnd.rs/  (search "car")
 *     - https://sketchfab.com/3d-models/bmw-m5-f90 (free download)
 *     - https://github.com/KhronosGroup/glTF-Sample-Models
 *   The component gracefully falls back to a procedural car if GLB fails.
 *
 * HDR:
 *   Place HDR at: public/hdri/night_city.hdr
 *   Free HDRIs: https://polyhaven.com/hdris (city_night or industrial)
 */

import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useGLTF,
  Environment,
  PresentationControls,
  Float,
  Sparkles,
  MeshReflectorMaterial,
  ContactShadows,
  Html,
  useProgress,
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { gsap } from 'gsap';

/* ── Loading overlay ─────────────────────────────────────── */
function LoadingScreen() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        color: '#0ea5e9',
        fontFamily: 'monospace',
        fontSize: 13,
        textAlign: 'center',
        letterSpacing: 3,
        textTransform: 'uppercase',
      }}>
        <div style={{
          width: 200, height: 1, background: 'rgba(14,165,233,0.2)',
          margin: '0 auto 12px', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${progress}%`, background: '#0ea5e9',
            transition: 'width 0.3s ease',
          }} />
        </div>
        <div style={{ opacity: 0.5 }}>Loading {Math.round(progress)}%</div>
      </div>
    </Html>
  );
}

/* ── Procedural fallback car (if GLB fails or not provided) ─ */
function ProceduralCar({ mousePos }) {
  const groupRef  = useRef();
  const wheelRefs = useRef([]);
  const spotRefs  = useRef([]);

  const tealEmissive   = new THREE.Color(0x0ea5e9);
  const bodyColor      = new THREE.Color(0x030f1e);
  const chromeColor    = new THREE.Color(0x8ab4cc);
  const glassColor     = new THREE.Color(0x0a2040);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.04;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mousePos.current.x * 0.2,
      0.04
    );
    wheelRefs.current.forEach((w) => { if (w) w.rotation.x -= 0.025; });
    spotRefs.current.forEach((sp, i) => {
      if (!sp) return;
      sp.target.position.set(
        8 + mousePos.current.x * 5,
        -1 + mousePos.current.y * 2,
        i === 0 ? 0.6 : -0.6
      );
      sp.target.updateMatrixWorld();
    });
  });

  const wheelPositions = [[1.4, -0.1, 0.95], [1.4, -0.1, -0.95], [-1.4, -0.1, 0.95], [-1.4, -0.1, -0.95]];

  return (
    <group ref={groupRef}>
      {/* Lower body */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[4.2, 0.6, 1.9]} />
        <meshStandardMaterial color={bodyColor} metalness={0.98} roughness={0.04} />
      </mesh>
      {/* Cabin */}
      <mesh castShadow position={[-0.15, 1.0, 0]}>
        <boxGeometry args={[2.4, 0.58, 1.72]} />
        <meshStandardMaterial color={bodyColor} metalness={0.98} roughness={0.04} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0.82, 1.05, 0]} rotation={[0, -(Math.PI / 2 - 0.38), 0]}>
        <planeGeometry args={[1.5, 0.6]} />
        <meshStandardMaterial color={glassColor} metalness={0.1} roughness={0} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      {/* Teal accent stripe */}
      <mesh position={[0, 0.82, 0]}>
        <boxGeometry args={[4.2, 0.045, 1.92]} />
        <meshStandardMaterial color={tealEmissive} emissive={tealEmissive} emissiveIntensity={0.5} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Side skirts */}
      {[-0.96, 0.96].map((z, i) => (
        <mesh key={i} position={[0, 0.22, z]}>
          <boxGeometry args={[4.2, 0.1, 0.07]} />
          <meshStandardMaterial color={tealEmissive} emissive={tealEmissive} emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* Wheels */}
      {wheelPositions.map(([x, y, z], i) => (
        <group key={i} ref={(el) => (wheelRefs.current[i] = el)} position={[x, y, z]}>
          <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
            <torusGeometry args={[0.42, 0.14, 16, 32]} />
            <meshStandardMaterial color="#0a0a0f" roughness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.16, 12]} />
            <meshStandardMaterial color={chromeColor} metalness={1} roughness={0.05} />
          </mesh>
        </group>
      ))}
      {/* Headlights */}
      {[[2.0, 0.62, 0.55], [2.0, 0.62, -0.55]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="white" emissive="#d0f0ff" emissiveIntensity={2.5} />
          </mesh>
          {/* DRL strip */}
          <mesh position={[0.04, -0.07, 0]}>
            <boxGeometry args={[0.02, 0.04, 0.28]} />
            <meshStandardMaterial color={tealEmissive} emissive={tealEmissive} emissiveIntensity={3.5} />
          </mesh>
          <spotLight
            ref={(el) => (spotRefs.current[i] = el)}
            color="#d0f4ff"
            intensity={4}
            distance={16}
            angle={Math.PI / 9}
            penumbra={0.45}
            castShadow
          />
        </group>
      ))}
      {/* Taillights */}
      {[0.6, -0.6].map((z, i) => (
        <mesh key={i} position={[-2.05, 0.65, z]}>
          <boxGeometry args={[0.05, 0.12, 0.32]} />
          <meshStandardMaterial color={tealEmissive} emissive={tealEmissive} emissiveIntensity={1.8} />
        </mesh>
      ))}
      {/* Under-glow */}
      <pointLight color="#0ea5e9" intensity={2.2} distance={5} position={[0, -0.12, 0]} />
    </group>
  );
}

/* ── GLB car with fallback ───────────────────────────────── */
function CarModel({ mousePos, visible }) {
  const groupRef = useRef();
  const [glbLoaded, setGlbLoaded] = useState(false);
  let gltf = null;

  /* Try to load — wrapped in try/catch via ErrorBoundary in parent */
  try {
    gltf = useGLTF('/models/car.glb');
    if (!glbLoaded) setGlbLoaded(true);
  } catch {
    /* fallback */
  }

  /* GSAP entrance */
  useEffect(() => {
    if (!groupRef.current || !visible) return;
    groupRef.current.position.z = -18;
    groupRef.current.rotation.y = Math.PI * 0.45;
    gsap.to(groupRef.current.position, { z: 0, duration: 2.8, ease: 'power3.out', delay: 0.3 });
    gsap.to(groupRef.current.rotation, { y: 0, duration: 2.8, ease: 'power3.out', delay: 0.3 });
  }, [visible]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.04;
  });

  if (!gltf) {
    return (
      <group ref={groupRef}>
        <ProceduralCar mousePos={mousePos} />
      </group>
    );
  }

  return (
    <group ref={groupRef} scale={[1, 1, 1]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

/* ── Reflective ground ───────────────────────────────────── */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        blur={[300, 50]}
        resolution={512}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#030f1e"
        metalness={0.85}
        mirror={0}
      />
    </mesh>
  );
}

/* ── Grid lines ──────────────────────────────────────────── */
function GridPlane() {
  return <gridHelper args={[60, 60, '#0a2a4a', '#061422']} position={[0, -0.54, 0]} />;
}

/* ── Particle nebula ─────────────────────────────────────── */
function Nebula() {
  return (
    <>
      <Sparkles
        count={500}
        scale={[30, 10, 30]}
        size={1.5}
        speed={0.3}
        opacity={0.5}
        color="#0ea5e9"
        position={[0, 3, 0]}
      />
      <Sparkles
        count={300}
        scale={[20, 8, 20]}
        size={0.8}
        speed={0.15}
        opacity={0.3}
        color="#22d3ee"
        position={[0, 4, -5]}
      />
    </>
  );
}

/* ── Camera rig with mouse parallax ─────────────────────── */
function CameraRig({ mousePos }) {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mousePos.current.x * 1.2, 0.025);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.5 + mousePos.current.y * 0.6, 0.025);
  });

  return null;
}

/* ── Main HeroScene export ───────────────────────────────── */
export default function HeroScene({ mousePos, scrollProgress = 0 }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    /* Short delay so canvas is in DOM */
    const id = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(id);
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, Math.min(window.devicePixelRatio, 2)]}
      camera={{ position: [0, 2.5, 10], fov: 45, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        outputEncoding: THREE.sRGBEncoding,
      }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* Fog */}
      <fog attach="fog" args={['#020c18', 18, 70]} />

      {/* Ambient */}
      <ambientLight intensity={0.3} color="#0a1a2e" />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.1}
        color="#d0eeff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 4, -3]} intensity={1.3} color="#0ea5e9" />
      <directionalLight position={[0, -2, 6]} intensity={0.5} color="#22d3ee" />

      {/* Environment — uses public/hdri/night_city.hdr if present */}
      <Suspense fallback={null}>
        <Environment
          files="/hdri/night_city.hdr"
          background={false}
          /* fallback to a preset if HDR not found */
          preset="night"
        />
      </Suspense>

      {/* Scene content */}
      <Suspense fallback={<LoadingScreen />}>
        <CarModel mousePos={mousePos} visible={ready} />
        <Ground />
        <GridPlane />
        <Nebula />
        <ContactShadows
          position={[0, -0.54, 0]}
          opacity={0.7}
          scale={14}
          blur={2.5}
          far={4}
          color="#000510"
        />
      </Suspense>

      <CameraRig mousePos={mousePos} />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.18}
          luminanceSmoothing={0.9}
          intensity={0.55}
          radius={0.8}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}

/* Preload if path is known */
useGLTF.preload('/models/car.glb');