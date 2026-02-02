
import React, { useMemo, useState } from 'react';
import { useAppStore } from '../../store';
import { RoadmapNode } from '../../types';
import { generateModelFromQuery } from '../../services/geminiService';

export const RoadmapOverlay: React.FC = () => {
  const { roadmapData, setRoadmapData, setGraphData, userTier } = useAppStore();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [loadingNode, setLoadingNode] = useState<string | null>(null);

  // --- Layout Constants ---
  const MIN_YEAR = 2012;
  const MAX_YEAR = 2026;
  const TIMELINE_WIDTH = 2500; // Total scrolling width
  const HEIGHT = 600;

  // --- Layout Engine ---
  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number; isSeminal: boolean }>();
    
    // Handle null case inside the hook
    if (!roadmapData) return map;

    // Group by year to stack them vertically
    const yearBuckets: Record<number, RoadmapNode[]> = {};
    roadmapData.nodes.forEach(node => {
      if (!yearBuckets[node.year]) yearBuckets[node.year] = [];
      yearBuckets[node.year].push(node);
    });

    roadmapData.nodes.forEach(node => {
        // X Position: Linear based on year
        const xPct = (node.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR);
        const x = 100 + xPct * (TIMELINE_WIDTH - 200);

        // Y Position: Vertical spread based on index in bucket
        const bucket = yearBuckets[node.year];
        const idx = bucket.indexOf(node);
        // Center around height/2
        const offset = (idx - (bucket.length - 1) / 2) * 150; 
        const y = HEIGHT / 2 + offset;

        map.set(node.id, { x, y, isSeminal: node.type === 'seminal' });
    });
    return map;
  }, [roadmapData]);

  if (!roadmapData) return null;

  const handleNodeClick = async (node: RoadmapNode) => {
    if (loadingNode) return;
    setLoadingNode(node.id);
    
    try {
        // Generate the specific model structure using Gemini
        const modelData = await generateModelFromQuery(node.title);
        
        // Launch 3D
        setGraphData(modelData);
        setRoadmapData(null); // Close overlay
    } catch (e) {
        console.error("Failed to load node", e);
    } finally {
        setLoadingNode(null);
    }
  };

  // --- Helper: Draw Curves ---
  const generatePath = (start: {x: number, y: number}, end: {x: number, y: number}) => {
     const dist = end.x - start.x;
     const cp1 = { x: start.x + dist * 0.5, y: start.y };
     const cp2 = { x: end.x - dist * 0.5, y: end.y };
     return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
  };

  const getEdgeColor = (rel: string) => {
    switch(rel) {
        case 'refutation': return '#ff7b72'; // Red
        case 'optimization': return '#58A6FF'; // Blue
        case 'inheritance': return '#3fb950'; // Green
        case 'application': return '#a371f7'; // Purple
        default: return '#8b949e';
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#0E1116]/95 backdrop-blur-xl flex flex-col animate-fade-in overflow-hidden">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-start pointer-events-none">
         <div>
            <h2 className="font-serif text-3xl text-white mb-1">Evolution Galaxy</h2>
            <p className="font-mono text-xs text-prism-gold uppercase tracking-widest">
                TOPIC: {roadmapData.topic}
            </p>
         </div>
         <button 
            onClick={() => setRoadmapData(null)}
            className="pointer-events-auto text-slate-400 hover:text-white transition-colors"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
         </button>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar cursor-grab active:cursor-grabbing">
         <div style={{ width: TIMELINE_WIDTH, height: '100%' }} className="relative">
            
            {/* Background Grid/Stars */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, #30363D 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
            
            {/* Timeline Axis */}
            <div className="absolute bottom-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-prism-border to-transparent"></div>
            {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }).map((_, i) => {
                const year = MIN_YEAR + i;
                const left = 100 + (i / (MAX_YEAR - MIN_YEAR)) * (TIMELINE_WIDTH - 200);
                return (
                    <div key={year} className="absolute bottom-12 text-xs font-mono text-slate-600" style={{ left }}>
                        <div className="h-4 w-px bg-slate-700 mx-auto mb-2"></div>
                        {year}
                    </div>
                );
            })}

            {/* SVG Layer for Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
               <defs>
                 <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                   <polygon points="0 0, 10 3.5, 0 7" fill="#58A6FF" opacity="0.5" />
                 </marker>
               </defs>
               {roadmapData.edges.map((edge, i) => {
                   const start = nodePositions.get(edge.source);
                   const end = nodePositions.get(edge.target);
                   if (!start || !end) return null;
                   
                   const color = getEdgeColor(edge.relation);
                   const isHovered = hoveredNode === edge.source || hoveredNode === edge.target;

                   return (
                       <g key={i}>
                         <path 
                           d={generatePath(start, end)} 
                           fill="none" 
                           stroke={color} 
                           strokeWidth={isHovered ? 3 : 1.5}
                           strokeOpacity={isHovered ? 1 : 0.4}
                           className="transition-all duration-300"
                         />
                         {isHovered && (
                            <text x={(start.x+end.x)/2} y={(start.y+end.y)/2 - 10} fill={color} fontSize="10" textAnchor="middle" fontFamily="monospace">
                                {edge.label}
                            </text>
                         )}
                       </g>
                   );
               })}
            </svg>

            {/* Nodes */}
            {roadmapData.nodes.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;
                const isSeminal = node.type === 'seminal';
                const isHovered = hoveredNode === node.id;
                const isLoading = loadingNode === node.id;

                return (
                    <div 
                       key={node.id}
                       className="absolute flex flex-col items-center group cursor-pointer z-10"
                       style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
                       onMouseEnter={() => setHoveredNode(node.id)}
                       onMouseLeave={() => setHoveredNode(null)}
                       onClick={(e) => {
                           e.stopPropagation();
                           handleNodeClick(node);
                       }}
                    >
                       {/* The Node Circle */}
                       <div className={`
                          rounded-full border-2 transition-all duration-300 flex items-center justify-center relative
                          ${isSeminal ? 'w-16 h-16 border-prism-gold shadow-[0_0_30px_rgba(210,153,34,0.2)]' : 'w-8 h-8 border-prism-highlight bg-[#0E1116]'}
                          ${isHovered ? 'scale-125 bg-prism-highlight/20' : 'bg-[#0E1116]'}
                       `}>
                          {isSeminal && !isLoading && <span className="text-2xl">🌟</span>}
                          {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                       </div>

                       {/* Title Label */}
                       <div className={`mt-4 text-center w-48 transition-all ${isHovered || isSeminal ? 'opacity-100' : 'opacity-60'}`}>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{node.type}</div>
                          <h3 className={`font-serif leading-tight ${isSeminal ? 'text-lg text-white' : 'text-sm text-slate-300'}`}>
                             {node.title}
                          </h3>
                       </div>

                       {/* Tooltip Card (Only on Hover) */}
                       {isHovered && (
                           <div className="absolute top-20 w-64 bg-prism-panel border border-prism-border p-4 rounded shadow-2xl z-50 animate-fade-in-up">
                               <p className="font-sans text-xs text-slate-400 text-justify leading-relaxed">
                                  {node.summary}
                               </p>
                               <div className="mt-3 pt-3 border-t border-prism-border flex justify-end">
                                  <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNodeClick(node);
                                    }}
                                    className="text-[10px] text-prism-highlight font-bold uppercase cursor-pointer hover:underline flex items-center gap-1"
                                  >
                                    Generate 3D Model &rarr;
                                  </button>
                               </div>
                           </div>
                       )}
                    </div>
                );
            })}

         </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-8 right-8 flex gap-4 text-xs font-mono text-slate-500 bg-[#0E1116]/80 p-3 rounded border border-prism-border">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#3fb950]"></span> Inheritance</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ff7b72]"></span> Refutation</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#58A6FF]"></span> Optimization</div>
      </div>

    </div>
  );
};
