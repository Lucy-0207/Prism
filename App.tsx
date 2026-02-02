
import React, { useEffect, useState } from 'react';
import { AppProvider, useAppStore } from './store';
import { ModelGraph } from './types';
import Scene from './components/Three/Scene';
import { Header } from './components/UI/Header';
import { SidePanel } from './components/UI/SidePanel';
import { Tooltip } from './components/UI/Tooltip';
import { RoadmapOverlay } from './components/UI/RoadmapOverlay';
import { LandingOverlay } from './components/UI/LandingOverlay';
import { AblationHud } from './components/UI/AblationHud';
import { QuizModal } from './components/UI/QuizModal';
import { PaperSnippetModal } from './components/UI/PaperSnippetModal';

const MainLayout = () => {
  const { graphData, userTier } = useAppStore();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-prism-bg text-prism-text selection:bg-prism-highlight selection:text-white">
      
      {/* The Landing Page controls the flow. It disappears once graphData is present. */}
      <LandingOverlay />

      <Header />
      <Tooltip />
      <RoadmapOverlay />
      
      {/* Phase 3 Overlays */}
      <AblationHud />
      <QuizModal />
      <PaperSnippetModal />
      
      <div className="absolute inset-0 z-0">
        <Scene data={graphData} />
      </div>
      
      <SidePanel />

      {/* Bottom Status Bar - Only show when active */}
      {graphData && (
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-prism-border bg-prism-bg/80 backdrop-blur-sm z-10 pointer-events-none flex justify-between items-center text-xs text-slate-500 font-mono animate-fade-in">
          <div>MODE: INTERACTIVE VISUALIZATION ({userTier.toUpperCase()})</div>
          <div>MODEL: {graphData.model_name.toUpperCase()} ({graphData.total_params})</div>
          <div>RENDERER: THREE.JS r160 &middot; RAG ENGINE: ACTIVE</div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
