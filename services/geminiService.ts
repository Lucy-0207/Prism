
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResearchRoadmap, LayerData, ModelGraph, UserTier } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Schemas ---

const ROADMAP_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          year: { type: Type.INTEGER },
          type: { type: Type.STRING, enum: ['seminal', 'improvement', 'refutation', 'application'] },
          summary: { type: Type.STRING, description: "One sentence technical summary in Chinese" }
        },
        required: ["id", "title", "year", "type", "summary"]
      }
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING },
          target: { type: Type.STRING },
          relation: { type: Type.STRING, enum: ['inheritance', 'refutation', 'optimization', 'application'] },
          label: { type: Type.STRING }
        },
        required: ["source", "target", "relation", "label"]
      }
    }
  },
  required: ["topic", "nodes", "edges"]
};

// Recursive schema for Layers
const EXPLANATION_CARD_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    display_name: { type: Type.STRING },
    summary: { type: Type.STRING, description: "Analogy/Summary in Chinese" },
    technical: { type: Type.STRING, description: "Technical detail in Chinese with LaTeX" },
    paper_citation: { type: Type.STRING, description: "Direct excerpt from the paper in original language" }
  },
  required: ["summary", "technical", "paper_citation"]
};

const LAYER_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['Embedding', 'TransformerBlock', 'MultiHeadAttention', 'FFN', 'Output', 'LayerNorm', 'GenericBlock', 'Convolution', 'Pooling'] },
    input_shape: { type: Type.ARRAY, items: { type: Type.STRING } },
    output_shape: { type: Type.ARRAY, items: { type: Type.STRING } },
    description: { type: Type.STRING },
    explanation_card: EXPLANATION_CARD_SCHEMA,
    params: { type: Type.STRING },
    sub_layers: { 
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                explanation_card: EXPLANATION_CARD_SCHEMA
            }
        }
    }
  },
  required: ["id", "name", "type", "description", "explanation_card"]
};

const MODEL_GRAPH_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    model_name: { type: Type.STRING },
    total_params: { type: Type.STRING },
    mode: { type: Type.STRING, enum: ['standard', 'custom_diagram'] },
    topics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 core research keywords (e.g. 'Weakly Supervised', 'Attention')" },
    layers: {
      type: Type.ARRAY,
      items: LAYER_SCHEMA
    }
  },
  required: ["model_name", "total_params", "mode", "layers", "topics"]
};


// --- API Functions ---

export const fetchEvolutionRoadmap = async (topic: string): Promise<ResearchRoadmap> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a rigorous Academic Historian specializing in AI.
        Map the technical evolution of: "${topic}".
        
        Rules:
        1. Start with the seminal paper that introduced or heavily influenced this topic.
        2. Identify 3-4 key follow-up papers.
        3. Define relationships: 'inheritance' (green), 'refutation' (red), 'optimization' (blue).
        4. Summaries must be in academic Chinese.
        
        The result should be a graph starting around 2012-2015 up to 2025.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: ROADMAP_SCHEMA,
        temperature: 0.3,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ResearchRoadmap;
    }
    throw new Error("No data returned from Gemini");
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Generates a full 3D-ready ModelGraph from a simple text query (e.g., "Llama 3").
 */
export const generateModelFromQuery = async (query: string): Promise<ModelGraph> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Generate a structural visualization JSON for the Deep Learning model: "${query}".
        
        CRITICAL RULES FOR "PRISM" RENDERER:
        1. **Mode**: Always use 'standard'.
        2. **Topics**: Identify the core technical field (e.g. "Computer Vision", "LLM", "RL").
        3. **Layers**:
           - If Transformer: Use 'TransformerBlock'.
           - If CNN: Use 'Convolution', 'Pooling', 'GenericBlock'.
           - If RNN/Other: Use 'GenericBlock'.
        4. **Structure**: Input -> Embedding/Backbone -> Core Blocks (Stack) -> Head/Output.
        5. **Citations**: Populate 'explanation_card.paper_citation' with likely excerpts.
        6. **Language**: Chinese for descriptions.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: MODEL_GRAPH_SCHEMA,
        temperature: 0.2,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ModelGraph;
    }
    throw new Error("Empty response");
  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Generates a ModelGraph by analyzing a PDF (passed as base64 string).
 */
export const generateModelFromPDF = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<ModelGraph> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            },
            {
                text: `
                You are Prism, an AI Architecture Visualization engine.
                Analyze this research paper PDF.
                
                Goal 1: **Extract Keywords for Evolution Tree**
                - Identify 3-5 specific technical topics (e.g. "Weakly Supervised Learning", "Video Forgery Detection", "Vision Transformer").
                - Put these in the 'topics' field.
                
                Goal 2: **Generate 3D Visualization Structure**
                - Ignore the visual diagrams in the PDF, focus on the ARCHITECTURE described in the text/method section.
                - Force 'mode': 'standard'.
                - Map the model components to a sequential list of Layers.
                - Use 'TransformerBlock' if it's a transformer.
                - Use 'Convolution' if it's a CNN layer.
                - Use 'GenericBlock' for specific modules (e.g. "FeatureExtractor", "TemporalAggregator").
                - Name the layers with their specific names from the paper (e.g. "RGB Stream", "Noise Stream", "Cross-Attention").
                
                Goal 3: **Deep Understanding**
                - Fill 'explanation_card' with specific Chinese explanations and DIRECT QUOTES from the paper for 'paper_citation'.
                `
            }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: MODEL_GRAPH_SCHEMA,
            temperature: 0.1
        }
    });

    if (response.text) {
        return JSON.parse(response.text) as ModelGraph;
    }
    throw new Error("Empty response from PDF analysis");
  } catch (e) {
      console.error(e);
      throw e;
  }
};

// Kept for backward compatibility
export const enrichModelWithPaper = async (modelGraph: ModelGraph, paperText: string, tier: UserTier = 'apprentice'): Promise<ModelGraph> => {
  const simplifiedStructure = modelGraph.layers.map(l => ({
    id: l.id,
    type: l.type,
    sub_layers: l.sub_layers?.map(sl => ({ id: sl.id, type: sl.type }))
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        User Persona: ${tier}.
        Context: ${paperText.substring(0, 3000)}...
        Structure: ${JSON.stringify(simplifiedStructure)}
        Task: Update 'explanation_card' with new context.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                enriched_layers: {
                    type: Type.ARRAY,
                    items: LAYER_SCHEMA 
                }
            }
        }, 
        temperature: 0.2,
      },
    });

    if (response.text) {
      const enrichedData = JSON.parse(response.text);
      const newLayers = modelGraph.layers.map(layer => {
        const update = enrichedData.enriched_layers?.find((el: any) => el.id === layer.id);
        if (update) {
            return {
                ...layer,
                description: update.description || layer.description,
                explanation_card: update.explanation_card,
                sub_layers: layer.sub_layers?.map(sl => {
                    const subUpdate = update.sub_layers?.find((s:any) => s.id === sl.id);
                    return subUpdate ? { ...sl, explanation_card: subUpdate.explanation_card } : sl;
                })
            };
        }
        return layer;
      });
      return { ...modelGraph, layers: newLayers };
    }
    return modelGraph;
  } catch (error) {
    console.error("Enrichment Error:", error);
    return modelGraph; 
  }
};
