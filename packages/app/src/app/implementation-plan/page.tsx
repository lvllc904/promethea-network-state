import React from 'react';
import fs from 'fs';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const metadata = {
    title: 'Sovereign Implementation Plan | Promethean Network State',
    description: 'Detailed deployment plan for the Decentralized Workspace Platform & Distributed Mesh Compute Grid.',
};

export default function ImplementationPlanPage() {
    const pathsToTry = [
        '/Users/officeone/Promethean Network State/promethea_antigravity_bundle_20251130_211450/packages/app/public/documents/implementation_plan.md',
        './packages/app/public/documents/implementation_plan.md',
        './public/documents/implementation_plan.md',
        '/Users/officeone/.gemini/antigravity/brain/216b44a6-f01c-4890-a1e5-9ba42c9137bb/implementation_plan.md',
    ];
    
    let markdownContent = '';
    let found = false;
    for (const p of pathsToTry) {
        try {
            if (fs.existsSync(p)) {
                markdownContent = fs.readFileSync(p, 'utf8');
                found = true;
                break;
            }
        } catch (err) {
            // keep searching
        }
    }

    if (!found) {
        markdownContent = `# Implementation Plan Not Found\n\nCould not locate the implementation plan in any of the registered substrate paths. Please verify node deployment.`;
    }

    return (
        <div className="bg-background text-foreground min-h-screen selection:bg-amber-500/30 font-sans transition-colors duration-300 relative overflow-hidden">
            {/* Subtle premium background glow */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Top Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 border-b border-foreground/5 dark:border-white/5 bg-background/20 backdrop-blur-md transition-colors duration-300">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                    <ArrowLeft className="w-4 h-4 text-amber-500 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-headline font-black tracking-[0.2em] text-xs text-foreground dark:text-white transition-colors duration-300">BACK TO COCKPIT</span>
                </Link>
                <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                    <Cpu className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Node-01 Active</span>
                </div>
            </header>

            <div className="relative z-10 w-full pt-40 pb-32 px-8 md:px-16 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md mb-8">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest">Sovereign Deployment Plan</span>
                </div>
                
                {/* Render the markdown document beautifully inside modern prose container */}
                <article className="prose dark:prose-invert max-w-none 
                    prose-headings:text-foreground dark:prose-headings:text-white prose-headings:font-headline prose-headings:font-black prose-headings:tracking-tight
                    prose-h1:text-3xl prose-h1:md:text-5xl prose-h1:border-b prose-h1:border-foreground/10 dark:prose-h1:border-white/10 prose-h1:pb-4 prose-h1:mb-8
                    prose-h2:text-2xl prose-h2:border-b prose-h2:border-foreground/5 dark:prose-h2:border-white/5 prose-h2:pb-2 prose-h2:mt-12
                    prose-p:text-foreground/80 dark:prose-p:text-zinc-400 prose-p:text-base prose-p:leading-relaxed
                    prose-a:text-amber-500 dark:prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
                    prose-code:text-orange-600 dark:prose-code:text-amber-400 prose-code:font-mono prose-code:text-sm prose-code:bg-foreground/5 dark:prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-foreground/5 dark:prose-pre:bg-[#090d16] prose-pre:border prose-pre:border-foreground/5 dark:prose-pre:border-white/5 prose-pre:p-6 prose-pre:rounded-none
                    prose-ul:list-disc prose-ul:pl-6 prose-ul:text-foreground/80 dark:prose-ul:text-zinc-400
                    prose-ol:list-decimal prose-ol:pl-6 prose-ol:text-foreground/80 dark:prose-ol:text-zinc-400
                    prose-strong:text-foreground dark:prose-strong:text-white prose-strong:font-bold
                    prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-500/10 dark:prose-blockquote:bg-amber-950/20 prose-blockquote:p-4 prose-blockquote:italic
                ">
                    <ReactMarkdown>{markdownContent}</ReactMarkdown>
                </article>
            </div>
        </div>
    );
}
