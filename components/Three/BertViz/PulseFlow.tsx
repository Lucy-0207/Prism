
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, CatmullRomCurve3 } from 'three';

const PARTICLE_COUNT = 300;
const SPEED = 2.5;

interface PulseFlowProps {
  startY: number;
  endY: number;
  isActive: boolean;
}

export const PulseFlow: React.FC<PulseFlowProps> = ({ startY, endY, isActive }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  // Create paths: Center -> Split -> Merge -> Center
  const paths = useMemo(() => {
    const curves: CatmullRomCurve3[] = [];
    
    // Create 12 distinct paths representing attention heads
    for (let i = 0; i < 12; i++) {
       const angle = (i / 12) * Math.PI * 2;
       const radius = 1.5;
       
       const points = [
         new Vector3(0, startY, 0), // Start center
         new Vector3(Math.cos(angle) * radius * 0.5, startY + 1, Math.sin(angle) * radius * 0.5), // Split start
         new Vector3(Math.cos(angle) * radius, startY + 2.5, Math.sin(angle) * radius), // Head processing (Wide)
         new Vector3(Math.cos(angle) * radius * 0.5, startY + 4, Math.sin(angle) * radius * 0.5), // Merge start
         new Vector3(0, endY, 0) // End center
       ];
       
       curves.push(new CatmullRomCurve3(points));
    }
    return curves;
  }, [startY, endY]);

  // Particle State
  const particles = useMemo(() => {
    return new Array(PARTICLE_COUNT).fill(0).map(() => ({
      pathIndex: Math.floor(Math.random() * 12),
      progress: Math.random(), // 0 to 1
      speed: Math.random() * 0.2 + 0.8,
      size: Math.random() * 0.05 + 0.02
    }));
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current || !isActive) return;

    const time = state.clock.elapsedTime;
    
    // Rhythmic Pulse factor
    const pulse = Math.sin(time * 2) * 0.5 + 1; // 0.5 to 1.5

    particles.forEach((p, i) => {
      // Update progress
      p.progress += delta * SPEED * 0.1 * p.speed * pulse;
      if (p.progress > 1) p.progress = 0;

      // Get position on curve
      const curve = paths[p.pathIndex];
      const position = curve.getPointAt(p.progress);
      
      // Determine color based on stage (Height)
      const relativeH = (position.y - startY) / (endY - startY);
      
      dummy.position.copy(position);
      
      // Scale based on "Attention" (middle is bigger)
      const scale = p.size * (1 + Math.sin(relativeH * Math.PI) * 2);
      dummy.scale.set(scale, scale * 3, scale); // Stretch along movement roughly
      
      dummy.lookAt(curve.getPointAt(Math.min(p.progress + 0.01, 1)));
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      
      // Color Logic
      // 0.0 - 0.3: Input (Blue)
      // 0.3 - 0.7: Attention (Gold)
      // 0.7 - 1.0: Output (Purple)
      /* 
         Since we can't easily update instanceColor per frame without performance hit in React Three Fiber simplified usage, 
         we stick to a single material color or attribute. 
         For high perf, we use a static color here or a custom shader. 
         Let's stick to Gold for "Attention Flow".
      */
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
    </instancedMesh>
  );
};
