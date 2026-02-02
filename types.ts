
export type Shape = (string | number)[];

export type UserTier = 'tourist' | 'apprentice' | 'expert';

export interface ExplanationCard {
  display_name?: string; // e.g. "Pre-RMSNorm"
  summary: string; // Analogy
  technical: string; // Technical detail
  paper_citation: string; // Quote
}

export interface LayerData {
  id: string;
  name: string; // Display name
  type: 'Embedding' | 'TransformerBlock' | 'MultiHeadAttention' | 'FFN' | 'Output' | 'LayerNorm' | 'GenericBlock' | 'Convolution' | 'Pooling';
  input_shape: Shape;
  output_shape: Shape;
  description: string;
  explanation_card?: ExplanationCard; // New field for AI-enriched content
  sub_layers?: LayerData[]; // For nested structures like Encoder Blocks
  params?: string; // e.g. "110M"
  diagram_coordinates?: [number, number, number, number]; // [x, y, w, h] normalized 0-100
  diff_status?: 'unchanged' | 'added' | 'deleted' | 'modified'; // For Diff View
}

export interface BlueprintModule {
  id: string;
  name: string;
  type: string; // 'Backbone' | 'Head' | 'Loss' | 'Input' | 'Generic'
  box_2d: [number, number, number, number]; // [x, y, w, h] in % (0-100)
  description: string;
  depth_explanation?: string;
  next?: string[]; // IDs of connected modules
}

export interface ModelGraph {
  model_name: string;
  total_params: string;
  mode: 'standard' | 'custom_diagram'; // Discriminator for rendering mode
  layers: LayerData[]; // Used for standard mode
  topics?: string[]; // AI Extracted keywords for Research Roadmap
  blueprint?: BlueprintModule[]; // Used for custom diagram mode
  extracted_diagram_url?: string; // URL of the extracted architecture image
}

// 3D Visual Configuration Types
export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

// Evolution Galaxy Types
export interface RoadmapNode {
  id: string;
  title: string;
  year: number;
  type: 'seminal' | 'improvement' | 'refutation' | 'application';
  summary: string;
}

export interface RoadmapEdge {
  source: string;
  target: string;
  relation: 'inheritance' | 'refutation' | 'optimization' | 'application';
  label: string;
}

export interface ResearchRoadmap {
  topic: string;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

// --- NEW TYPES FOR PHASE 3 ---

export type AblationType = 'active' | 'bypass' | 'disabled';

export interface AblationResponse {
  performance_impact: string;
  theoretical_consequence: string;
}

export interface AblationPrediction {
  nodeId: string;
  action: AblationType;
  performance_impact: string; // e.g. "Accuracy drops by 15%"
  theoretical_consequence: string; // e.g. "Gradient explosion likely"
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
