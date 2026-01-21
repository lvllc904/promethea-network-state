
import { GoogleGenAI } from "@google/genai";
import { ImageSize } from "../types";

export const generateEcosystemImage = async (prompt: string, size: ImageSize): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `Create a futuristic, cybernetic visualization based on this description: ${prompt}. The style should be bioluminescent, dark-themed, and resemble a sophisticated neural network or Clojure code architecture. Detailed, 8k, digital art.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error: any) {
    console.error("Image generation failed:", error);
    if (error?.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_RESET");
    }
    throw error;
  }
};
