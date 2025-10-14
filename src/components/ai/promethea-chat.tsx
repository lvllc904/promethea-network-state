'use client';
import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { askPrometheaAction } from '@/app/actions';
import { useUser } from '@/firebase';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'ai';
};

export function PrometheaChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "I am Promethea, the resident AI of this network state. How may I assist you in our shared mission?",
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // The server action now returns a more structured object
      const result = await askPrometheaAction({ query: input });
      
      let aiText: string;
      if (result && 'error' in result && result.error) {
        aiText = result.error;
      } else if (result && 'response' in result) {
        aiText = result.response;
      } else {
        aiText = "I received an unexpected response. Please try again.";
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiText,
        sender: 'ai',
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Sorry, I was unable to process your request at this time.',
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 sm:right-6 md:right-8 z-50 w-[calc(100vw-2rem)] max-w-sm"
          >
            <div className="bg-card border shadow-2xl rounded-lg flex flex-col h-[60vh] max-h-[700px]">
              <header className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bot className="text-primary" />
                    <h3 className="font-headline font-semibold">Promethea Assistant</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleOpen}>
                  <X className="h-4 w-4" />
                </Button>
              </header>
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex items-end gap-2',
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {msg.sender === 'ai' && (
                        <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                          <AvatarFallback><Bot size={18}/></AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'max-w-xs rounded-lg px-3 py-2 text-sm',
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted rounded-bl-none'
                        )}
                      >
                        {msg.text}
                      </div>
                       {msg.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user?.isAnonymous ? 'A' : 'C'}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                        <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                           <AvatarFallback><Bot size={18}/></AvatarFallback>
                        </Avatar>
                        <div className="max-w-xs rounded-lg px-3 py-2 text-sm bg-muted rounded-bl-none">
                            <Loader2 className="h-4 w-4 animate-spin"/>
                        </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask about the constitution..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={toggleOpen}
        size="icon"
        className="fixed bottom-6 right-4 sm:right-6 md:right-8 z-50 h-14 w-14 rounded-full shadow-xl"
      >
        <AnimatePresence>
          {isOpen ? (
            <motion.div key="close" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }}>
              <MessageSquare className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </>
  );
}
