export interface ThreeVector3 {
  x: number;
  y: number;
  z: number;
}

export interface FloatingObjectProps {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  rotationSpeed?: number;
}

export interface SceneProps {
  scrollY: number;
  mousePosition: { x: number; y: number };
}

export interface ParticleProps {
  count: number;
  mousePosition: { x: number; y: number };
}
