
import React, { useState } from 'react';
import { useAppStore } from '../../store';

export const QuizModal: React.FC = () => {
  const { activeQuiz, setActiveQuiz } = useAppStore();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!activeQuiz) return null;

  const handleOptionClick = (idx: number) => {
    setSelectedOption(idx);
    setShowResult(true);
  };

  const isCorrect = selectedOption === activeQuiz.correctIndex;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
       <div className="bg-prism-panel border border-prism-border rounded-xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-prism-gold text-xs font-bold uppercase tracking-widest">Understanding Checkpoint</h3>
             <button onClick={() => setActiveQuiz(null)} className="text-slate-500 hover:text-white">✕</button>
          </div>

          {/* Question */}
          <h2 className="text-xl font-serif text-white mb-6 leading-relaxed">
             {activeQuiz.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
             {activeQuiz.options.map((opt, idx) => {
                 let btnClass = "w-full text-left p-4 rounded border transition-all text-sm font-sans ";
                 if (showResult) {
                     if (idx === activeQuiz.correctIndex) btnClass += "bg-green-900/30 border-green-500 text-white";
                     else if (idx === selectedOption) btnClass += "bg-red-900/30 border-red-500 text-slate-300";
                     else btnClass += "bg-prism-bg border-prism-border text-slate-500 opacity-50";
                 } else {
                     btnClass += "bg-prism-bg border-prism-border hover:border-prism-highlight text-slate-300 hover:bg-prism-highlight/10";
                 }

                 return (
                     <button 
                        key={idx} 
                        onClick={() => !showResult && handleOptionClick(idx)}
                        className={btnClass}
                     >
                        <span className="font-mono text-xs mr-3 text-slate-500">{String.fromCharCode(65+idx)}.</span>
                        {opt}
                     </button>
                 );
             })}
          </div>

          {/* Explanation */}
          {showResult && (
              <div className={`p-4 rounded text-sm ${isCorrect ? 'bg-green-900/20 text-green-200' : 'bg-red-900/20 text-red-200'} animate-fade-in-up`}>
                 <p className="font-bold mb-1">{isCorrect ? "Correct!" : "Not quite."}</p>
                 <p className="opacity-80 leading-relaxed">{activeQuiz.explanation}</p>
                 <button 
                   onClick={() => setActiveQuiz(null)}
                   className="mt-3 text-xs underline opacity-60 hover:opacity-100"
                 >
                    Continue Exploration &rarr;
                 </button>
              </div>
          )}

       </div>
    </div>
  );
};
