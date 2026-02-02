
import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store';
import { UserTier, ModelGraph } from '../../types';
import { generateModelFromQuery } from '../../services/geminiService';
import { uploadPdf } from '../../services/backendService';

export const LandingOverlay: React.FC = () => {
  const { setGraphData, setUserTier, userTier, graphData } = useAppStore();
  const [activeTab, setActiveTab] = useState<'search' | 'upload' | 'topic'>('search');
  const [searchQuery, setSearchQuery] = useState('bert-base-uncased');
  const [topicQuery, setTopicQuery] = useState('Self-Attention');
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [tempGraphData, setTempGraphData] = useState<ModelGraph | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If graph data is already loaded, don't show landing page
  if (graphData) return null;

  const handleStart = async () => {
    setLoading(true);
    setUploadStep('Initializing Gemini...');
    try {
      if (activeTab === 'upload' && tempGraphData) {
        setGraphData(tempGraphData);
      } else {
        // Dynamic Generation Mode
        const query = activeTab === 'topic' ? topicQuery : searchQuery;
        setUploadStep(`Analyzing ${query}...`);
        
        const data = await generateModelFromQuery(query);
        setGraphData(data);
      }
    } catch (e) {
      console.error(e);
      setUploadStep('Failed to generate. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);
      
      try {
        setUploadStep('Reading PDF...');
        
        // This now calls Gemini directly via backendService
        setUploadStep('Gemini 2.5 Flash is reading paper...');
        const data = await uploadPdf(file);
        
        setTempGraphData(data);
        setUploadStep('Analysis Complete. Ready.');

      } catch (err) {
        console.error("Upload failed", err);
        setUploadStep('Error processing PDF');
      } finally {
        setLoading(false);
      }
    }
  };

  const tiers: { id: UserTier; icon: string; label: string; desc: string }[] = [
    {
      id: 'tourist',
      icon: '🔭',
      label: '赛博游客 (Tourist)',
      desc: 'No math. Just analogies and visual logic.',
    },
    {
      id: 'apprentice',
      icon: '🛠️',
      label: '学术学徒 (Apprentice)',
      desc: 'Connect Code to Math. Show tensor shapes.',
    },
    {
      id: 'expert',
      icon: '⚗️',
      label: '炼丹专家 (Expert)',
      desc: 'Highlight novelty and SOTA differences only.',
    },
  ];

  const getTabClass = (tab: string) => `pb-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'text-prism-highlight border-b-2 border-prism-highlight' : 'text-slate-500 hover:text-slate-300'}`;

  return (
    <div className="absolute inset-0 z-50 bg-[#0E1116] flex flex-col items-center justify-center p-8 selection:bg-prism-highlight selection:text-white overflow-y-auto">
      
      {/* Brand */}
      <div className="mb-8 text-center animate-fade-in-up mt-12">
        <h1 className="font-serif text-5xl text-slate-100 tracking-tight mb-4">
          Prism
        </h1>
        <p className="font-sans text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
          Generative 3D Anatomy for Deep Learning Research
        </p>
      </div>

      <div className="w-full max-w-4xl bg-prism-panel/50 border border-prism-border rounded-2xl p-1 backdrop-blur-sm shadow-2xl animate-fade-in-up delay-100 mb-12">
        
        {/* Input Section */}
        <div className="p-8 border-b border-prism-border/50">
          <div className="flex gap-6 mb-6">
            <button onClick={() => setActiveTab('search')} className={getTabClass('search')}>Search Model</button>
            <button onClick={() => setActiveTab('upload')} className={getTabClass('upload')}>Upload PDF</button>
            <button onClick={() => setActiveTab('topic')} className={getTabClass('topic')}>Explore Topic</button>
          </div>

          <div className="relative min-h-[100px]">
             {/* MODE: SEARCH MODEL */}
             {activeTab === 'search' && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-500 group-focus-within:text-prism-highlight transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0E1116] border border-prism-border rounded-lg py-4 pl-12 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-prism-highlight focus:ring-1 focus:ring-prism-highlight transition-all font-mono"
                    placeholder="e.g. 'bert-base-uncased', 'llama-3-8b'"
                  />
                  <div className="mt-2 text-xs text-slate-500 flex gap-2">
                    <span>Popular:</span>
                    <button onClick={() => setSearchQuery('bert-base-uncased')} className="hover:text-prism-highlight underline">BERT</button>
                    <button onClick={() => setSearchQuery('gpt2-medium')} className="hover:text-prism-highlight underline">GPT-2</button>
                    <button onClick={() => setSearchQuery('resnet-50')} className="hover:text-prism-highlight underline">ResNet-50</button>
                  </div>
                </div>
             )}

             {/* MODE: UPLOAD PDF */}
             {activeTab === 'upload' && (
                <div 
                  className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-slate-500 bg-[#0E1116]/50 transition-colors ${tempGraphData ? 'border-prism-accent bg-prism-accent/5' : 'border-prism-border hover:border-prism-highlight/50 cursor-pointer'}`}
                  onClick={() => !tempGraphData && fileInputRef.current?.click()}
                >
                   {!tempGraphData ? (
                     <>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="font-mono text-sm">{loading ? uploadStep : "Click to Upload Paper (PDF)"}</p>
                     </>
                   ) : (
                     <div className="flex gap-8 items-center w-full">
                        <div className="flex-1 text-left">
                           <h3 className="text-prism-accent font-bold mb-1">Analysis Complete</h3>
                           <p className="text-sm text-slate-400 mb-2">Identified {tempGraphData.layers.length} layers from paper.</p>
                           <button onClick={() => { setTempGraphData(null); }} className="text-xs text-slate-500 hover:text-white underline">Reset</button>
                        </div>
                     </div>
                   )}
                </div>
             )}

             {/* MODE: EXPLORE TOPIC */}
             {activeTab === 'topic' && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-xl">💡</span>
                  </div>
                  <input 
                    type="text"
                    value={topicQuery}
                    onChange={(e) => setTopicQuery(e.target.value)}
                    className="w-full bg-[#0E1116] border border-prism-border rounded-lg py-4 pl-12 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-prism-gold focus:ring-1 focus:ring-prism-gold transition-all font-mono"
                    placeholder="e.g. 'Self-Attention', 'Diffusion Models', 'MoE'"
                  />
                  <div className="mt-2 text-xs text-slate-500 flex gap-2">
                    <span>Trending:</span>
                    <button onClick={() => setTopicQuery('Mixture of Experts')} className="hover:text-prism-gold underline">MoE</button>
                    <button onClick={() => setTopicQuery('Vision Transformers')} className="hover:text-prism-gold underline">ViT</button>
                    <button onClick={() => setTopicQuery('LoRA')} className="hover:text-prism-gold underline">LoRA</button>
                  </div>
                </div>
             )}
          </div>
        </div>

        {/* Persona Selector */}
        <div className="p-8">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 text-center">Select Your Persona</p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setUserTier(tier.id)}
                  className={`relative p-6 rounded-xl border transition-all text-left flex flex-col gap-3 group hover:-translate-y-1 ${
                    userTier === tier.id 
                      ? 'bg-prism-highlight/10 border-prism-highlight shadow-[0_0_20px_rgba(88,166,255,0.1)]' 
                      : 'bg-[#0E1116] border-prism-border hover:border-slate-500'
                  }`}
                >
                  <div className="text-3xl mb-1">{tier.icon}</div>
                  <div>
                    <h3 className={`font-serif text-lg font-bold mb-1 ${userTier === tier.id ? 'text-white' : 'text-slate-300'}`}>
                      {tier.label}
                    </h3>
                    <p className="font-sans text-xs text-slate-500 leading-relaxed group-hover:text-slate-400">
                      {tier.desc}
                    </p>
                  </div>
                  {userTier === tier.id && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-prism-highlight shadow-[0_0_10px_#58A6FF]"></div>
                  )}
                </button>
              ))}
           </div>
        </div>

        {/* Action */}
        <div className="p-8 pt-0 flex justify-center">
          <button 
            onClick={handleStart}
            disabled={loading || (activeTab === 'upload' && !tempGraphData)}
            className="bg-white text-black hover:bg-slate-200 font-bold py-4 px-12 rounded-full transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl"
          >
            {loading ? (
              <>
                 <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                 <span className="font-mono text-sm uppercase tracking-wider">{uploadStep || "Initializing..."}</span>
              </>
            ) : (
              <span className="font-mono text-sm uppercase tracking-wider">
                {activeTab === 'upload' ? "Confirm & Visualize" : "Launch Exploration"}
              </span>
            )}
          </button>
        </div>

      </div>
      
      {/* Footer */}
      <div className="text-slate-600 text-xs font-mono pb-8">
        POWERED BY GEMINI 2.5 FLASH &middot; THREE.JS &middot; REACT
      </div>
    </div>
  );
};
