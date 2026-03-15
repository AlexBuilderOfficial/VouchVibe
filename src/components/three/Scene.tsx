import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { FloatingOrb } from './FloatingOrb';
import { Particles } from './Particles';
import type { SceneProps } from './types';
import * as THREE from 'three';

function SceneContent({ scrollY, mousePosition }: SceneProps): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.y = -scrollY * 0.001;
    }
  });
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
      
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#10B981" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#34D399" />
      
      <group ref={groupRef}>
        <FloatingOrb
          position={[2, 0.5, -1]}
          scale={0.8}
          color="#10B981"
          rotationSpeed={0.4}
        />
        
        <FloatingOrb
          position={[-2.5, -0.5, -2]}
          scale={0.5}
          color="#34D399"
          rotationSpeed={0.6}
        />
        
        <Particles count={400} mousePosition={mousePosition} />
      </group>
      
      <Environment preset="night" />
    </>
  );
}

export function Scene({ scrollY, mousePosition }: SceneProps): JSX.Element {
  return (
    <div className="canvas-3d-container">
      <Canvas
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <SceneContent scrollY={scrollY} mousePosition={mousePosition} />
        </Suspense>
      </Canvas>
    </div>
  );
}
