import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useScroll, Float, MeshTransmissionMaterial, Environment, Sparkles } from '@react-three/drei';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';

// ─── Individual floating task card ────────────────────────────────────────────
interface CardMeshProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  speed: number;
  reducedMotion: boolean;
}

function TaskCardMesh({ position, rotation, scale, color, speed, reducedMotion }: CardMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    // Smoother, more organic breathing and tilting
    meshRef.current.rotation.x = rotation[0] + Math.sin(t * speed * 0.2) * 0.1;
    meshRef.current.rotation.y = rotation[1] + Math.cos(t * speed * 0.15) * 0.1;
    meshRef.current.position.y = position[1] + Math.sin(t * speed * 0.3 + position[0]) * 0.15;
  });

  return (
    <Float speed={reducedMotion ? 0 : speed * 0.5} rotationIntensity={reducedMotion ? 0 : 0.2} floatIntensity={reducedMotion ? 0 : 0.5}>
      <mesh ref={meshRef} position={position} scale={scale} rotation={rotation}>
        <boxGeometry args={[1.6, 1.0, 0.04]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.2}
          chromaticAberration={0.03}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.3}
          temporalDistortion={0.1}
          iridescence={0.5}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color={color}
          roughness={0.08}
          metalness={0.1}
          transmission={0.9}
          envMapIntensity={1.5}
        />
      </mesh>
    </Float>
  );
}

// ─── The whole floating cluster + mouse parallax ───────────────────────────────
interface SceneProps {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

function FloatingCards({ scrollProgress, reducedMotion }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const { viewport } = useThree();

  // Premium, vibrant brand palette
  const cards = useMemo(() => {
    const palette = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#14b8a6', '#f59e0b', '#f43f5e'];
    return Array.from({ length: 28 }, (_, i) => {
      const angle  = (i / 28) * Math.PI * 2;
      const r      = 1.8 + (i % 5) * 0.5;
      const spread = (i % 3) * 0.6 - 0.6;
      return {
        position: [
          Math.cos(angle) * r + spread,
          Math.sin(angle * 1.3) * 1.4 + (i % 4) * 0.3 - 0.6,
          (i % 6) * 0.4 - 1.0,
        ] as [number, number, number],
        rotation: [
          Math.random() * 0.4 - 0.2,
          Math.random() * 0.4 - 0.2,
          Math.random() * 0.2 - 0.1,
        ] as [number, number, number],
        scale:  0.45 + (i % 5) * 0.09,
        color:  palette[i % palette.length],
        speed:  0.6 + (i % 5) * 0.18,
      };
    });
  }, []);

  // Mouse-based parallax
  const mouse = useRef({ x: 0, y: 0 });
  useThree(({ gl }) => {
    const canvas = gl.domElement;
    const move = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!reducedMotion) {
      canvas.addEventListener('mousemove', move);
    }
    return () => canvas.removeEventListener('mousemove', move);
  });

  useFrame((state) => {
    if (!groupRef.current) return;

    if (!reducedMotion) {
      // Slow global rotation
      groupRef.current.rotation.y += 0.001;

      // Parallax tilt from mouse
      groupRef.current.rotation.x += (mouse.current.y * 0.15 - groupRef.current.rotation.x) * 0.04;
      groupRef.current.rotation.z += (-mouse.current.x * 0.08 - groupRef.current.rotation.z) * 0.04;
    }

    // Scroll-linked: explode outward as user scrolls
    const sv = scrollProgress.get();
    groupRef.current.scale.setScalar(1 - sv * 0.5);
    groupRef.current.position.z = sv * 3;
    state.camera.position.z = 5 + sv * 2;
  });

  return (
    <group ref={groupRef}>
      {cards.map((c, i) => (
        <TaskCardMesh key={i} {...c} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

// ─── Particle field ────────────────────────────────────────────────────────────
function ParticleField({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 500;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#6366f1'),
      new THREE.Color('#a855f7'),
      new THREE.Color('#3b82f6'),
      new THREE.Color('#14b8a6'),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      const c = palette[i % palette.length];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame(() => {
    if (ref.current && !reducedMotion) {
      ref.current.rotation.y += 0.0002;
      ref.current.rotation.x += 0.0001;
    }
  });

  return (
    <>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.03} vertexColors transparent opacity={0.7} sizeAttenuation />
      </points>
      {!reducedMotion && (
        <Sparkles count={100} scale={12} size={2} speed={0.2} opacity={0.4} color="#a855f7" />
      )}
    </>
  );
}

// ─── Scene wrapper ─────────────────────────────────────────────────────────────
export default function HeroScene({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  // Check user preference for reduced motion
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  return (
    <Canvas
      dpr={[1, Math.min(window.devicePixelRatio, 2)]}
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Dynamic Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 2]} intensity={1.5} color="#a855f7" />
      <pointLight position={[-4, -3, 3]} intensity={1} color="#6366f1" />
      <pointLight position={[3,  -2, -2]} intensity={0.8} color="#ec4899" />
      <pointLight position={[0,  4, -4]} intensity={0.5} color="#14b8a6" />

      {/* Scene objects */}
      <FloatingCards scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
      <ParticleField reducedMotion={reducedMotion} />

      {/* Environment for reflections (studio gives clean bright highlights) */}
      <Environment preset="studio" />
    </Canvas>
  );
}
