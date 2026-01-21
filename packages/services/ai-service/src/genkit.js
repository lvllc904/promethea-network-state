import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
export var ai = genkit({
    plugins: [googleAI()]
});
