import { Canvas, useFrame } from '@react-three/fiber';
import { Box, MeshDistortMaterial } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function FloatingBox() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <Box ref={meshRef} args={[2.5, 2.5, 2.5]}>
      <MeshDistortMaterial
        color="#f093fb"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        wireframe={true}
      />
    </Box>
  );
}

export function HoloBox() {
  return (
    <Canvas camera={{ position: [0, 0, 6] }} style={{ pointerEvents: 'none' }}>
      <ambientLight intensity={1} />
      <directionalLight position={[2, 2, 5]} intensity={2} />
      <pointLight position={[-2, -2, -2]} color="#00f2fe" intensity={5} />
      <FloatingBox />
    </Canvas>
  );
}
