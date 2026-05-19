'use client';


import { Toaster } from "@promethea/ui";
import { AIAssistant } from "@/components/ai/AIAssistant";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <AIAssistant />
            <Toaster />
        </>
    );
}
