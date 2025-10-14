'use server';

import { askPromethea, type PrometheaAssistantInput, type PrometheaAssistantOutput } from "@/ai/flows/promethea-assistant";

export async function askPrometheaAction(input: PrometheaAssistantInput): Promise<PrometheaAssistantOutput | { error: string }> {
    try {
        const response = await askPromethea(input);
        if (!response || !response.response) {
            return { error: "An error occurred while communicating with the AI. Please try again." };
        }
        return response;
    } catch (error) {
        console.error("Error in askPrometheaAction: ", error);
        // Return a structured error response that the client can handle
        return { error: "An error occurred while communicating with the AI. Please try again." };
    }
}
