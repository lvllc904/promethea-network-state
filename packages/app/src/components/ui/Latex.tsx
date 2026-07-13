'use client';

import React from 'react';

interface LatexProps {
  math: string;
  block?: boolean;
  className?: string;
}

export default function Latex({ math, block = false, className = '' }: LatexProps) {
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const [katexLoaded, setKatexLoaded] = React.useState(false);

  React.useEffect(() => {
    // 1. Load KaTeX CSS if not present
    const cssId = 'katex-cdn-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // 2. Load KaTeX JS script if not loaded
    const scriptId = 'katex-cdn-script';
    if (window.katex) {
      setKatexLoaded(true);
      return;
    }

    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    }

    const handleLoad = () => {
      setKatexLoaded(true);
    };

    script.addEventListener('load', handleLoad);

    // If script is already loaded but state is not set
    if (window.katex) {
      setKatexLoaded(true);
    }

    return () => {
      script.removeEventListener('load', handleLoad);
    };
  }, []);

  React.useEffect(() => {
    if (!containerRef.current) return;

    if (!katexLoaded || !window.katex) {
      containerRef.current.textContent = math;
      return;
    }

    try {
      window.katex.render(math, containerRef.current, {
        displayMode: block,
        throwOnError: false,
        trust: true,
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      containerRef.current.textContent = math;
    }
  }, [math, block, katexLoaded]);

  return (
    <span 
      ref={containerRef} 
      className={`inline-block font-sans selection:bg-amber-500/20 ${block ? 'w-full my-6 text-center overflow-x-auto py-2' : ''} ${className}`}
    >
      {math}
    </span>
  );
}

declare global {
  interface Window {
    katex?: {
      render: (math: string, element: HTMLElement, options?: any) => void;
    };
  }
}
