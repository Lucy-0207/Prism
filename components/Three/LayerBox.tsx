import React, { useRef, useState } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { LayerData, Dimensions, Position } from '../../types';
import { useAppStore } from '../../store';
import { Edges } from '@react-three/drei';

interface LayerBoxProps {
  layer: LayerData;
  position: Position;
  dimensions: Dimensions;
  color: string;
}

const LayerBox: React.FC<LayerBoxProps> = ({ layer, position, dimensions, color }) => {
  const meshRef = useRef<Mesh>(null);
  const { selectLayer, setHoveredLayer, selectedLayer, hoveredLayer } = useAppStore();
  const [hovered, setHover] = useState(false);

  const isSelected = selectedLayer?.id === layer.id;
  const isHoveredGlobal = hoveredLayer?.id === layer.id;

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Subtle floating animation for active elements
      if (isSelected) {
        meshRef.current.rotation.y += delta * 0.2;
      } else {
        meshRef.current.rotation.y = 0; // Reset
      }
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(true);
    setHoveredLayer(layer);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    setHover(false);
    setHoveredLayer(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectLayer(layer);
  };

  // Dynamic Styles
  const opacity = isSelected ? 0.9 : 0.6;
  const metalness = 0.1;
  const roughness = 0.2;
  const activeColor = isSelected ? '#58A6FF' : (hovered ? '#79c0ff' : color);

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <meshPhysicalMaterial
          color={activeColor}
          transparent
          opacity={opacity}
          metalness={metalness}
          roughness={roughness}
          transmission={0.2} // Slight glass effect
          thickness={1}
        />
        <Edges
          scale={1.0}
          threshold={15} // Display edges only when the angle between faces exceeds this value
          color={isSelected ? "white" : "#30363D"}
        />
      </mesh>
    </group>
  );
};

export default LayerBox;