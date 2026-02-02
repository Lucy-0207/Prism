
import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { fetchEvolutionRoadmap, enrichModelWithPaper } from '../../services/geminiService';

export const Header: React.FC = () => {
  const { setRoadmapData, graphData, setGraphData } = useAppStore();
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);

  const handleGenerateRoadmap = async () => {
    setLoadingRoadmap(true);
    try {
      // PRIORITY 1: Use AI-extracted topics from PDF if available
      let topic = graphData?.model_name || "Deep Learning";
      
      if (graphData?.topics && graphData.topics.length > 0) {
          // Use the most specific topic found
          topic = graphData.topics[0];
          console.log(`Generating roadmap for extracted topic: ${topic}`);
      }

      const data = await fetchEvolutionRoadmap(topic);
      setRoadmapData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleSemanticMap = async () => {
    if (!graphData) return;
    setLoadingMap(true);
    try {
      const enrichedData = await enrichModelWithPaper(
          graphData, 
          `Refine the explanations for ${graphData.model_name}. Ensure citations are accurate.`,
          'expert' 
      );
      setGraphData(enrichedData);

    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMap(false);
    }
  };

  return (
    <header className="absolute top-0 left-0 w-full p-6 z-10 select-none flex justify-between items-start pointer-events-none">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl text-slate-100 tracking-tight">Prism <span className="text-prism-accent text-sm font-sans font-bold uppercase tracking-widest ml-2 align-middle border border-prism-accent/30 px-2 py-0.5 rounded-full bg-prism-accent/10">Beta</span></h1>
        <p className="font-sans text-sm text-slate-400 max-w-md">
          Deep Learning Model Architecture Visualizer &middot; {graphData?.model_name || "Loading..."}
        </p>
        
        {/* Topic Badge Indicator */}
        {graphData?.topics && graphData.topics.length > 0 && (
             <div className="flex gap-2 mt-1 pointer-events-auto">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Detected:</span>
                {graphData.topics.slice(0, 2).map(t => (
                    <span key={t} className="text-[10px] bg-slate-800 text-prism-highlight px-1 rounded border border-slate-700">
                        {t}
                    </span>
                ))}
             </div>
        )}
      </div>

      <div className="flex gap-3 pointer-events-auto">
        <button 
          onClick={handleSemanticMap}
          disabled={loadingMap || !graphData}
          className="bg-prism-panel/80 hover:bg-prism-gold/20 backdrop-blur border border-prism-border hover:border-prism-gold text-prism-text hover:text-white px-4 py-2 rounded flex items-center gap-2 transition-all"
        >
          {loadingMap ? (
             <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
           <span className="font-mono text-xs font-bold uppercase tracking-wider">
            Deep Enrich
          </span>
        </button>

        <button 
          onClick={handleGenerateRoadmap}
          disabled={loadingRoadmap}
          className="bg-prism-panel/80 hover:bg-prism-highlight/20 backdrop-blur border border-prism-border hover:border-prism-highlight text-prism-text hover:text-white px-4 py-2 rounded flex items-center gap-2 transition-all"
        >
          {loadingRoadmap ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          )}
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            Evolution Galaxy
          </span>
        </button>
      </div>
    </header>
  );
};
