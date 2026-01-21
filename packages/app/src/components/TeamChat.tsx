'use client';

import { useState, useEffect, useRef } from 'react';

export interface TeamMessage {
    sender: 'user' | 'antigravity' | 'promethea' | string;
    timestamp: string;
    content: string;
    context?: {
        task?: string;
        intent?: string;
        priority?: 'normal' | 'urgent' | 'info';
    };
}

export function TeamChat() {
    const [messages, setMessages] = useState<TeamMessage[]>([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState<string[]>([
        '# Team Communication Log',
        '# All agents: User, Antigravity, Promethea',
        '# Topic: promethean-team-conversation',
        '---',
        'Initializing connection...',
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Load messages on mount
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response = await fetch('/api/team-chat');
                const data = await response.json();
                if (data.success && data.messages) {
                    setMessages(data.messages);
                    setTerminalOutput(prev => [
                        ...prev,
                        `[INFO] Loaded ${data.messages.length} message(s) from Pub/Sub`
                    ]);
                }
                setIsConnected(true);
            } catch (error) {
                console.error('Failed to load messages:', error);
                setTerminalOutput(prev => [...prev, `[ERROR] Failed to load messages: ${error}`]);
                setIsConnected(true); // Still allow sending
            }
        };

        loadMessages();

        // Poll for new messages every 5 seconds
        const interval = setInterval(async () => {
            try {
                const response = await fetch('/api/team-chat');
                const data = await response.json();
                if (data.success && data.messages && data.messages.length > 0) {
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.timestamp));
                        const newMessages = data.messages.filter((m: TeamMessage) => !existingIds.has(m.timestamp));
                        if (newMessages.length > 0) {
                            setTerminalOutput(t => [
                                ...t,
                                `[INFO] Received ${newMessages.length} new message(s)`
                            ]);
                            return [...prev, ...newMessages];
                        }
                        return prev;
                    });
                }
            } catch (error) {
                console.error('Failed to poll messages:', error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalOutput]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const message: TeamMessage = {
            sender: 'user',
            timestamp: new Date().toISOString(),
            content: input,
            context: {
                priority: 'normal',
            },
        };

        // Optimistically add to UI
        setMessages(prev => [...prev, message]);
        setTerminalOutput(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] user: ${input}`
        ]);
        setInput('');

        try {
            await fetch('/api/team-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message),
            });
        } catch (error) {
            setTerminalOutput(prev => [...prev, `[ERROR] Failed to send: ${error}`]);
        }
    };

    const getSenderColor = (sender: string) => {
        switch (sender) {
            case 'user':
                return 'text-blue-600 dark:text-blue-400';
            case 'antigravity':
                return 'text-purple-600 dark:text-purple-400';
            case 'promethea':
                return 'text-green-600 dark:text-green-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Team Conversation
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-4 p-4 overflow-hidden">
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Messages ({messages.length})</h2>
                    </div>
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 dark:text-gray-500 py-8">
                                No messages yet. Start the conversation!
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                                <div className="flex items-baseline gap-2">
                                    <span className={`font-semibold capitalize ${getSenderColor(msg.sender)}`}>
                                        {msg.sender}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-sm pl-4 border-l-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                    {msg.content}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message to the team..."
                            disabled={!isConnected}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!isConnected || !input.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            Send
                        </button>
                    </div>
                </div>

                <div className="w-96 flex flex-col bg-gray-950 rounded-lg border border-gray-800 shadow-sm font-mono text-sm">
                    <div className="border-b border-gray-800 px-4 py-3 bg-gray-900">
                        <h2 className="font-semibold text-green-400">System Terminal</h2>
                    </div>
                    <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 space-y-1 text-green-400">
                        {terminalOutput.map((line, idx) => (
                            <div key={idx} className="whitespace-pre-wrap break-words">
                                {line}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
