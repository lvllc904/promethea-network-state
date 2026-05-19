import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { sovereignAI } from './sovereign-ai';
import { GEMINI_API_KEY } from './config';

/**
 * Sovereign Genkit Configuration
 * 
 * This instance is the "Heart" of Promethea's Assistant logic.
 * It provides a fallback to Google AI but prioritizes the Sovereign Bridge.
 */
export const ai = genkit({
  plugins: [
    googleAI({ apiKey: GEMINI_API_KEY || '' }),
  ],
});

// Define the Sovereign Model in the Genkit Registry
// This allows us to use 'sovereignModel' in any flow.
export const sovereignModel = ai.defineModel(
  {
    name: 'sovereignModel',
    label: 'Sovereign Gemini 1.5 Pro (Vertex AI)',
  },
  async (input) => {
    const lastMessage = input.messages[input.messages.length - 1];
    const prompt = lastMessage.content[0]?.text || '';
    const responseText = await sovereignAI.generateContent('gemini-1.5-pro', prompt);
    
    return {
      message: {
        role: 'model',
        content: [{ text: responseText }],
      },
    };
  }
);

export default ai;
