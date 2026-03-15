import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { FloatingObjectProps } from './types';

export function FloatingOrb({
  position = [0, 0, 0],
  scale = 1,
  color = '#10B981',
  rotationSpeed = 0.3
}: FloatingObjectProps): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  const handlePointerMove = (event: THREE.Event & { point: THREE.Vector3 }): void => {
    const x = (event.point.x / window.innerWidth) * 2 - 1;
    const y = -(event.point.y / window.innerHeight) * 2 + 1;
    mousePosition.current = { x: x * 0.5, y: y * 0.5 };
  };

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    meshRef.current.rotation.x += delta * rotationSpeed * 0.2;
    meshRef.current.rotation.y += delta * rotationSpeed * 0.3;
    
    targetRotation.current.x = mousePosition.current.y * 0.3;
    targetRotation.current.y = mousePosition.current.x * 0.3;
    
    meshRef.current.rotation.x += (targetRotation.current.x - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (targetRotation.current.y - meshRef.current.rotation.y) * 0.05;
  });

  const distortValue = useMemo(() => 0.4, []);

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.5}
      floatIntensity={1}
      floatingRange={[-0.2, 0.2]}
    >
      <Sphere
        ref={meshRef}
        position={position}
        scale={scale}
        onPointerMove={handlePointerMove}
        args={[1, 64, 64]}
      >
        <MeshDistortMaterial
          color={color}
          envMapIntensity={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0.9}
          roughness={0.1}
          distort={distortValue}
          speed={2}
        />
      </Sphere>
    </Float>
  );
}
