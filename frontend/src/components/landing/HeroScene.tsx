import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment, Edges, Sparkles, Box, Grid } from '@react-three/drei';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';

function KanbanCard({ startPos, color, delay, speed = 1 }: { startPos: [number, number, number], color: string, delay: number, speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed + delay;
    
    // Columns at x = -2.5, 0, 2.5
    const cycle = (t * 0.3) % 4; // 0 to 4
    let targetX = -2.5;
    let targetZ = startPos[2];
    
    if (cycle > 1 && cycle <= 2) {
      targetX = 0;
      targetZ = startPos[2] - 0.5; // move up a bit
    } else if (cycle > 2 && cycle <= 3) {
      targetX = 2.5;
      targetZ = startPos[2];
    } else if (cycle > 3) {
       // Quick snap back to start (invisible wrap)
       targetX = -2.5;
    }
    
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.05);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.05);
    meshRef.current.position.y = startPos[1] + Math.sin(t * 2) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
      <mesh ref={meshRef} position={startPos} castShadow>
        <boxGeometry args={[1.8, 0.8, 0.05]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.2}
          chromaticAberration={0.05}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.3}
          temporalDistortion={0.1}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color={color}
          roughness={0.1}
          metalness={0.1}
          transmission={1}
          envMapIntensity={2}
        />
        <Edges scale={1.02} threshold={15} color={color} />
      </mesh>
    </Float>
  );
}

function Board({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!groupRef.current) return;
    const sv = scrollProgress.get();
    // Rotate board gently based on scroll
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -Math.PI / 6 + sv * Math.PI * 0.5, 0.05);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, sv * 5, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -sv * 2, 0.05);
  });

  return (
    <group ref={groupRef} rotation={[0, -Math.PI / 6, 0]}>
      {/* 3 Columns */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <Box key={i} args={[2, 0.05, 6]} position={[x, -0.5, 0]} receiveShadow>
          <meshStandardMaterial color="#050505" transparent opacity={0.8} roughness={0.1} metalness={0.8} />
          <Edges color={i === 0 ? '#4facfe' : i === 1 ? '#00f2fe' : '#f093fb'} scale={1.01} />
        </Box>
      ))}

      {/* Cards */}
      <KanbanCard startPos={[-2.5, 0.5, -1.5]} color="#4facfe" delay={0} />
      <KanbanCard startPos={[-2.5, 1.5, 0]} color="#00f2fe" delay={5} speed={1.2} />
      <KanbanCard startPos={[-2.5, 0.8, 1.5]} color="#f093fb" delay={2} speed={0.8} />
      <KanbanCard startPos={[-2.5, 2.0, -1]} color="#4facfe" delay={8} speed={1.1} />
    </group>
  );
}

export default function HeroScene({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 5, 10], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#00f2fe" castShadow />
      <pointLight position={[-5, 5, -5]} intensity={3} color="#f093fb" />
      <pointLight position={[0, -5, 0]} intensity={2} color="#4facfe" />
      
      <Board scrollProgress={scrollProgress} />

      <Grid
        position={[0, -1.5, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={1}
        cellColor="#111"
        sectionSize={3}
        sectionThickness={1.5}
        sectionColor="#00f2fe"
        fadeDistance={25}
        fadeStrength={1}
      />

      <Sparkles count={300} scale={15} size={2} speed={0.2} opacity={0.6} color="#00f2fe" />
      <Environment preset="city" />
    </Canvas>
  );
}
