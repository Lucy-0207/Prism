
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Edges } from '@react-three/drei';
import { Group } from 'three';
import { TokenBarcode } from './TokenBarcode';

export const FFNStation: React.FC = () => {
  const groupRef = useRef<Group>(null);
  const [tokens, setTokens] = useState<number[]>([]);

  // Spawn tokens periodically
  useFrame((state) => {
    if (Math.floor(state.clock.elapsedTime * 10) % 20 === 0) {
      setTokens(prev => [...prev, state.clock.elapsedTime].slice(-3)); // Keep last 3
    }
  });

  return (
    <group ref={groupRef}>
      {/* --- STATION STRUCTURES --- */}
      
      {/* 1. Expansion Grating */}
      <group position={[0, -1, 0]}>
         <mesh>
            <boxGeometry args={[4.2, 0.1, 0.1]} />
            <meshBasicMaterial color="#1f6feb" wireframe />
         </mesh>
         <Text position={[2.5, 0, 0]} fontSize={0.15} color="#1f6feb" anchorX="left">
           Expansion (Linear 1)
         </Text>
         <Text position={[2.5, -0.2, 0]} fontSize={0.1} color="#58a6ff" anchorX="left">
           768 {'->'} 3072
         </Text>
      </group>

      {/* 2. Activation Filter Gate (ReLU/GELU) */}
      <group position={[0, 0, 0]}>
         <mesh>
            <boxGeometry args={[4.2, 0.5, 0.1]} />
            <meshBasicMaterial color="#ff7b72" transparent opacity={0.1} />
            <Edges color="#ff7b72" />
         </mesh>
         <Text position={[2.5, 0, 0]} fontSize={0.15} color="#ff7b72" anchorX="left">
           Activation (GELU)
         </Text>
         <Text position={[2.5, -0.2, 0]} fontSize={0.1} color="#58a6ff" anchorX="left">
           Filter Negatives
         </Text>
      </group>

      {/* 3. Compression Lens */}
      <group position={[0, 1, 0]}>
         {/* Visual Funnel */}
         <mesh rotation={[0, 0, Math.PI]}>
             <coneGeometry args={[2.1, 0.5, 4, 1, true]} />
             <meshBasicMaterial color="#1f6feb" wireframe transparent opacity={0.3} />
         </mesh>
         <Text position={[2.5, 0, 0]} fontSize={0.15} color="#1f6feb" anchorX="left">
           Compression (Linear 2)
         </Text>
         <Text position={[2.5, -0.2, 0]} fontSize={0.1} color="#58a6ff" anchorX="left">
           3072 {'->'} 768
         </Text>
      </group>

      {/* --- MOVING DATA TOKENS --- */}
      {tokens.map((t) => (
         <AnimatedToken key={t} startTime={t} />
      ))}
    </group>
  );
};

const AnimatedToken: React.FC<{ startTime: number }> = ({ startTime }) => {
  const ref = useRef<Group>(null);
  const [state, setState] = useState({ y: -2, width: 1, activated: false });

  useFrame((threeState) => {
    const elapsed = threeState.clock.elapsedTime - startTime;
    const speed = 1.0;
    const yPos = -2 + elapsed * speed;
    
    // Pipeline Logic
    let currentWidth = 1;
    let isActivated = false;

    if (yPos < -1) {
        // Approaching Expansion
        currentWidth = 1;
    } else if (yPos >= -1 && yPos < 0) {
        // Expanding phase
        const progress = (yPos - (-1)) / 1.0;
        currentWidth = 1 + progress * 3; // 1 -> 4
    } else if (yPos >= 0 && yPos < 1) {
        // Activated Phase (Wide)
        currentWidth = 4;
        isActivated = true;
    } else if (yPos >= 1) {
        // Compression Phase
        const progress = Math.min((yPos - 1) / 0.5, 1);
        currentWidth = 4 - progress * 3; // 4 -> 1
        isActivated = true; // Stay activated
    }

    if (ref.current) {
        ref.current.position.y = yPos;
    }
    setState({ y: yPos, width: currentWidth, activated: isActivated });
  });

  if (state.y > 2.5) return null; // Cleanup roughly

  return (
    <group ref={ref}>
        <TokenBarcode 
            position={[0, 0, 0]} 
            width={state.width} 
            color="#58A6FF" 
            isActivated={state.activated}
        />
    </group>
  );
};
