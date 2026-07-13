'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Zap, CheckCircle, Clock } from 'lucide-react';
import { useSovereignData, executeSovereignMethod } from '@promethea/hooks';

interface SovereignCommandMatrixProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SovereignCommandMatrix: React.FC<SovereignCommandMatrixProps> = ({ isOpen, onClose }) => {
    const { data: methods } = useSovereignData<any[]>('/api/refineries');
    const [executing, setExecuting] = useState<string | null>(null);

    const handleExecute = async (methodId: string) => {
        setExecuting(methodId);
        try {
            await executeSovereignMethod(methodId);
            // Optionally show a toast here
        } catch (e) {
            console.error(e);
        } finally {
            setExecuting(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
                    exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    className="fixed inset-0 z-50 flex flex-col bg-black/80"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-8 border-b border-gray-800 bg-gray-950/50">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
                                <Terminal className="w-8 h-8 text-orange-500" />
                                Sovereign Method Catalog
                            </h2>
                            <p className="text-gray-500 uppercase tracking-widest text-xs mt-2 font-bold">
                                Direct Engine Control Protocol • {methods?.length || 0} Registered Operations
                            </p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-4 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Catalog Grid */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
                            {methods?.map((method: any) => (
                                <motion.div 
                                    key={method.methodId}
                                    whileHover={{ scale: 1.02 }}
                                    className="p-6 glass-panel rim-highlight-reality-ai rounded-lg flex flex-col justify-between group relative overflow-hidden"
                                >
                                    {/* Background glow effect on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-mono text-orange-400 uppercase font-black bg-orange-950/40 px-2 py-1 rounded">
                                                ID: {method.methodId}
                                            </span>
                                            {method.status === 'ACTIVE' ? (
                                                <CheckCircle className="w-4 h-4 text-amber-500" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-gray-600" />
                                            )}
                                        </div>
                                        <h3 className="text-lg font-black uppercase text-white mb-2 leading-tight">
                                            {method.name || method.methodId.replace(/_/g, ' ')}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-mono mb-6 line-clamp-2">
                                            {method.description || 'No operational description provided. System will execute default parameter set.'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-auto border-t border-gray-800 pt-4">
                                        <div className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">
                                            Executions: <span className="text-gray-300 font-mono">{method.executions || 0}</span>
                                        </div>
                                        <button
                                            onClick={() => handleExecute(method.methodId)}
                                            disabled={executing === method.methodId}
                                            className="px-6 py-2 bg-gray-800 hover:bg-orange-500 text-gray-300 hover:text-black text-[10px] font-black uppercase tracking-widest rounded transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {executing === method.methodId ? 'Executing...' : 'Trigger'}
                                            <Zap className="w-3 h-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            {!methods && (
                                <div className="col-span-full py-24 text-center text-gray-600 font-mono text-sm animate-pulse">
                                    [ FETCHING ENGINE TOPOLOGY... ]
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
