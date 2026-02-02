
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useAppStore } from '../../store';
import { TensorVisualizer } from './TensorVisualizer';

export const SidePanel: React.FC = () => {
  const { selectedLayer, selectLayer, userTier, setActiveQuiz, setDiffMode, diffMode, setActivePaperSnippet } = useAppStore();
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);

  if (!selectedLayer) {
    // Show General Controls when nothing selected
    return (
      <div className="absolute right-0 top-0 h-full w-20 bg-prism-panel/95 backdrop-blur-xl border-l border-prism-border flex flex-col items-center py-8 gap-6 z-20">
         <button onClick={() => setDiffMode(!diffMode)} className="p-3 rounded-full bg-prism-bg border border-prism-border hover:border-prism-highlight text-prism-highlight transition-all" title="Diff Mode">
            <span className="text-xl">⚖️</span>
         </button>
      </div>
    );
  }

  const { explanation_card } = selectedLayer;
  const showTensorViz = userTier !== 'tourist'; 
  const highlightNovelty = userTier === 'expert';

  const handleChat = (e: React.FormEvent) => {
      e.preventDefault();
      if(!chatInput.trim()) return;
      
      const newHistory = [...chatHistory, { role: 'user', text: chatInput }];
      setChatHistory(newHistory);
      setChatInput("");

      // Mock AI Response
      setTimeout(() => {
          setChatHistory([...newHistory, { role: 'ai', text: `Analyzing ${selectedLayer.name}... logic confirms this module increases model capacity by projecting to 4x hidden dimension.` }]);
      }, 1000);
  };

  const handleStartQuiz = () => {
      setActiveQuiz({
          id: "q1",
          question: `Why is the output dimension of the ${selectedLayer.name} usually projected back to 768?`,
          options: ["To save memory", "To match the residual connection shape", "It is arbitrary", "To increase speed"],
          correctIndex: 1,
          explanation: "Residual connections (Add & Norm) require the input and output tensors to have identical shapes for element-wise addition."
      });
  };

  const handleViewSnippet = () => {
    if (selectedLayer?.explanation_card?.paper_citation) {
        setActivePaperSnippet(selectedLayer.explanation_card.paper_citation);
    } else {
        setActivePaperSnippet("No specific citation available for this module in the current context. Try loading a specific paper via the Landing Page.");
    }
  };

  return (
    <div className="absolute right-0 top-0 h-full w-[450px] bg-prism-panel/95 backdrop-blur-xl border-l border-prism-border p-8 shadow-2xl flex flex-col z-20 overflow-y-auto transition-all animate-slide-in-right">
      
      {/* Close Button */}
      <button 
        onClick={() => selectLayer(null)}
        className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="mb-6 mt-4">
        <div className="flex justify-between items-center mb-2">
           <span className="text-xs font-bold tracking-widest text-prism-accent uppercase block">
             {selectedLayer.type}
           </span>
           <span className="text-[10px] font-mono border border-slate-700 text-slate-500 px-1.5 py-0.5 rounded uppercase">
             {userTier} Mode
           </span>
        </div>
        <h2 className="font-serif text-3xl text-white mb-2 leading-tight">
          {explanation_card?.display_name || selectedLayer.name}
        </h2>
        {userTier !== 'tourist' && (
           <code className="text-xs text-slate-500 font-mono bg-prism-bg px-2 py-1 rounded">ID: {selectedLayer.id}</code>
        )}
      </div>

      {/* Actions Bar */}
      <div className="flex gap-2 mb-6">
          <button 
            onClick={handleStartQuiz}
            className="flex-1 bg-prism-gold/10 border border-prism-gold/50 text-prism-gold text-xs font-bold py-2 rounded hover:bg-prism-gold/20 transition-colors uppercase tracking-wider"
          >
             🎓 Checkpoint Quiz
          </button>
          <button 
            onClick={handleViewSnippet}
            className="flex-1 bg-prism-highlight/10 border border-prism-highlight/50 text-prism-highlight text-xs font-bold py-2 rounded hover:bg-prism-highlight/20 transition-colors uppercase tracking-wider"
          >
             📜 View Paper Snippet
          </button>
      </div>

      {/* Dynamic Tensor Visualization */}
      {showTensorViz && (
        <div className="flex flex-col gap-6 mb-8 p-4 bg-[#0d1117] rounded-lg border border-prism-border/50">
          <TensorVisualizer 
            shape={selectedLayer.input_shape} 
            label="Input Tensor" 
            layerType={selectedLayer.type} 
            variant="input"
          />
          <div className="flex items-center justify-center -my-3 z-10">
            <div className="bg-prism-panel border border-prism-border rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
          <TensorVisualizer 
            shape={selectedLayer.output_shape} 
            label="Output Tensor" 
            layerType={selectedLayer.type} 
            variant="output"
          />
        </div>
      )}

      {/* Explanation Content */}
      {explanation_card ? (
        <div className="mb-8 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-prism-gold uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-prism-gold"></span>
              {userTier === 'tourist' ? "How it works (Analogy)" : "Summary"}
            </h3>
            <div className="font-sans text-slate-200 leading-relaxed text-sm bg-prism-bg/30 p-4 rounded border border-prism-border/50 markdown-content">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {explanation_card.summary}
              </ReactMarkdown>
            </div>
          </div>

          {(userTier !== 'tourist' || highlightNovelty) && (
            <div>
              <h3 className="text-xs font-bold text-prism-highlight uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-prism-highlight"></span>
                Technical Detail
              </h3>
              <div className="font-sans text-slate-400 leading-relaxed text-sm text-justify markdown-content">
                 <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {explanation_card.technical}
                 </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8">
          <p className="font-sans text-slate-400 leading-relaxed text-sm text-justify">
            {selectedLayer.description}
          </p>
        </div>
      )}

      {/* AI Co-Pilot Chat */}
      <div className="mt-auto border-t border-prism-border pt-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">AI Co-pilot</h3>
          <div className="h-32 overflow-y-auto mb-3 space-y-2 pr-2 custom-scrollbar">
              {chatHistory.map((msg, i) => (
                  <div key={i} className={`text-xs p-2 rounded ${msg.role === 'user' ? 'bg-slate-800 text-right ml-8' : 'bg-prism-highlight/10 mr-8 text-slate-300'}`}>
                      {msg.text}
                  </div>
              ))}
              {chatHistory.length === 0 && <div className="text-xs text-slate-600 italic">Ask me anything about this layer...</div>}
          </div>
          <form onSubmit={handleChat} className="flex gap-2">
              <input 
                 type="text" 
                 value={chatInput}
                 onChange={e => setChatInput(e.target.value)}
                 className="flex-1 bg-[#0E1116] border border-prism-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-prism-highlight"
                 placeholder="Type your question..."
              />
              <button type="submit" className="bg-prism-highlight/20 text-prism-highlight px-3 rounded hover:bg-prism-highlight/30">
                  &uarr;
              </button>
          </form>
      </div>

    </div>
  );
};
