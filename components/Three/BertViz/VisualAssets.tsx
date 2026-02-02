
import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { InstancedMesh, Object3D, Color } from 'three';
import { Text } from '@react-three/drei';

interface MatrixPlateProps {
  rows: number;
  cols: number;
  position: [number, number, number];
  color: string;
  label?: string;
  scale?: number;
}

export const MatrixPlate: React.FC<MatrixPlateProps> = ({ rows, cols, position, color, label, scale = 0.1 }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const count = rows * cols;
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Position cells in a grid centered at 0,0 relative to the group
        const x = (c - cols / 2) * (scale * 1.2);
        const y = (r - rows / 2) * (scale * 1.2); // Vertical stacking for matrix look
        
        dummy.position.set(x, y, 0);
        dummy.scale.set(scale, scale, scale * 0.2);
        dummy.updateMatrix();
        
        meshRef.current.setMatrixAt(i, dummy.matrix);
        
        // Random "Heatmap" activation
        const intensity = Math.random();
        const baseColor = new Color(color);
        // Mix with white for "hot" spots, black for "cold"
        if (intensity > 0.8) meshRef.current.setColorAt(i, new Color('#ffffff'));
        else if (intensity < 0.3) meshRef.current.setColorAt(i, baseColor.multiplyScalar(0.2));
        else meshRef.current.setColorAt(i, baseColor);

        i++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [rows, cols, scale, color, dummy]);

  return (
    <group position={position}>
      {label && (
        <Text
          position={[0, (rows * scale * 1.2) / 2 + 0.2, 0]}
          fontSize={0.2}
          color={color}
          anchorX="center"
          anchorY="bottom"
        >
          {label}
        </Text>
      )}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
};

export const SoftmaxPlane: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
       <mesh rotation={[-Math.PI / 2, 0, 0]}>
         <planeGeometry args={[2, 0.5]} />
         <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={2} />
       </mesh>
       <Text position={[0, 0.1, 0]} fontSize={0.15} color="#aaa" rotation={[-Math.PI/2, 0, 0]}>
         Softmax
       </Text>
    </group>
  );
};
