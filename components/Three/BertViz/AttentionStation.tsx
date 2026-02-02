
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Edges } from '@react-three/drei';
import { Group } from 'three';
import { TokenBarcode } from './TokenBarcode';

export const AttentionStation: React.FC = () => {
  const [tokens, setTokens] = useState<number[]>([]);

  useFrame((state) => {
    if (Math.floor(state.clock.elapsedTime * 10) % 25 === 0) {
      setTokens(prev => [...prev, state.clock.elapsedTime].slice(-3));
    }
  });

  return (
    <group>
      {/* --- STATION STRUCTURES --- */}
      
      {/* 1. The Prism (Splitter) */}
      <group position={[0, -1, 0]}>
         <mesh rotation={[0, Math.PI / 4, 0]}>
             <cylinderGeometry args={[0, 1, 1, 4]} />
             <meshBasicMaterial color="#D29922" wireframe transparent opacity={0.3} />
         </mesh>
         <Text position={[1.5, 0, 0]} fontSize={0.15} color="#D29922" anchorX="left">
           Multi-Head Split
         </Text>
      </group>

      {/* 2. The Interaction Field (Heatmap) */}
      <group position={[0, 0.5, 0]}>
         {/* Ghost Heatmap Plane */}
         <mesh rotation={[-Math.PI/4, 0, 0]} position={[0, 0, -0.5]}>
             <planeGeometry args={[2, 2]} />
             <meshBasicMaterial color="#D29922" transparent opacity={0.1} />
             <Edges color="#D29922" />
         </mesh>
         <Text position={[1.5, 0, 0]} fontSize={0.15} color="#D29922" anchorX="left">
           Self-Attention (Q x K)
         </Text>
      </group>

      {/* --- MOVING DATA TOKENS --- */}
      {tokens.map((t) => (
         <AnimatedAttnToken key={t} startTime={t} />
      ))}
    </group>
  );
};

const AnimatedAttnToken: React.FC<{ startTime: number }> = ({ startTime }) => {
  const ref = useRef<Group>(null);
  
  // State for the 12 heads
  const heads = Array.from({ length: 12 });

  useFrame((state) => {
    if (!ref.current) return;
    const elapsed = state.clock.elapsedTime - startTime;
    const speed = 1.0;
    const yPos = -2.5 + elapsed * speed;
    
    ref.current.position.y = yPos;
  });

  return (
    <group ref={ref}>
        {/* Main Token (Before Split) */}
        <mesh visible={true}> 
             {/* Logic to hide main token when split? 
                 For simplicity in this demo, let's keep it abstract. 
                 Below -1: Single Token. 
                 -1 to 1: Split Tokens.
                 Above 1: Merged Token.
             */}
        </mesh>

        <AttnFlowLogic startTime={startTime} />
    </group>
  );
};

const AttnFlowLogic: React.FC<{ startTime: number }> = ({ startTime }) => {
    const groupRef = useRef<Group>(null);
    const [phase, setPhase] = useState<'single' | 'split' | 'merged'>('single');

    useFrame((state) => {
        const elapsed = state.clock.elapsedTime - startTime;
        const yPos = -2.5 + elapsed * 1.0; // Same speed as parent

        if (yPos < -1) setPhase('single');
        else if (yPos >= -1 && yPos < 1.5) setPhase('split');
        else setPhase('merged');
    });

    if (phase === 'single') {
        return <TokenBarcode position={[0, 0, 0]} color="#D29922" />;
    }
    
    if (phase === 'merged') {
        return <TokenBarcode position={[0, 0, 0]} color="#D29922" isActivated />;
    }

    // Split Phase
    return (
        <group>
            {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
                <TokenBarcode 
                    key={i} 
                    position={[x * 0.5, 0, 0]} 
                    width={0.2} 
                    color="#D29922" 
                />
            ))}
        </group>
    );
};
