import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useScroll, Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';

// ─── Individual floating task card ────────────────────────────────────────────
interface CardMeshProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  speed: number;
}

function TaskCardMesh({ position, rotation, scale, color, speed }: CardMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = rotation[0] + Math.sin(t * speed * 0.3) * 0.15;
    meshRef.current.rotation.y = rotation[1] + Math.cos(t * speed * 0.2) * 0.15;
    meshRef.current.position.y = position[1] + Math.sin(t * speed * 0.4 + position[0]) * 0.12;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[1.4, 0.9, 0.06]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.55}
        roughness={0.05}
        metalness={0.1}
        transmission={0.6}
        thickness={0.5}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

// ─── The whole floating cluster + mouse parallax ───────────────────────────────
interface SceneProps {
  scrollProgress: MotionValue<number>;
}

function FloatingCards({ scrollProgress }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const { viewport } = useThree();

  // Pre-compute deterministic card positions
  const cards = useMemo(() => {
    const palette = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
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
          Math.random() * 0.5 - 0.25,
          Math.random() * 0.5 - 0.25,
          Math.random() * 0.4 - 0.2,
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
    canvas.addEventListener('mousemove', move);
    return () => canvas.removeEventListener('mousemove', move);
  });

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Slow global rotation
    groupRef.current.rotation.y += 0.0015;

    // Parallax tilt from mouse
    groupRef.current.rotation.x += (mouse.current.y * 0.18 - groupRef.current.rotation.x) * 0.04;
    groupRef.current.rotation.z += (-mouse.current.x * 0.08 - groupRef.current.rotation.z) * 0.04;

    // Scroll-linked: explode outward as user scrolls
    const sv = scrollProgress.get();
    groupRef.current.scale.setScalar(1 - sv * 0.5);
    groupRef.current.position.z = sv * 3;
    state.camera.position.z = 5 + sv * 2;
  });

  return (
    <group ref={groupRef}>
      {cards.map((c, i) => (
        <TaskCardMesh key={i} {...c} />
      ))}
    </group>
  );
}

// ─── Particle field ────────────────────────────────────────────────────────────
function ParticleField() {
  const ref = useRef<THREE.Points>(null!);
  const count = 400;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#6366f1'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#3b82f6'),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      const c = palette[i % palette.length];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.0003;
      ref.current.rotation.x += 0.0001;
    }
  });

  return (
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
      <pointsMaterial size={0.025} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// ─── Scene wrapper ─────────────────────────────────────────────────────────────
export default function HeroScene({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  return (
    <Canvas
      dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 4, 2]} intensity={1.2} color="#8b5cf6" />
      <pointLight position={[-4, -2, 3]} intensity={0.8} color="#6366f1" />
      <pointLight position={[3,  3, -2]} intensity={0.5} color="#3b82f6" />

      {/* Scene objects */}
      <FloatingCards scrollProgress={scrollProgress} />
      <ParticleField />

      {/* Environment for reflections */}
      <Environment preset="city" />
    </Canvas>
  );
}
