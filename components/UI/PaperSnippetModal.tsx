
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '../../store';

export const PaperSnippetModal: React.FC = () => {
  const { activePaperSnippet, setActivePaperSnippet } = useAppStore();

  if (!activePaperSnippet) return null;

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" 
      onClick={() => setActivePaperSnippet(null)}
    >
       <div 
         className="bg-[#fcf8f2] text-slate-900 border border-[#e3dcd1] rounded-lg p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden transform transition-all" 
         onClick={e => e.stopPropagation()}
       >
          
          {/* Paper Header Styling */}
          <div className="border-b-2 border-[#e3dcd1] pb-4 mb-6 flex justify-between items-start">
             <div>
                <h3 className="font-serif text-2xl font-bold text-[#2c2925] uppercase tracking-tight">Source Excerpt</h3>
                <p className="font-mono text-xs text-[#8c857b] mt-1 tracking-wider">ORIGINAL PAPER CONTEXT</p>
             </div>
             <button 
               onClick={() => setActivePaperSnippet(null)} 
               className="text-[#8c857b] hover:text-red-500 text-2xl font-bold px-2 transition-colors"
             >
               &times;
             </button>
          </div>

          {/* Content - Serif font for "Paper" feel */}
          <div className="font-serif text-lg leading-relaxed text-[#2c2925] max-h-[60vh] overflow-y-auto pr-4">
             <div className="markdown-content">
                <style>{`
                  .markdown-content strong { color: #000; font-weight: 700; }
                  .markdown-content em { font-style: italic; color: #555; }
                `}</style>
                <ReactMarkdown>{activePaperSnippet}</ReactMarkdown>
             </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#e3dcd1] text-center flex justify-center items-center gap-2">
             <span className="text-xl">📜</span>
             <p className="font-sans text-xs text-[#8c857b] italic">
                Citation extracted via Prism RAG Engine
             </p>
          </div>

       </div>
    </div>
  );
};
