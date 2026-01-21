/**
 * @fileOverview Defines the core AI assistant for the Promethea Network State.
 * This flow is now designed to be called from an Express server.
 */
import { z } from 'zod';
declare const PrometheaAssistantInputSchema: z.ZodObject<{
    query: z.ZodString;
    constitutionContent: z.ZodString;
    whitePaperContent: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query?: string;
    constitutionContent?: string;
    whitePaperContent?: string;
}, {
    query?: string;
    constitutionContent?: string;
    whitePaperContent?: string;
}>;
export type PrometheaAssistantInput = z.infer<typeof PrometheaAssistantInputSchema>;
declare const PrometheaAssistantOutputSchema: z.ZodObject<{
    response: z.ZodString;
}, "strip", z.ZodTypeAny, {
    response?: string;
}, {
    response?: string;
}>;
export type PrometheaAssistantOutput = z.infer<typeof PrometheaAssistantOutputSchema>;
export declare const askPrometheaFlow: import("genkit").Action<z.ZodObject<{
    query: z.ZodString;
    constitutionContent: z.ZodString;
    whitePaperContent: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query?: string;
    constitutionContent?: string;
    whitePaperContent?: string;
}, {
    query?: string;
    constitutionContent?: string;
    whitePaperContent?: string;
}>, z.ZodObject<{
    response: z.ZodString;
}, "strip", z.ZodTypeAny, {
    response?: string;
}, {
    response?: string;
}>, z.ZodTypeAny>;
export {};
