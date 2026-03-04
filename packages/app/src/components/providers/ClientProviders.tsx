'use client';

import { FirebaseClientProvider, firebaseApp, firestore, auth } from '@promethea/firebase';
import { Toaster } from "@promethea/ui";
import { AIAssistant } from "@/components/ai/AIAssistant";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
            {children}
            <AIAssistant />
            <Toaster />
        </FirebaseClientProvider>
    );
}
