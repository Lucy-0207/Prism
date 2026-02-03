
import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Grid, CameraControls, Stars, Lightformer, Text } from '@react-three/drei';
import { CustomDiagramScene } from './CustomDiagramScene';
import { BertGoldenSample } from './BertViz/BertGoldenSample';
import { ModelGraph } from '../../types';
import { useAppStore } from '../../store';

interface SceneProps {
  data: ModelGraph | null;
}

const SceneContent: React.FC<{ data: ModelGraph }> = ({ data }) => {
  const cameraControlsRef = useRef<CameraControls>(null);
  const { selectedLayer, diffMode } = useAppStore();

  // Camera Focus Logic
  useEffect(() => {
    if (cameraControlsRef.current) {
      if (diffMode) {
         // Pull back for split view
         cameraControlsRef.current.setLookAt(0, 10, 36, 0, 8, 0, true);
      } else if (selectedLayer) {
        // Zoom in closer for the detailed view
        cameraControlsRef.current.dollyTo(8, true);
      } else {
        // Standard View: Center on the model stack
        // Updated: Since model base is now Y=0, stack goes up to Y~20. 
        // Look at Y=8 (approx mid-lower stack) to see base and structure.
        cameraControlsRef.current.setLookAt(18, 16, 18, 0, 8, 0, true);
      }
    }
  }, [selectedLayer, diffMode]);

  // --- RENDER LOGIC SWITCH ---
  
  // 1. PDF Extract Mode
  if (data.mode === 'custom_diagram') {
    return (
      <>
        <CameraControls ref={cameraControlsRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
        <ambientLight intensity={0.6} color="#ffffff" />
        <Environment preset="city" />
        <Stars radius={100} count={2000} fade />
        <CustomDiagramScene data={data} />
      </>
    );
  }

  // 2. Standard Mode (Golden Sample BERT Viz)
  return (
    <>
      <CameraControls ref={cameraControlsRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
      
      {/* Cinematic Lighting Setup */}
      <ambientLight intensity={0.4} color="#c9d1d9" />
      <pointLight position={[20, 10, 20]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-20, 5, -20]} intensity={0.8} color="#58A6FF" />
      <spotLight position={[0, 30, 0]} angle={0.3} penumbra={1} intensity={2} color="#ffffff" />

      {/* Procedural Studio Environment */}
      <Environment>
        <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
        <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 5, -6]} scale={[10, 10, 1]} />
        <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[10, 2, 1]} />
        <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[5, 1, -1]} scale={[10, 2, 1]} />
      </Environment>

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* RENDER LOGIC: DIFF MODE VS SINGLE MODE */}
      {diffMode ? (
         <group>
             {/* Left Model (Base) */}
             <group position={[-6, 0, 0]}>
                 <Text position={[0, 20, 0]} fontSize={0.5} color="white">Model A (Base)</Text>
                 <BertGoldenSample data={data} />
             </group>
             
             {/* Divider */}
             <mesh position={[0, 10, 0]}>
                 <cylinderGeometry args={[0.05, 0.05, 30]} />
                 <meshBasicMaterial color="#30363D" transparent opacity={0.5} />
             </mesh>

             {/* Right Model (Comparison) - MOCKING diff by using same model but offset */}
             <group position={[6, 0, 0]}>
                 <Text position={[0, 20, 0]} fontSize={0.5} color="#58A6FF">Model B (Target)</Text>
                 <BertGoldenSample data={data} /> {/* In real app, pass comparisonData */}
             </group>
         </group>
      ) : (
         <group position={[0, 0, 0]}>
            <BertGoldenSample data={data} />
         </group>
      )}

      {/* Floor */}
      <Grid 
        position={[0, -0.05, 0]} 
        args={[30, 30]} 
        cellColor="#21262d" 
        sectionColor="#30363D" 
        fadeDistance={25} 
        fadeStrength={1}
      />
    </>
  );
};

const Scene: React.FC<SceneProps> = ({ data }) => {
  if (!data) return null;
  return (
    <Canvas 
      camera={{ position: [18, 16, 18], fov: 40 }}
      dpr={[1, 2]} // Support high DPI
      gl={{ antialias: true, alpha: false, toneMappingExposure: 1.2 }}
    >
      <color attach="background" args={['#0E1116']} />
      <SceneContent data={data} />
    </Canvas>
  );
};

export default Scene;
