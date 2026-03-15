import { useRef, useEffect, useState, useCallback } from 'react';

export interface ParallaxOptions {
  speed?: number;
  direction?: 'vertical' | 'horizontal' | 'both';
}

export interface MousePosition {
  x: number;
  y: number;
}

export function useParallax(options: ParallaxOptions = {}): {
  scrollY: number;
  mousePosition: MousePosition;
  containerRef: React.RefObject<HTMLDivElement | null>;
} {
  const { speed = 0.5 } = options;
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY * speed);
  }, [speed]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    setMousePosition({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleScroll, handleMouseMove]);

  return { scrollY, mousePosition, containerRef };
}
