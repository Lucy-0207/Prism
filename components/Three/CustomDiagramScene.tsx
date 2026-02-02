
import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, DoubleSide } from 'three';
import { ModelGraph, BlueprintModule } from '../../types';
import GlassLayer from './GlassLayer';
import { ConnectionLine } from './ConnectionLine';
import { Text } from '@react-three/drei';

interface CustomDiagramSceneProps {
  data: ModelGraph;
}

const PLANE_WIDTH = 20;
const PLANE_DEPTH = 20;

// Fallback texture if none provided
const DEFAULT_TEXTURE_URL = "https://placehold.co/1024x1024/212529/58A6FF.png?text=Architecture+Diagram";

// Internal component to handle texture loading in isolation
const DiagramGround: React.FC<{ url: string }> = ({ url }) => {
  // Ensure we never pass an empty string to useLoader, which causes crashes
  const safeUrl = url && url.length > 5 ? url : DEFAULT_TEXTURE_URL;
  const texture = useLoader(TextureLoader, safeUrl);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[PLANE_WIDTH, PLANE_DEPTH]} />
      <meshBasicMaterial 
        map={texture} 
        side={DoubleSide} 
        transparent 
        opacity={0.8} 
        toneMapped={false}
      />
    </mesh>
  );
};

export const CustomDiagramScene: React.FC<CustomDiagramSceneProps> = ({ data }) => {
  const { extracted_diagram_url, blueprint } = data;

  // Helper to map 0-100% diagram coordinates to 3D world space
  const mapToWorld = (box: [number, number, number, number]) => {
    const [xPct, yPct, wPct, hPct] = box;
    
    // Map percentages to world units centered at (0,0)
    // X axis: left (0) to right (100)
    // Z axis: top (0) to bottom (100)
    
    const xWorld = (xPct / 100 - 0.5) * PLANE_WIDTH + (wPct / 100 * PLANE_WIDTH) / 2;
    const zWorld = (yPct / 100 - 0.5) * PLANE_DEPTH + (hPct / 100 * PLANE_DEPTH) / 2;
    
    const wWorld = (wPct / 100) * PLANE_WIDTH;
    const dWorld = (hPct / 100) * PLANE_DEPTH;
    
    // Extrusion height based on module importance/size
    const hWorld = Math.max(0.5, Math.min(wWorld, dWorld) * 0.8);

    return {
      pos: { x: xWorld, y: hWorld / 2, z: zWorld }, // Y is center of box, so half height
      dim: { width: wWorld, height: hWorld, depth: dWorld }
    };
  };

  const moduleMap = useMemo(() => {
     const map = new Map<string, {pos: any, dim: any}>();
     blueprint?.forEach(mod => {
        map.set(mod.id, mapToWorld(mod.box_2d));
     });
     return map;
  }, [blueprint]);

  if (!blueprint) return null;

  return (
    <group>
      {/* 1. The Ground Map (The extracted diagram) */}
      <DiagramGround url={extracted_diagram_url || ''} />
      <gridHelper args={[PLANE_WIDTH, 20, 0x30363D, 0x161B22]} position={[0, -0.04, 0]} />

      {/* 2. Pop-Up Modules */}
      {blueprint.map((mod) => {
        const { pos, dim } = mapToWorld(mod.box_2d);
        
        // Color coding by type
        let color = '#32cd32'; // Generic Green
        if (mod.type === 'Backbone') color = '#58A6FF'; // Blue
        if (mod.type === 'Loss') color = '#d73a49'; // Red
        if (mod.type === 'Head') color = '#D29922'; // Gold
        if (mod.type === 'Input') color = '#6e7681'; // Gray

        // Adapt to LayerData format expected by GlassLayer
        const layerData = {
          id: mod.id,
          name: mod.name,
          type: 'GenericBlock' as const, // Cast to allowed type
          input_shape: [],
          output_shape: [],
          description: mod.description,
          explanation_card: {
            summary: mod.description,
            technical: mod.depth_explanation || '',
            paper_citation: 'Extracted from PDF'
          }
        };

        return (
          <group key={mod.id}>
             <GlassLayer
                layer={layerData}
                position={pos}
                dimensions={dim}
                baseColor={color}
             />
             {/* Floating Label */}
             <Text
                position={[pos.x, pos.y + dim.height/2 + 0.5, pos.z]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
             >
                {mod.name}
             </Text>
          </group>
        );
      })}

      {/* 3. Connectivity Wires */}
      {blueprint.map((mod) => {
         if (!mod.next) return null;
         const startInfo = moduleMap.get(mod.id);
         if (!startInfo) return null;

         return mod.next.map(targetId => {
             const targetInfo = moduleMap.get(targetId);
             if (!targetInfo) return null;
             
             return (
               <ConnectionLine 
                 key={`${mod.id}-${targetId}`}
                 start={[startInfo.pos.x, startInfo.pos.y, startInfo.pos.z]} 
                 end={[targetInfo.pos.x, targetInfo.pos.y, targetInfo.pos.z]} 
               />
             );
         });
      })}
    </group>
  );
};
