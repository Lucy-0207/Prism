
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LayerData, ResearchRoadmap, ModelGraph, UserTier, AblationType, QuizQuestion } from './types';

interface AppState {
  graphData: ModelGraph | null;
  comparisonData: ModelGraph | null; // For Diff View (Right side)
  selectedLayer: LayerData | null;
  hoveredLayer: LayerData | null;
  isFlowActive: boolean;
  roadmapData: ResearchRoadmap | null;
  userTier: UserTier;
  
  // Phase 3 States
  ablationMap: Map<string, AblationType>;
  diffMode: boolean;
  activeQuiz: QuizQuestion | null;
  activePaperSnippet: string | null;

  setGraphData: (data: ModelGraph | null) => void;
  setComparisonData: (data: ModelGraph | null) => void;
  selectLayer: (layer: LayerData | null) => void;
  setHoveredLayer: (layer: LayerData | null) => void;
  setFlowActive: (active: boolean) => void;
  setRoadmapData: (data: ResearchRoadmap | null) => void;
  setUserTier: (tier: UserTier) => void;
  
  // Phase 3 Actions
  setAblationStatus: (id: string, status: AblationType) => void;
  setDiffMode: (active: boolean) => void;
  setActiveQuiz: (quiz: QuizQuestion | null) => void;
  setActivePaperSnippet: (snippet: string | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [graphData, setGraphData] = useState<ModelGraph | null>(null);
  const [comparisonData, setComparisonData] = useState<ModelGraph | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<LayerData | null>(null);
  const [hoveredLayer, setHoveredLayerState] = useState<LayerData | null>(null);
  const [isFlowActive, setFlowActive] = useState<boolean>(true);
  const [roadmapData, setRoadmapData] = useState<ResearchRoadmap | null>(null);
  const [userTier, setUserTier] = useState<UserTier>('apprentice');
  
  const [ablationMap, setAblationMap] = useState<Map<string, AblationType>>(new Map());
  const [diffMode, setDiffMode] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion | null>(null);
  const [activePaperSnippet, setActivePaperSnippet] = useState<string | null>(null);

  const selectLayer = (layer: LayerData | null) => {
    setSelectedLayer(layer);
  };

  const setHoveredLayer = (layer: LayerData | null) => {
    setHoveredLayerState(layer);
  };

  const setAblationStatus = (id: string, status: AblationType) => {
    setAblationMap(prev => {
      const newMap = new Map(prev);
      newMap.set(id, status);
      return newMap;
    });
  };

  return React.createElement(
    AppContext.Provider,
    { value: { 
        graphData,
        comparisonData,
        selectedLayer, 
        hoveredLayer, 
        isFlowActive, 
        roadmapData,
        userTier,
        ablationMap,
        diffMode,
        activeQuiz,
        activePaperSnippet,
        setGraphData,
        setComparisonData,
        selectLayer, 
        setHoveredLayer, 
        setFlowActive,
        setRoadmapData,
        setUserTier,
        setAblationStatus,
        setDiffMode,
        setActiveQuiz,
        setActivePaperSnippet
      } 
    },
    children
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
