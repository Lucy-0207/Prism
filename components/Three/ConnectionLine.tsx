
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, CatmullRomCurve3, TubeGeometry, Mesh } from 'three';

interface ConnectionLineProps {
  start: [number, number, number];
  end: [number, number, number];
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({ start, end }) => {
  const meshRef = useRef<Mesh>(null);

  const curve = useMemo(() => {
    const vStart = new Vector3(...start);
    const vEnd = new Vector3(...end);
    
    // Calculate a mid-point that arcs upwards for a "cable" look
    const vMid = vStart.clone().lerp(vEnd, 0.5);
    vMid.y += 2; // Arc height

    return new CatmullRomCurve3([vStart, vMid, vEnd], false, 'catmullrom', 0.5);
  }, [start, end]);

  // Create geometry once
  const geometry = useMemo(() => new TubeGeometry(curve, 20, 0.05, 8, false), [curve]);

  useFrame((state) => {
    if (meshRef.current) {
        // Pulse effect
        const material = meshRef.current.material as any;
        material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial color="#58A6FF" transparent opacity={0.5} />
    </mesh>
  );
};
