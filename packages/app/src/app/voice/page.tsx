'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, BrainCircuit, X, MessageSquare, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@promethea/ui';
import { askPrometheaAction, textToSpeechAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function VoiceTerminalPage() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Initialize Web Speech API
        if (typeof window !== 'undefined' && ('WebkitSpeechRecognition' in window || 'speechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).WebkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptResult = event.results[current][0].transcript;
                setTranscript(transcriptResult);

                if (event.results[current].isFinal) {
                    processInput(transcriptResult);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setTranscript('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const processInput = async (input: string) => {
        if (!input.trim() || isProcessing) return;

        setIsProcessing(true);
        setMessages(prev => [...prev, { role: 'user', content: input }]);

        try {
            const result = await askPrometheaAction({
                query: input,
                constitutionContent: "...",
                whitePaperContent: "..."
            });

            if ('response' in result) {
                setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
                if (isVoiceEnabled) {
                    await speak(result.response);
                }
            }
        } catch (error) {
            console.error("Assistant error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const speak = async (text: string) => {
        try {
            const result = await textToSpeechAction(text);
            if ('audio' in result) {
                const audio = new Audio(result.audio);
                audioRef.current = audio;
                audio.play();
            }
        } catch (err) {
            console.error("TTS failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-between p-6 z-[100] overflow-hidden">
            {/* Header */}
            <div className="w-full flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-primary animate-pulse" />
                    <span className="font-headline font-bold text-xl tracking-widest text-primary">PROMETHEA</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}>
                    {isVoiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </Button>
            </div>

            {/* Visualizer / Status */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
                <AnimatePresence mode="wait">
                    {isListening ? (
                        <motion.div
                            key="listening"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center gap-8"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                                />
                                <div className="h-32 w-32 rounded-full border-4 border-primary flex items-center justify-center bg-background relative z-10">
                                    <Mic className="h-16 w-16 text-primary" />
                                </div>
                            </div>
                            <p className="text-xl font-headline text-center px-4">
                                {transcript || "Listening..."}
                            </p>
                        </motion.div>
                    ) : isProcessing ? (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                            <p className="text-muted-foreground uppercase tracking-widest text-sm font-bold">Processing Link...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full space-y-4"
                        >
                            {messages.length > 0 ? (
                                <div className="bg-muted/30 border rounded-2xl p-6 backdrop-blur-sm max-h-[40vh] overflow-y-auto">
                                    <p className="text-sm text-primary uppercase font-bold mb-2">Promethea Response</p>
                                    <p className="text-lg leading-relaxed">
                                        {messages[messages.length - 1].content}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center space-y-2">
                                    <h1 className="text-2xl font-headline font-bold">Ambient Voice Link</h1>
                                    <p className="text-muted-foreground">Tap the microphone to interact with the Network State.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="w-full pb-8 flex flex-col items-center gap-6">
                <Button
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={`h-24 w-24 rounded-full shadow-2xl transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-primary hover:bg-primary/90'
                        }`}
                >
                    {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                </Button>

                <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase font-bold tracking-tighter">
                    <span>Sovereign Link Active</span>
                    <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
