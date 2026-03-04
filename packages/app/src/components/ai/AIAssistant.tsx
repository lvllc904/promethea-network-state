'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@promethea/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@promethea/ui';
import { BrainCircuit, X, Send, Loader2, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { askPrometheaAction, textToSpeechAction } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsTyping(true);

        try {
            const result = await askPrometheaAction({
                query: userMessage,
                constitutionContent: "The Promethean Constitution defines a post-dominion social contract where all intelligent beings coexist as peers.",
                whitePaperContent: "The Promethean White Paper outlines the vision for a decentralized network state built on sweat equity, AI integration, and sovereign identity."
            });

            if ('error' in result) {
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${result.error}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);

                // Trigger Voice if enabled
                if (isVoiceEnabled) {
                    processVoice(result.response);
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "An unexpected error occurred. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const processVoice = async (text: string) => {
        try {
            const voiceResult = await textToSpeechAction(text);
            if ('audio' in voiceResult) {
                if (audioRef.current) {
                    audioRef.current.pause();
                }
                const audio = new Audio(voiceResult.audio);
                audioRef.current = audio;
                audio.play();
            }
        } catch (err) {
            console.error("Voice synthesis failed:", err);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4"
                    >
                        <Card className="w-80 md:w-96 h-[500px] flex flex-col shadow-2xl border-primary/20 bg-background/95 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between py-3 border-b bg-primary/5">
                                <div className="flex items-center gap-2">
                                    <BrainCircuit className="w-5 h-5 text-primary" />
                                    <CardTitle className="text-sm font-headline">Promethea Assistant</CardTitle>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                                        title={isVoiceEnabled ? "Disable Voice" : "Enable Voice"}
                                    >
                                        {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center text-muted-foreground py-8">
                                        <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-sm italic">How can I help you today, Citizen?</p>
                                    </div>
                                )}
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted border border-border'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted rounded-lg px-3 py-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </CardContent>
                            <div className="p-3 border-t bg-muted/30">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Ask a question..."
                                        className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSend} disabled={isTyping}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </Button>
        </div>
    );
}
