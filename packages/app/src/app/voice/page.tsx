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
    const [textInput, setTextInput] = useState('');
    const [showTextFallback, setShowTextFallback] = useState(false);
    const [isBrave, setIsBrave] = useState(false);

    useEffect(() => {
        // Detect Brave
        if (typeof navigator !== 'undefined' && (navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function') {
            (navigator as any).brave.isBrave().then((braveResult: boolean) => {
                setIsBrave(braveResult);
            });
        }

        // Initialize Web Speech API
        if (typeof window !== 'undefined' && ('WebkitSpeechRecognition' in window || 'speechRecognition' in window || (window as any).webkitSpeechRecognition)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).WebkitSpeechRecognition || (window as any).webkitSpeechRecognition;
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
                if (event.error === 'not-allowed') {
                  alert("Microphone access denied. Please allow it in browser settings.");
                } else if (event.error === 'network') {
                  console.warn("Speech recognition network error: Often caused by browser blocks or transient infrastructure issues.");
                  alert("Speech recognition network error. Please ensure you have enabled 'Google Services for Speech' in Brave settings or try refreshing the page.");
                }
            };
        } else {
            setShowTextFallback(true);
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            setShowTextFallback(true);
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

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim()) {
            processInput(textInput);
            setTextInput('');
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
                    <span className="font-headline font-bold text-xl tracking-widest text-primary uppercase">Promethea Link</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}>
                    {isVoiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </Button>
            </div>

            {/* Visualizer / Status */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg">
                <AnimatePresence mode="wait">
                    {isListening ? (
                        <motion.div
                            key="listening"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center gap-8 w-full"
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
                            <p className="text-xl font-headline text-center px-4 min-h-[3rem]">
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
                            className="w-full space-y-6"
                        >
                            {messages.length > 0 ? (
                                <div className="bg-muted/30 border border-primary/10 rounded-2xl p-6 backdrop-blur-sm shadow-2xl space-y-4 max-h-[50vh] overflow-y-auto">
                                  <div className="flex flex-col gap-4">
                                    {messages.slice(-2).map((msg, i) => (
                                      <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                                        <p className={`text-[10px] uppercase font-bold mb-1 ${msg.role === 'user' ? 'text-muted-foreground' : 'text-primary'}`}>
                                          {msg.role === 'user' ? 'Citizen' : 'Promethea'}
                                        </p>
                                        <p className={`text-lg leading-relaxed ${msg.role === 'user' ? 'text-muted-foreground italic' : 'text-white'}`}>
                                          {msg.content}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <h1 className="text-3xl font-headline font-bold uppercase tracking-tighter">Ambient Voice Link</h1>
                                    <p className="text-muted-foreground max-w-xs mx-auto">Tap the microphone to interact with the Network State.</p>
                                    {!recognitionRef.current && (
                                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
                                        <p className="text-xs text-amber-500 font-bold uppercase mb-1">Voice Not Available</p>
                                        <p className="text-xs text-amber-200/70">
                                          {isBrave 
                                            ? "Brave detected. To enable voice, go to Settings > Privacy & Security > Check 'Use Google Services for Speech' or use Chrome."
                                            : "Your browser doesn't support the Speech Recognition API. Text input is enabled below."}
                                        </p>
                                      </div>
                                    )}
                                </div>
                            )}

                            {(showTextFallback || !isListening) && (
                              <form onSubmit={handleTextSubmit} className="flex items-center gap-2 bg-black/40 p-2 rounded-full border border-white/10 ring-1 ring-white/5 shadow-inner">
                                <input 
                                  type="text"
                                  value={textInput}
                                  onChange={(e) => setTextInput(e.target.value)}
                                  placeholder="Type your query..."
                                  className="bg-transparent border-none focus:ring-0 text-white placeholder:text-zinc-600 px-4 flex-1 h-12"
                                />
                                <Button type="submit" size="icon" className="rounded-full h-12 w-12 shrink-0">
                                  <MessageSquare className="w-5 h-5" />
                                </Button>
                              </form>
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
