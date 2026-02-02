import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, DynamicDrawUsage } from 'three';
import { useAppStore } from '../../store';

const PARTICLE_COUNT = 200;
const Y_START = -3;
const Y_END = 14; // Approximate top of BERT stack
const SPEED = 4.0;

export const ParticleFlow: React.FC = () => {
  const meshRef = useRef<InstancedMesh>(null);
  const { isFlowActive } = useAppStore();
  const dummy = useMemo(() => new Object3D(), []);

  // Initial random positions
  const particles = useMemo(() => {
    return new Array(PARTICLE_COUNT).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 3, // Spread width matching model width
      y: Y_START + Math.random() * (Y_END - Y_START),
      z: (Math.random() - 0.5) * 2,
      speed: Math.random() * 0.5 + 0.8, // Slight speed variance
      offset: Math.random() * 100
    }));
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current || !isFlowActive) return;

    particles.forEach((particle, i) => {
      // Move particle upwards
      let t = state.clock.elapsedTime * SPEED * particle.speed + particle.offset;
      
      // Wrap around logic (Periodic boundary)
      const height = Y_END - Y_START;
      let y = ((t % height) + height) % height + Y_START;

      // Pulse effect: Particles bunch up slightly
      // y += Math.sin(y * 0.5) * 0.2;

      dummy.position.set(particle.x, y, particle.z);
      
      // Stretch effect based on speed
      dummy.scale.set(0.05, 0.4, 0.05); 
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, PARTICLE_COUNT]}
      frustumCulled={false}
    >
      <capsuleGeometry args={[0.05, 1, 4, 8]} />
      <meshBasicMaterial color="#58A6FF" transparent opacity={0.4} />
    </instancedMesh>
  );
};