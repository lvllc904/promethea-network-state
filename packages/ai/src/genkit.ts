
import { GEMINI_API_KEY, GENKIT_ENV } from './config';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Import the new self-healing flow
import { selfHealingFlow } from './flows/self-healing';

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: GEMINI_API_KEY || '' }),
  ],
  // flows: [
  //   selfHealingFlow, // Registering flows is different in 1.0
  // ],
  // logLevel: 'debug',
  // enableTracingAndMetrics: true,
});

export default ai;
