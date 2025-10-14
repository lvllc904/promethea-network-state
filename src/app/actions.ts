'use server';

import { askPromethea, type PrometheaAssistantInput } from "@/ai/flows/promethea-assistant";

export async function askPrometheaAction(input: PrometheaAssistantInput) {
    try {
        const response = await askPromethea(input);
        return response;
    } catch (error) {
        console.error("Error in askPrometheaAction: ", error);
        // Return a structured error response that the client can handle
        return { error: "An error occurred while communicating with the AI. Please try again." };
    }
}
