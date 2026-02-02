
import React, { useMemo } from 'react';
import { CanvasTexture, NearestFilter } from 'three';
import { extend } from '@react-three/fiber';

interface TokenBarcodeProps {
  position: [number, number, number];
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
  isActivated?: boolean; // If true, applies a "ReLU" mask (dark spots)
}

export const TokenBarcode: React.FC<TokenBarcodeProps> = ({ 
  position, 
  width = 1, 
  height = 0.2, 
  color = "#58A6FF",
  opacity = 1,
  isActivated = false
}) => {
  // Generate a random "embedding" texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 64, 1);
      
      // Draw "active" values
      for (let i = 0; i < 64; i++) {
        const val = Math.random();
        if (isActivated) {
            // Simulate ReLU: sparse activation (lots of blacks)
            if (val > 0.7) {
                const intensity = Math.floor(val * 255);
                ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
                ctx.fillRect(i, 0, 1, 1);
            }
        } else {
            // Dense embedding
            const intensity = Math.floor(Math.random() * 200 + 55);
            ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
            ctx.fillRect(i, 0, 1, 1);
        }
      }
    }
    const tex = new CanvasTexture(canvas);
    tex.magFilter = NearestFilter;
    return tex;
  }, [isActivated]);

  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial 
        map={texture} 
        color={color} 
        transparent 
        opacity={opacity} 
        side={2}
      />
      {/* Glow Halo */}
      <mesh position={[0, 0, -0.01]} scale={[1.1, 1.5, 1]}>
         <planeGeometry args={[width, height]} />
         <meshBasicMaterial color={color} transparent opacity={opacity * 0.3} />
      </mesh>
    </mesh>
  );
};
