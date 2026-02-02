
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import { AblationResponse } from '../../types';

// Simple mock service function for the component
const fetchPrediction = async (nodeName: string): Promise<AblationResponse> => {
    // In production, this calls backend. Using mock for immediate UI feedback.
    await new Promise(r => setTimeout(r, 1000));
    return {
        performance_impact: "Accuracy drops by ~12% on GLUE benchmark.",
        theoretical_consequence: "Removing this block reduces the model's non-linear capacity, leading to underfitting on complex sentence structures."
    };
};

export const AblationHud: React.FC = () => {
  const { ablationMap } = useAppStore();
  const [prediction, setPrediction] = useState<AblationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastAblatedId, setLastAblatedId] = useState<string | null>(null);

  // Detect changes in ablation map
  useEffect(() => {
    // Find the most recently changed item that isn't 'active'
    let targetId = null;
    for (const [id, status] of ablationMap.entries()) {
        if (status !== 'active') targetId = id;
    }

    if (targetId && targetId !== lastAblatedId) {
        setLastAblatedId(targetId);
        setLoading(true);
        fetchPrediction(targetId).then(data => {
            setPrediction(data);
            setLoading(false);
        });
    } else if (!targetId) {
        setPrediction(null);
        setLastAblatedId(null);
    }
  }, [ablationMap]);

  if (!prediction && !loading) return null;

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 animate-fade-in-up">
       <div className="bg-prism-panel/95 backdrop-blur-xl border border-red-900/50 shadow-2xl rounded-lg p-6 max-w-lg relative overflow-hidden">
          {/* Warning Stripe */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse"></div>
          
          <div className="flex items-start gap-4">
             <div className="text-3xl">⚠️</div>
             <div className="flex-1">
                <h3 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-1">
                   Ablation Simulation
                </h3>
                {loading ? (
                    <div className="text-slate-400 text-sm font-mono animate-pulse">Running Inference Prediction...</div>
                ) : (
                    <>
                        <div className="text-white font-serif text-lg mb-2">
                           {prediction?.performance_impact}
                        </div>
                        <div className="text-slate-400 text-xs font-sans leading-relaxed border-l-2 border-slate-700 pl-3">
                           {prediction?.theoretical_consequence}
                        </div>
                    </>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};
