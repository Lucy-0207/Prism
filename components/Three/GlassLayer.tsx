import React, { useRef, useMemo } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { Mesh, Color } from 'three';
import { MeshTransmissionMaterial, Edges, Text } from '@react-three/drei';
import { LayerData, Dimensions, Position } from '../../types';
import { useAppStore } from '../../store';

interface GlassLayerProps {
  layer: LayerData;
  position: Position;
  dimensions: Dimensions;
  baseColor: string;
  isCrystal?: boolean; // For Attention heads
}

const GlassLayer: React.FC<GlassLayerProps> = ({ layer, position, dimensions, baseColor, isCrystal = false }) => {
  const meshRef = useRef<Mesh>(null);
  const { selectLayer, setHoveredLayer, selectedLayer, hoveredLayer } = useAppStore();

  const isSelected = selectedLayer?.id === layer.id;
  const isHovered = hoveredLayer?.id === layer.id;
  
  // Animation state
  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isSelected) {
        // Gentle float when selected
        meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      } else {
        // Return to base position
        meshRef.current.position.y = position.y;
      }
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredLayer(layer);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredLayer(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectLayer(layer);
  };

  // Visual Parameters based on state
  const transmission = isCrystal ? 0.95 : 0.8;
  const thickness = isCrystal ? 2.5 : 1.5;
  const roughness = isCrystal ? 0.05 : 0.15;
  const chromaticAberration = isSelected || isHovered ? 0.5 : 0.05;
  
  // Color logic: Active state makes it glow slightly cyan/white
  const targetColor = isSelected ? '#ffffff' : (isHovered ? '#bde0fe' : baseColor);
  
  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        
        {/* The "Scientific Glass" Material */}
        <MeshTransmissionMaterial
          backside
          samples={4} // Lower samples for performance, increase for quality
          thickness={thickness}
          roughness={roughness}
          chromaticAberration={chromaticAberration}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.3}
          temporalDistortion={0.1}
          color={targetColor}
          resolution={512}
        />

        {/* Crisp Edges for schematic feel */}
        <Edges
          scale={1.0}
          threshold={15}
          color={isSelected ? "#58A6FF" : (isHovered ? "white" : "#30363D")}
          renderOrder={1000}
        />
      </mesh>
      
      {/* Internal "Core" for Attention Heads to make them look distinct */}
      {isCrystal && (
         <mesh scale={[0.8, 0.8, 0.8]}>
           <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
           <meshBasicMaterial color={baseColor} wireframe transparent opacity={0.1} />
         </mesh>
      )}
    </group>
  );
};

export default GlassLayer;