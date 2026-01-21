
/**
 * @fileOverview This file defines a Genkit flow for converting speech to text.
 *
 * - speechToText - A function that takes an audio data URI and returns the transcribed text.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The output type for the speechToText function.
 */

import ai from '../genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

const SpeechToTextInputSchema = z.object({
  audio: z.string().describe('The base64 encoded audio data URI to be transcribed.'),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  text: z.string().describe('The transcribed text from the audio.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

export async function invokeSpeechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  return await speechToTextFlow(input);
}

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async ({ audio }) => {
    const response = await ai.generate({
      model: googleAI.model('gemini-1.5-pro'),
      prompt: [
        { text: "Transcribe the following audio." },
        { media: { url: audio, contentType: 'audio/webm' } },
      ],
      config: {
        temperature: 0.1, // Lower temperature for more accurate transcription
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No text returned from transcription model');
    }

    return {
      text,
    };
  }
);
