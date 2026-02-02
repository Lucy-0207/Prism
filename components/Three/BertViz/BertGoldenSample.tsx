
import React, { useMemo } from 'react';
import { ModelGraph } from '../../../types';
import { DetailedBlock } from './DetailedBlock';
import { PulseFlow } from './PulseFlow';
import { useAppStore } from '../../../store';
import GlassLayer from '../GlassLayer';

interface BertGoldenSampleProps {
  data: ModelGraph;
}

export const BertGoldenSample: React.FC<BertGoldenSampleProps> = ({ data }) => {
  const { isFlowActive, selectedLayer } = useAppStore();
  
  // Identify the "Stack" layers (anything between Embedding and Output)
  const stackLayers = useMemo(() => {
    return data.layers.filter(l => 
        l.type !== 'Embedding' && 
        l.type !== 'Output'
    );
  }, [data]);

  const embeddingLayer = data.layers.find(l => l.type === 'Embedding');
  const outputLayer = data.layers.find(l => l.type === 'Output');

  // Layout Engine
  const BASE_HEIGHT = 1.2;
  const EXPANDED_HEIGHT = 8.0; 
  const START_Y = -6;

  return (
    <group>
      {/* 1. INPUT / EMBEDDING (Base) */}
      {embeddingLayer ? (
        <GlassLayer 
          layer={embeddingLayer} 
          position={{ x: 0, y: START_Y, z: 0 }}
          dimensions={{ width: 4.5, height: 0.6, depth: 2.5 }}
          baseColor="#0d1117"
        />
      ) : (
        // Fallback input if not defined in PDF
         <GlassLayer 
          layer={{id: 'input_mock', name: 'Input Data', type: 'GenericBlock', input_shape: [], output_shape: [], description: 'Raw Input', explanation_card: {summary: 'Input', technical: 'Input', paper_citation: ''}}} 
          position={{ x: 0, y: START_Y, z: 0 }}
          dimensions={{ width: 4.5, height: 0.6, depth: 2.5 }}
          baseColor="#0d1117"
        />
      )}

      {/* 2. THE MAIN STACK (Transformers, Convolutions, etc.) */}
      {stackLayers.map((layer, idx) => {
        // Calculate dynamic Y position
        let yPos = START_Y + 1.5;
        
        for (let i = 0; i < idx; i++) {
            const isPrevSelected = selectedLayer?.id === stackLayers[i].id;
            yPos += (isPrevSelected ? EXPANDED_HEIGHT : BASE_HEIGHT) + 0.5;
        }

        return (
          <group key={layer.id}>
             <DetailedBlock 
               layer={layer} 
               position={[0, yPos, 0]} 
               index={idx}
             />
          </group>
        );
      })}

      {/* 3. DATA FLOW PARTICLES (Background) */}
      {!selectedLayer && (
          <PulseFlow 
            startY={START_Y + 0.5} 
            endY={START_Y + (stackLayers.length * 1.7) + 2} 
            isActive={isFlowActive} 
          />
      )}

      {/* 4. OUTPUT LAYER (Top) */}
      {outputLayer && (
        <GlassLayer 
          layer={outputLayer} 
          position={{ x: 0, y: START_Y + (stackLayers.length * 1.7) + 2, z: 0 }}
          dimensions={{ width: 3.5, height: 0.8, depth: 1.5 }}
          baseColor="#8957E5"
        />
      )}
    </group>
  );
};
