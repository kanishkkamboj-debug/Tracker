import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function CoreMesh({ activeCount }: { activeCount: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  // The more active tasks, the more distorted the sphere is.
  const distortion = Math.min(0.8, 0.2 + (activeCount * 0.05));
  const speed = hovered ? 4 : 2;

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
      
      const scale = THREE.MathUtils.lerp(meshRef.current.scale.x, hovered ? 1.1 : 1, 0.1);
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Sphere
      ref={meshRef}
      args={[1.5, 64, 64]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <MeshDistortMaterial
        color={hovered ? "#f093fb" : "#00f2fe"}
        attach="material"
        distort={distortion}
        speed={speed}
        roughness={0.2}
        metalness={0.8}
        wireframe={true}
      />
    </Sphere>
  );
}

export function DataCore({ activeCount = 0 }: { activeCount?: number }) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={1} />
        <directionalLight position={[2, 2, 5]} intensity={2} />
        <pointLight position={[-2, -2, -2]} color="#f093fb" intensity={5} />
        <CoreMesh activeCount={activeCount} />
      </Canvas>
    </div>
  );
}
