'use client';
import { useState } from 'react';

// This is a simplified toast hook that matches the expected API in promethea-chat.tsx.
// It should ideally integrate with a global toast provider.

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    console.log('Toast:', props.title, props.description);
    setToasts((prev) => [...prev, props]);
    // Auto-remove after 3 seconds could go here
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t !== props));
    }, 3000);
  };

  return { toast, toasts };
}
