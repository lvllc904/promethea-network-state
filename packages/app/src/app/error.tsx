'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@promethea/ui';
import { AlertTriangle, Mail } from 'lucide-react';

export default function GlobalErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Promethea Global Error Boundary caught an exception:', error);

    // Send to our trauma vault
    fetch('/api/trauma-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'browser-console',
        message: error?.message || 'Unknown React Boundary Error',
        stack: error?.stack || '',
        digest: error?.digest || ''
      })
    }).catch(err => console.error('Failed to report trauma:', err));
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white/5 p-8 rounded-xl border border-white/10 backdrop-blur-md text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/20 rounded-full border border-red-500/50">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-headline font-bold">System Outage</h1>
          <p className="text-white/70">
            Our autonomous routing system encountered an unexpected disruption. The engineering node has been notified.
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
          <Button 
            onClick={() => reset()} 
            className="w-full bg-white text-black hover:bg-gray-200"
          >
            Attempt System Reboot
          </Button>
          
          <Button asChild variant="outline" className="w-full bg-transparent border-white/20 hover:bg-white/10 text-white">
            <Link href="mailto:contact@lvhllc.org" className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Core Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
