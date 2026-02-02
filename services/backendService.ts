
import { ModelGraph } from '../types';
import { generateModelFromPDF } from './geminiService';

/**
 * Reads a File object as a Base64 string.
 */
const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the Data URL prefix (e.g., "data:application/pdf;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

export const uploadPdf = async (file: File): Promise<ModelGraph> => {
  try {
      // 1. Convert File to Base64
      const base64Data = await readFileAsBase64(file);
      
      // 2. Send to Gemini for Multimodal Analysis
      console.log("Sending PDF to Gemini for analysis...");
      const graphData = await generateModelFromPDF(base64Data, file.type);
      
      return graphData;
  } catch (error) {
      console.error("PDF Processing failed:", error);
      throw error;
  }
};
