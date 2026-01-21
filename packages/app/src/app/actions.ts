'use server';

import * as Ai from "@promethea/ai";
import type { TextToSpeechInput, TextToSpeechOutput, SpeechToTextInput, SpeechToTextOutput } from "@promethea/ai";

// The local type definition for the assistant input, as the flow is now external
type PrometheaAssistantInput = {
    query: string;
    constitutionContent: string;
};

// The local type definition for the assistant output
type PrometheaAssistantOutput = {
    response: string;
};


// --- AI Chat Actions ---

export async function askPrometheaAction(input: PrometheaAssistantInput): Promise<PrometheaAssistantOutput | { error: string }> {
    try {
        if (!input.constitutionContent) {
            return { error: "Constitution content is missing. Cannot proceed." };
        }

        // The AI service now runs on its own port, which we'll fetch from an environment variable.
        // For local development, we'll default to 4002 if not set.
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:4002';

        const response = await fetch(`${aiServiceUrl}/api/ask-promethea`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
            cache: 'no-store', // Ensure fresh responses
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || `AI service returned an error: ${response.statusText}`);
        }

        const result: PrometheaAssistantOutput = await response.json();

        if (!result?.response) {
            console.error("AI service returned an invalid response structure:", result);
            return { error: "Received an invalid response from the AI. Please try again." };
        }
        return result;

    } catch (error) {
        console.error("Error in askPrometheaAction: ", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `An error occurred while communicating with the AI: ${errorMessage}` };
    }
}

export async function textToSpeechAction(input: TextToSpeechInput): Promise<TextToSpeechOutput | { error: string }> {
    try {
        const response = await Ai.invokeTextToSpeech(input);
        if (!response?.audio) {
            console.error("textToSpeech returned an invalid response structure:", response);
            return { error: "Received an invalid audio response from the AI." };
        }
        return response;
    } catch (error) {
        console.error("Error in textToSpeechAction: ", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `An error occurred while generating audio: ${errorMessage}` };
    }
}

export async function speechToTextAction(input: SpeechToTextInput): Promise<SpeechToTextOutput | { error: string }> {
    try {
        const response = await Ai.invokeSpeechToText(input);
        if (!response || typeof response.text !== 'string') { // Check for presence and type of 'text'
            console.error("speechToText returned an invalid response structure:", response);
            return { error: "Failed to transcribe audio." };
        }
        return response;
    } catch (error) {
        console.error("Error in speechToTextAction: ", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `An error occurred during transcription: ${errorMessage}` };
    }
}

// Authentication actions have been moved to auth-helpers.ts
// They now call the Authentication Service (Body 2) instead of doing crypto operations here
