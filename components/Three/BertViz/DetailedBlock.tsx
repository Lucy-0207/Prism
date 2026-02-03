
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { Text, Edges } from '@react-three/drei';
import { useAppStore } from '../../../store';
import { LayerData } from '../../../types';
import { FFNStation } from './FFNStation';
import { AttentionStation } from './AttentionStation';

interface DetailedBlockProps {
  layer: LayerData;
  position: [number, number, number];
  index: number;
}

export const DetailedBlock: React.FC<DetailedBlockProps> = ({ layer, position, index }) => {
  const { selectedLayer, selectLayer, ablationMap, setAblationStatus } = useAppStore();
  const groupRef = useRef<Group>(null);
  
  const isSelected = selectedLayer?.id === layer.id;
  const ablationState = ablationMap.get(layer.id) || 'active';
  const isGhosted = (selectedLayer && !isSelected); 
  const isDisabled = ablationState === 'disabled';
  const isBypassed = ablationState === 'bypass';

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (isDisabled) return;
    selectLayer(isSelected ? null : layer);
  };

  const handleContextMenu = (e: any) => {
    e.stopPropagation();
    let nextState = 'active';
    if (ablationState === 'active') nextState = 'bypass';
    else if (ablationState === 'bypass') nextState = 'disabled';
    else nextState = 'active';
    setAblationStatus(layer.id, nextState as any);
  };

  useFrame(() => {
    if (groupRef.current) {
        groupRef.current.scale.lerp({ x: 1, y: 1, z: 1 } as any, 0.1);
    }
  });

  // --- Dynamic Styling based on Layer Type ---
  let blockColor = "#21262d";
  let edgeColor = "#58A6FF";
  
  if (layer.type === 'Convolution') {
      blockColor = "#1e293b"; // Slate for Conv
      edgeColor = "#38bdf8"; // Cyan
  } else if (layer.type === 'GenericBlock') {
      blockColor = "#3f3f46"; // Zinc for Generic
      edgeColor = "#a1a1aa";
  } else if (layer.type === 'TransformerBlock') {
      blockColor = "#21262d"; // Dark for Transformer
      edgeColor = "#58A6FF"; // Blue
  }

  // Ablation overrides
  let opacity = isGhosted ? 0.2 : 0.8;
  if (isDisabled) {
    blockColor = "#220000"; 
    edgeColor = "#550000";
    opacity = 0.5;
  } else if (isBypassed) {
    blockColor = "#21262d"; 
    opacity = 0.1;
    edgeColor = "#8b949e";
  }
  if (isGhosted) {
      blockColor = "#161b22";
      edgeColor = "#30363D";
  }

  // --- Internal Rendering Logic ---
  const renderInternals = () => {
    // 1. Specialized Transformer View
    if (layer.type === 'TransformerBlock') {
        return (
            <>
                <group position={[0, -1.5, 0]}> <AttentionStation /> </group>
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 1]} />
                    <meshBasicMaterial color="#30363D" />
                </mesh>
                <group position={[0, 1.5, 0]}> <FFNStation /> </group>
            </>
        );
    }

    // 2. Generic Sub-layers (from PDF/JSON)
    if (layer.sub_layers && layer.sub_layers.length > 0) {
        return (
            <group>
                {/* Connecting Line */}
                <mesh position={[0, 0, 0]}>
                     <cylinderGeometry args={[0.02, 0.02, layer.sub_layers.length * 1.5]} />
                     <meshBasicMaterial color="#30363D" />
                </mesh>
                
                {layer.sub_layers.map((sub, idx) => {
                    // Distribute vertically
                    const offset = (idx - (layer.sub_layers!.length - 1) / 2) * 1.5;
                    return (
                        <group key={sub.id} position={[0, offset, 0]}>
                             <mesh>
                                <boxGeometry args={[3.5, 0.8, 0.5]} />
                                <meshBasicMaterial color="#0d1117" transparent opacity={0.8} />
                                <Edges color="#a1a1aa" />
                            </mesh>
                            <Text position={[0, 0, 0.3]} fontSize={0.15} color="#e5e7eb">
                                {sub.name}
                            </Text>
                            <Text position={[0, -0.25, 0.3]} fontSize={0.1} color="#6b7280">
                                {sub.type}
                            </Text>
                        </group>
                    );
                })}
            </group>
        );
    }

    // 3. Default "Internal Processing" View (for simple blocks)
    return (
        <group>
             <mesh position={[0, 0, 0]}>
                 <boxGeometry args={[4, 3, 1]} />
                 <meshBasicMaterial color="#161b22" wireframe transparent opacity={0.3} />
             </mesh>
             
             {/* Animated Abstract Core */}
             <mesh rotation={[Math.PI/4, Math.PI/4, 0]}>
                 <octahedronGeometry args={[1, 0]} />
                 <meshBasicMaterial color={edgeColor} wireframe transparent opacity={0.2} />
             </mesh>
             
             <Text position={[0, -2, 0]} fontSize={0.2} color="#8b949e">
                Atomic Layer
             </Text>
        </group>
    );
  };

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* HUD */}
      {(isDisabled || isBypassed) && (
        <Text position={[0, 1.5, 0]} fontSize={0.2} color={isDisabled ? "#ff7b72" : "#8b949e"}>
            {isDisabled ? "⛔ DISABLED" : "↪ BYPASSED"}
        </Text>
      )}

      {/* EXPANDED VIEW (General Logic for ALL Types) */}
      {isSelected && !isDisabled && !isBypassed ? (
          <group>
              {/* Main Back Panel Frame */}
              <mesh position={[0, 0, -1]}>
                  <planeGeometry args={[8, 7]} />
                  <meshBasicMaterial color="#0d1117" transparent opacity={0.8} />
                  <Edges color="#30363D" />
              </mesh>
              
              {/* Layer Title */}
              <group position={[-3.5, 3.2, 0]}>
                  <Text fontSize={0.25} color="#8b949e" anchorX="left">
                      {layer.name}
                  </Text>
                  <Text position={[0, -0.3, 0]} fontSize={0.15} color="#30363D" anchorX="left">
                      ({layer.type})
                  </Text>
              </group>
              
              {/* Dynamic Internals */}
              {renderInternals()}
          </group>
      ) : (
          // --- COMPACT VIEW (Standard Block) ---
          <group visible={!isGhosted || isSelected || isDisabled || isBypassed}> 
            <mesh>
                <boxGeometry args={[4.5, 1.0, 2.5]} />
                <meshBasicMaterial 
                    color={blockColor} 
                    transparent 
                    opacity={opacity} 
                    wireframe={isGhosted || isBypassed}
                />
                <Edges color={edgeColor} />
            </mesh>
            
            {/* Visual indicator for different types */}
            {layer.type === 'Convolution' && (
                <group>
                   <mesh position={[-1.5, 0, 0.01]} rotation={[0,0,0]}>
                       <planeGeometry args={[0.5, 0.5]} />
                       <meshBasicMaterial color={edgeColor} transparent opacity={0.5} wireframe />
                   </mesh>
                   <mesh position={[-1.0, 0, 0.01]} rotation={[0,0,0]}>
                       <planeGeometry args={[0.5, 0.5]} />
                       <meshBasicMaterial color={edgeColor} transparent opacity={0.5} wireframe />
                   </mesh>
                </group>
            )}

            {isBypassed && (
                 <mesh rotation={[0,0,Math.PI/2]} position={[2.5, 0, 0]}>
                    <torusGeometry args={[1.5, 0.05, 16, 100, Math.PI]} />
                    <meshBasicMaterial color="#8b949e" />
                 </mesh>
            )}

            <Text 
                position={[0, 0, 1.3]} 
                fontSize={0.2} 
                color={isGhosted ? "#30363D" : "white"}
            >
                {layer.name}
            </Text>
            
            {isSelected && (
                <Text position={[0, -0.8, 1.3]} fontSize={0.15} color="#8b949e">
                    (Click to view details in Side Panel)
                </Text>
            )}
          </group>
      )}
    </group>
  );
};
