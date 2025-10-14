'use server';

import { askPromethea, type PrometheaAssistantInput, type PrometheaAssistantOutput } from "@/ai/flows/promethea-assistant";

export async function askPrometheaAction(input: PrometheaAssistantInput): Promise<PrometheaAssistantOutput | { error: string }> {
    try {
        if (!input.constitutionContent) {
            return { error: "Constitution content is missing. Cannot proceed." };
        }
        const response = await askPromethea(input);
        if (!response?.response) {
             console.error("askPromethea returned an invalid response structure:", response);
            return { error: "Received an invalid response from the AI. Please try again." };
        }
        return response;
    } catch (error) {
        console.error("Error in askPrometheaAction: ", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `An error occurred while communicating with the AI: ${errorMessage}` };
    }
}
