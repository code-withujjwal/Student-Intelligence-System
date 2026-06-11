import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// ─────────────────────────────────────────────────────────────────────────────
// CELESTIAL DATA MATRIX — 7 Core Nodes
// ─────────────────────────────────────────────────────────────────────────────
const CELESTIAL_NODES = [
  { id: 'P1', orbitRadius: 160, tilt: 15,  speed: 0.18, type: 'METRIC',  label: 'ACCURACY TREND',     dataVisual: 'TREND_SPHERE', colorDark: '#a78bfa', colorLight: '#8b5cf6' },
  { id: 'P2', orbitRadius: 220, tilt: -12, speed: 0.25, type: 'MISSION', label: 'DAILY MISSION',       dataVisual: 'TASK_RING',    colorDark: '#22d3ee', colorLight: '#0ea5e9' },
  { id: 'P3', orbitRadius: 280, tilt: 8,   speed: 0.32, type: 'METRIC',  label: 'GLOBAL RANK',         dataVisual: 'RANK_ORB',     colorDark: '#fbbf24', colorLight: '#d97706' },
  { id: 'P4', orbitRadius: 340, tilt: -18, speed: 0.40, type: 'GAP',     label: 'NEURAL GAP ANALYSIS', dataVisual: 'GLITCH_CORE',  colorDark: '#f87171', colorLight: '#ef4444' },
  { id: 'P5', orbitRadius: 400, tilt: 10,  speed: 0.50, type: 'SUBJECT', label: 'DATA STRUCTURES',     dataVisual: 'DSA_NODE',     colorDark: '#34d399', colorLight: '#10b981' },
  { id: 'P6', orbitRadius: 460, tilt: -6,  speed: 0.62, type: 'SUBJECT', label: 'DATABASE SYSTEMS',    dataVisual: 'DBMS_SCHEMA',  colorDark: '#60a5fa', colorLight: '#3b82f6' },
  { id: 'P7', orbitRadius: 520, tilt: 14,  speed: 0.75, type: 'SUBJECT', label: 'OPERATING SYSTEMS',   dataVisual: 'OS_THREAD',    colorDark: '#fb923c', colorLight: '#f97316' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// DEEP SPACE STARFIELD
// ─────────────────────────────────────────────────────────────────────────────

function EnvironmentController({ isDark }: { isDark: boolean }) {
  const { scene } = useThree();
  const targetBg = useMemo(() => new THREE.Color(isDark ? '#060912' : '#f0f9ff'), [isDark]);
  const targetFog = useMemo(() => new THREE.Color(isDark ? '#060912' : '#e0f2fe'), [isDark]);

  useEffect(() => {
    if (!scene.background) scene.background = new THREE.Color('#060912');
    if (!scene.fog) scene.fog = new THREE.Fog('#060912', 1200, 2600);
  }, [scene]);

  useFrame((_, delta) => {
    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(targetBg, delta * 3);
    }
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.lerp(targetFog, delta * 3);
    }
  });
  return null;
}

function DeepSpaceStars({ isDark }: { isDark: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, colors } = useMemo(() => {
    const count = 8000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const starColors = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#c7d2fe'),
      new THREE.Color('#bfdbfe'),
      new THREE.Color('#e0e7ff'),
      new THREE.Color('#fde68a'),
    ];
    for (let i = 0; i < count; i++) {
      const r = 1000 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const c = starColors[Math.floor(Math.random() * starColors.length)];
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.004;
      pointsRef.current.rotation.x += delta * 0.001;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, isDark ? 0.85 : 0.05, delta * 2);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={1.4}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KARL SUN — multi-layer emissive sphere with corona rings
// ─────────────────────────────────────────────────────────────────────────────
function KarlSun({ isDark }: { isDark: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null!);
  const auraRef = useRef<THREE.Mesh>(null!);
  const coronaRef = useRef<THREE.Mesh>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const pulseRef = useRef(0);

  const targetCoreColor = useMemo(() => new THREE.Color(isDark ? '#1a0a3e' : '#fef08a'), [isDark]);
  const targetCoreEmissive = useMemo(() => new THREE.Color(isDark ? '#7c3aed' : '#f59e0b'), [isDark]);
  const targetAuraColor = useMemo(() => new THREE.Color(isDark ? '#4c1d95' : '#fcd34d'), [isDark]);
  const targetAuraEmissive = useMemo(() => new THREE.Color(isDark ? '#8b5cf6' : '#fbbf24'), [isDark]);
  const targetCoronaColor = useMemo(() => new THREE.Color(isDark ? '#1e40af' : '#7dd3fc'), [isDark]);
  const targetCoronaEmissive = useMemo(() => new THREE.Color(isDark ? '#22d3ee' : '#38bdf8'), [isDark]);


  const coreGeo = useMemo(() => new THREE.SphereGeometry(60, 64, 64), []);
  const auraGeo = useMemo(() => new THREE.SphereGeometry(72, 32, 32), []);
  const coronaGeo = useMemo(() => new THREE.SphereGeometry(88, 16, 16), []);
  const ring1Geo = useMemo(() => new THREE.TorusGeometry(80, 1.5, 8, 120), []);
  const ring2Geo = useMemo(() => new THREE.TorusGeometry(95, 0.8, 8, 120), []);

  useFrame((_, delta) => {
    pulseRef.current += delta;
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.06;
      coreRef.current.rotation.z += delta * 0.02;
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.2 + Math.sin(pulseRef.current * 1.4) * 0.3;
      mat.color.lerp(targetCoreColor, delta * 3);
      mat.emissive.lerp(targetCoreEmissive, delta * 3);
    }
    if (auraRef.current) {
      auraRef.current.rotation.y -= delta * 0.03;
      const mat = auraRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = (isDark ? 0.12 : 0.2) + Math.sin(pulseRef.current * 0.8) * 0.04;
      mat.color.lerp(targetAuraColor, delta * 3);
      mat.emissive.lerp(targetAuraEmissive, delta * 3);
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.x += delta * 0.015;
      const mat = coronaRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = (isDark ? 0.05 : 0.15) + Math.sin(pulseRef.current * 0.5) * 0.02;
      mat.color.lerp(targetCoronaColor, delta * 3);
      mat.emissive.lerp(targetCoronaEmissive, delta * 3);
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 2 + Math.sin(pulseRef.current * 0.3) * 0.1;
      ring1Ref.current.rotation.z += delta * 0.04;
      const mat = ring1Ref.current.material as THREE.MeshBasicMaterial;
      mat.color.lerp(targetAuraEmissive, delta * 3);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.PI / 3;
      ring2Ref.current.rotation.y += delta * 0.05;
      const mat = ring2Ref.current.material as THREE.MeshBasicMaterial;
      mat.color.lerp(targetCoronaEmissive, delta * 3);
    }
  });

  return (
    <group>
      {/* Core */}
      <mesh ref={coreRef} geometry={coreGeo}>
        <meshStandardMaterial
          color="#1a0a3e"
          emissive="#7c3aed"
          emissiveIntensity={1.4}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Inner glow aura */}
      <mesh ref={auraRef} geometry={auraGeo}>
        <meshStandardMaterial
          color="#4c1d95"
          emissive="#8b5cf6"
          emissiveIntensity={0.9}
          transparent
          opacity={0.14}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer corona */}
      <mesh ref={coronaRef} geometry={coronaGeo}>
        <meshStandardMaterial
          color="#1e40af"
          emissive="#22d3ee"
          emissiveIntensity={0.4}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Corona rings */}
      <mesh ref={ring1Ref} geometry={ring1Geo}>
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
      </mesh>
      <mesh ref={ring2Ref} geometry={ring2Geo}>
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.3} />
      </mesh>

      {/* KARL.AI label — emissive Html label */}
      <Html center position={[0, 0, 62]} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9px',
          fontWeight: 900,
          letterSpacing: '0.22em',
          color: isDark ? 'rgba(196,181,253,0.75)' : 'rgba(100,116,139,0.9)',
          textTransform: 'uppercase',
          textShadow: isDark ? '0 0 12px rgba(139,92,246,0.9)' : '0 0 12px rgba(251,191,36,0.8)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>
          KARL.AI
        </div>
      </Html>

      {/* Sun point light */}
      <pointLight color="#8b5cf6" intensity={5} distance={1400} decay={1.2} />
      <pointLight color="#22d3ee" intensity={2} distance={700} decay={1.5} position={[120, 80, 0]} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORBITAL RING — tilted glowing torus
// ─────────────────────────────────────────────────────────────────────────────
function OrbitalRing({ radius, tilt, colorDark, colorLight, isDark }: { radius: number; tilt: number; colorDark: string; colorLight: string; isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geo = useMemo(() => new THREE.TorusGeometry(radius, 0.55, 8, 240), [radius]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.003;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geo}
      rotation={[Math.PI / 2 + THREE.MathUtils.degToRad(tilt), 0, 0]}
    >
      <meshBasicMaterial color={isDark ? colorDark : colorLight} transparent opacity={0.22} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANET NODES — 7 unique 3D geometries orbiting their rings
// ─────────────────────────────────────────────────────────────────────────────
function PlanetNode({
  orbitRadius,
  tilt,
  speed,
  colorDark,
  colorLight,
  isDark,
  dataVisual,
  label,
  initialAngle,
}: {
  orbitRadius: number;
  tilt: number;
  speed: number;
  colorDark: string;
  colorLight: string;
  isDark: boolean;
  dataVisual: string;
  label: string;
  initialAngle: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const angleRef = useRef(initialAngle);
  const tiltRad = THREE.MathUtils.degToRad(tilt);
  const [hovered, setHovered] = useState(false);

  const geometry = useMemo(() => {
    switch (dataVisual) {
      case 'TREND_SPHERE':  return new THREE.SphereGeometry(11, 28, 28);
      case 'TASK_RING':     return new THREE.TorusGeometry(9, 3.5, 12, 40);
      case 'RANK_ORB':      return new THREE.OctahedronGeometry(12, 2);
      case 'GLITCH_CORE':   return new THREE.DodecahedronGeometry(11, 1);
      case 'DSA_NODE':      return new THREE.IcosahedronGeometry(11, 1);
      case 'DBMS_SCHEMA':   return new THREE.CylinderGeometry(7, 9, 16, 8);
      case 'OS_THREAD':     return new THREE.SphereGeometry(11, 6, 6);
      default:              return new THREE.SphereGeometry(11, 16, 16);
    }
  }, [dataVisual]);

  useFrame((_, delta) => {
    angleRef.current += delta * speed * 0.015;
    const angle = angleRef.current;

    const x = Math.cos(angle) * orbitRadius;
    const yRaw = Math.sin(angle) * orbitRadius;
    const y = yRaw * Math.sin(tiltRad);
    const z = yRaw * Math.cos(tiltRad);

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
      if (hovered) {
        meshRef.current.scale.setScalar(1.35);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Glow sphere behind planet */}
      <mesh>
        <sphereGeometry args={[18, 12, 12]} />
        <meshBasicMaterial color={isDark ? colorDark : colorLight} transparent opacity={0.07} depthWrite={false} />
      </mesh>

      {/* Main planet mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <meshStandardMaterial
          color={isDark ? colorDark : colorLight}
          emissive={isDark ? colorDark : colorLight}
          emissiveIntensity={hovered ? 1.0 : 0.55}
          roughness={dataVisual === 'OS_THREAD' ? 1.0 : 0.35}
          metalness={0.3}
          wireframe={dataVisual === 'OS_THREAD'}
        />
      </mesh>

      {/* Label */}
      {hovered && (
        <Html center position={[0, 22, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(14,19,34,0.85)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${isDark ? colorDark : colorLight}44`,
            borderRadius: '6px',
            padding: '4px 10px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: isDark ? colorDark : colorLight,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            boxShadow: `0 0 12px ${isDark ? colorDark : colorLight}33`,
          }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ASTEROID BELT — InstancedMesh × 10,000
// ─────────────────────────────────────────────────────────────────────────────
function AsteroidBelt({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const ASTEROID_COUNT = 10000;

  const { dummy, rotSpeeds, driftSpeeds, driftAmps } = useMemo(() => {
    const d = new THREE.Object3D();
    const rotS = new Float32Array(ASTEROID_COUNT * 3);
    const driftS = new Float32Array(ASTEROID_COUNT);
    const driftA = new Float32Array(ASTEROID_COUNT);

    for (let i = 0; i < ASTEROID_COUNT; i++) {
      // Spread throughout the whole scene in rings and random scatter
      const zone = Math.random();
      let r: number;
      if (zone < 0.5) {
        // Dense band between inner and outer planet orbits
        r = 130 + Math.random() * 430;
      } else if (zone < 0.75) {
        // Outer sparse cloud
        r = 560 + Math.random() * 280;
      } else {
        // Wide scattered field
        r = 60 + Math.random() * 840;
      }

      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.65;

      d.position.set(
        r * Math.cos(theta) * Math.cos(phi),
        r * Math.sin(phi) * (0.6 + Math.random() * 0.4),
        r * Math.sin(theta) * Math.cos(phi),
      );

      const scale = 0.4 + Math.random() * 2.8;
      d.scale.set(
        scale * (0.7 + Math.random() * 0.6),
        scale * (0.5 + Math.random() * 0.8),
        scale * (0.6 + Math.random() * 0.7),
      );
      d.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      );
      d.updateMatrix();

      rotS[i * 3]     = (Math.random() - 0.5) * 0.04;
      rotS[i * 3 + 1] = (Math.random() - 0.5) * 0.06;
      rotS[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
      driftS[i]       = 0.006 + Math.random() * 0.012;
      driftA[i]       = 0.5 + Math.random() * 2.0;
    }
    return { dummy: d, rotSpeeds: rotS, driftSpeeds: driftS, driftAmps: driftA };
  }, []);

  // Store initial matrices
  const initialMatrices = useMemo(() => {
    const mats: THREE.Matrix4[] = [];
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      mats.push(new THREE.Matrix4());
    }
    return mats;
  }, []);

  // Initialize matrices on mount
  useEffect(() => {
    if (!meshRef.current) return;
    const d = new THREE.Object3D();
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      meshRef.current.getMatrixAt(i, initialMatrices[i]);
    }
    // Store position/scale/rotation arrays for per-frame update
    d.updateMatrix();
  }, []);

  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;

    for (let i = 0; i < ASTEROID_COUNT; i++) {
      meshRef.current.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

      // Axial drift (gentle float up/down)
      dummy.position.y += Math.sin(t * driftSpeeds[i] + i) * driftAmps[i] * delta * 0.08;

      // Rotation
      dummy.rotation.x += rotSpeeds[i * 3]     * delta * 40;
      dummy.rotation.y += rotSpeeds[i * 3 + 1] * delta * 40;
      dummy.rotation.z += rotSpeeds[i * 3 + 2] * delta * 40;

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);

  return (
    <instancedMesh ref={meshRef} args={[geo, undefined, ASTEROID_COUNT]} castShadow>
      <meshStandardMaterial
        color={isDark ? "#8899bb" : "#38bdf8"}
        roughness={isDark ? 0.88 : 0.2}
        metalness={isDark ? 0.12 : 0.8}
        emissive={isDark ? "#1a2040" : "#0284c7"}
        emissiveIntensity={isDark ? 0.15 : 0.4}
      />
    </instancedMesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CELESTIAL SCENE — assembles all 3D objects
// ─────────────────────────────────────────────────────────────────────────────
function CelestialScene({ isDark }: { isDark: boolean }) {
  return (
    <>
      <EnvironmentController isDark={isDark} />
      {/* Lighting */}
      <ambientLight intensity={isDark ? 0.12 : 0.6} color={isDark ? "#0d0d30" : "#ffffff"} />
      <directionalLight color="#ffffff" intensity={isDark ? 0.25 : 1.2} position={[200, 400, 200]} />

      {/* Background starfield */}
      <DeepSpaceStars isDark={isDark} />

      {/* Central Sun */}
      <KarlSun isDark={isDark} />

      {/* 7 Orbital Rings */}
      {CELESTIAL_NODES.map((node) => (
        <OrbitalRing
          key={`ring-${node.id}`}
          radius={node.orbitRadius}
          tilt={node.tilt}
          colorDark={node.colorDark}
          colorLight={node.colorLight}
          isDark={isDark}
        />
      ))}

      {/* 7 Planet Nodes */}
      {CELESTIAL_NODES.map((node, idx) => (
        <PlanetNode
          key={`planet-${node.id}`}
          orbitRadius={node.orbitRadius}
          tilt={node.tilt}
          speed={node.speed}
          colorDark={node.colorDark}
          colorLight={node.colorLight}
          isDark={isDark}
          dataVisual={node.dataVisual}
          label={node.label}
          initialAngle={(idx / CELESTIAL_NODES.length) * Math.PI * 2}
        />
      ))}

      {/* Asteroid Belt */}
      <AsteroidBelt isDark={isDark} />

      {/* Camera Controls */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={90}
        maxDistance={1800}
        zoomSpeed={0.8}
        rotateSpeed={0.55}
        panSpeed={0.6}
        target={[0, 0, 0]}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH PANEL — floating glassmorphic overlay (Html in 3D scene)
// ─────────────────────────────────────────────────────────────────────────────
const STUDENT_BENEFITS = [
  { id: 'B1', text: 'Practice core engineering modules systematically with chapter-by-chapter quiz sets.' },
  { id: 'B2', text: 'Target tough concepts with personalized real-time AI study hints generated instantly.' },
  { id: 'B3', text: 'Track performance consistency with dedicated developer-tier progress scoreboards.' },
];

function AuthPanel({
  visible,
  onLogin,
  isDark,
}: {
  visible: boolean;
  onLogin: () => void;
  isDark: boolean;
}) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="auth-panel"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
            padding: '1rem',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2.5rem',
              maxWidth: '860px',
              width: '100%',
              background: isDark ? 'rgba(6,9,18,0.72)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(22px)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: isDark ? '0 0 80px rgba(99,102,241,0.08), 0 40px 100px rgba(0,0,0,0.6)' : '0 0 80px rgba(99,102,241,0.1), 0 40px 100px rgba(0,0,0,0.15)',
            }}
          >
            {/* Left column — orientation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
              <div>
                <h2 style={{
                  fontSize: '3.2rem',
                  fontWeight: 900,
                  fontFamily: 'JetBrains Mono, monospace',
                  background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 55%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                  lineHeight: 1.1,
                }}>
                  KARL.AI
                </h2>
                <p style={{
                  color: isDark ? '#64748b' : '#475569',
                  fontSize: '0.72rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginTop: '0.75rem',
                  lineHeight: 1.7,
                  maxWidth: '280px',
                  letterSpacing: '0.04em',
                }}>
                  Your adaptive computer science learning companion. Built for engineering students.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {STUDENT_BENEFITS.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.07 }}
                    style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'rgba(99,102,241,0.14)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: '1px',
                    }}>
                      <CheckCircle2 size={10} color="#6366F1" />
                    </div>
                    <p style={{
                      color: isDark ? '#cbd5e1' : '#334155',
                      fontSize: '0.68rem',
                      lineHeight: 1.65,
                      fontFamily: 'Inter, sans-serif',
                      margin: 0,
                      letterSpacing: '0.03em',
                    }}>
                      {b.text}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div style={{
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '0.9rem 1.1rem',
                background: isDark ? 'rgba(14,19,34,0.38)' : 'rgba(241,245,249,0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
              }}>
                <Zap size={18} color="#8b5cf6" />
                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.57rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#fff', margin: 0 }}>
                    Powered by Gemini AI
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5rem', color: '#475569', marginTop: '2px', letterSpacing: '0.06em', margin: 0 }}>
                    Google DeepMind — Generative AI Layer
                  </p>
                </div>
              </div>
            </div>

            {/* Right column — auth form */}
            <div style={{
              background: isDark ? 'rgba(14,19,34,0.3)' : 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '1.8rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Top gradient accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, transparent 5%, rgba(99,102,241,0.6) 40%, rgba(34,211,238,0.45) 70%, transparent 95%)',
              }} />

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.4rem' }}>
                {(['login', 'register'] as const).map((t) => (
                  <button
                    key={t}
                    id={`auth-tab-${t}`}
                    onClick={() => setTab(t)}
                    style={{
                      padding: '0.5rem 1rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      borderRadius: '8px',
                      border: tab === t ? '1px solid rgba(99,102,241,0.32)' : '1px solid transparent',
                      background: tab === t ? 'rgba(99,102,241,0.12)' : 'transparent',
                      color: tab === t ? '#a5b4fc' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Google btn */}
              <button
                id="google-signin-btn"
                onClick={onLogin}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.02)',
                  color: isDark ? '#cbd5e1' : '#334155',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.13em',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  marginBottom: '1.1rem',
                }}
                onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.48rem', color: '#334155', letterSpacing: '0.12em', textTransform: 'uppercase' }}>— or —</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
              </div>

              {/* Form */}
              <AnimatePresence mode="wait">
                <motion.form
                  key={tab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onSubmit={handleSubmit}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
                >
                  {tab === 'register' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label htmlFor="auth-username" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.54rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.13em', color: '#475569' }}>
                        Full Name
                      </label>
                      <input
                        id="auth-username"
                        type="text"
                        placeholder="Your full name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required={tab === 'register'}
                        style={getInputStyle(isDark)}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor="auth-email" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.54rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.13em', color: '#475569' }}>
                      Email Address
                    </label>
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={getInputStyle(isDark)}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label htmlFor="auth-password" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.54rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.13em', color: '#475569' }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="auth-password"
                        type={showPw ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ ...getInputStyle(isDark), paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        id="toggle-password-btn"
                        onClick={() => setShowPw((p) => !p)}
                        style={{
                          position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', color: '#475569',
                          display: 'flex', alignItems: 'center', padding: 0,
                        }}
                      >
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {tab === 'login' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="button" id="forgot-password-btn" style={{ background: 'none', border: 'none', color: '#6366F1', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.54rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    id="confirm-access-btn"
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #6366F1 0%, #4f46e5 100%)',
                      color: '#fff',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      cursor: 'pointer',
                      boxShadow: '0 0 28px rgba(99,102,241,0.32)',
                      transition: 'filter 0.15s ease',
                    }}
                    onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'; }}
                    onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)'; }}
                  >
                    Confirm System Access
                  </button>
                </motion.form>
              </AnimatePresence>

              {/* Footer */}
              <div style={{ marginTop: '1.1rem', paddingTop: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5rem', color: '#334155', margin: 0 }}>
                  {tab === 'login' ? 'No account yet?' : 'Already have access?'}
                </p>
                <button
                  id="switch-auth-mode-btn"
                  type="button"
                  onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                  style={{ background: 'none', border: 'none', color: '#6366F1', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  {tab === 'login' ? 'Create Account →' : '← Back to Sign In'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED STYLE
// ─────────────────────────────────────────────────────────────────────────────
const getInputStyle = (isDark: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '0.7rem 0.9rem',
  borderRadius: '10px',
  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
  background: isDark ? 'rgba(2,6,23,0.55)' : 'rgba(255,255,255,0.8)',
  color: isDark ? '#f1f5f9' : '#0f172a',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '0.72rem',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  boxSizing: 'border-box',
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function KarlSystem() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [authVisible, setAuthVisible] = useState(true);
  const [navVisible, setNavVisible] = useState(true);

  const handleLogin = () => {
    setAuthVisible(false);
    setTimeout(() => navigate('/features'), 320);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: isDark ? '#060912' : '#f0f9ff',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── Sticky Nav Header ── */}
      <AnimatePresence>
        {navVisible && (
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.9rem 1.75rem',
              background: isDark ? 'rgba(6,9,18,0.78)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                id="system-back-btn"
                onClick={() => navigate('/')}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
                  background: 'transparent', color: isDark ? '#64748b' : '#475569', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; }}
              >
                <ArrowLeft size={14} />
              </button>

              <div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6366F1', margin: 0 }}>
                  Celestial Control Deck
                </p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', fontWeight: 700, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, marginTop: '1px' }}>
                  KARL.AI
                </p>
              </div>
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {['About Us', 'Features', 'Dashboard', 'Login'].map((item) => (
                <button
                  key={item}
                  id={`nav-${item.toLowerCase().replace(' ', '-')}`}
                  onClick={() => {
                    if (item === 'Login') { setAuthVisible((v) => !v); return; }
                    if (item === 'Dashboard') { navigate('/dashboard'); return; }
                    if (item === 'Features') { navigate('/features'); return; }
                  }}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: item === 'Login' ? '#a5b4fc' : '#64748b',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.color = item === 'Login' ? '#a5b4fc' : '#64748b'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  {item}
                </button>
              ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399', display: 'inline-block' }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.16em', color: '#34d399', textTransform: 'uppercase' }}>
                System Online
              </span>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── Three.js Canvas (full viewport) ── */}
      <Canvas
        style={{ position: 'absolute', inset: 0 }}
        camera={{ fov: 75, near: 0.1, far: 3000, position: [0, 280, 680] }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.8]}
        shadows={false}
      >
        
        
        <CelestialScene isDark={isDark} />
      </Canvas>

      {/* ── Auth Panel Overlay ── */}
      <AuthPanel visible={authVisible} onLogin={handleLogin} isDark={isDark} />

      {/* ── Dismiss hint ── */}
      <AnimatePresence>
        {authVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5 }}
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 45,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.5rem',
              color: '#334155',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              pointerEvents: 'none',
            }}
          >
            Click &amp; drag the scene to orbit · Scroll to zoom
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
