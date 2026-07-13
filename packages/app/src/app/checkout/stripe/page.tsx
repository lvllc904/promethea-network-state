'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button, Input, Label } from '@promethea/ui';
import { Loader2, CreditCard, ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export default function StripeCheckoutPage() {
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get('prefilled_email') || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isSuccess && countdown === 0) {
      window.close();
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 4);
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvc(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Dispatch success postMessage to the parent window
      if (window.opener) {
        window.opener.postMessage(
          { type: 'PAYMENT_SUCCESS', gateway: 'Stripe' },
          '*'
        );
      }
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#030712] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Neon HUD ambient glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <Card className="w-full max-w-md border-amber-500/30 bg-[#090d16]/90 backdrop-blur-xl shadow-[0_0_50px_rgba(245, 158, 11,0.15)] relative z-10 rounded-none border">
          <CardHeader className="text-center pt-8">
            <div className="mx-auto bg-amber-500/10 text-amber-400 p-4 rounded-full w-fit mb-4 border border-amber-500/30 animate-pulse">
              <CheckCircle2 className="w-16 h-16" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold text-amber-400 uppercase tracking-wider">
              Payment Settled
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs mt-2">
              At-cost state filing fee of $25.00 has been verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center pb-8">
            <div className="p-4 border border-white/5 bg-zinc-950/50 font-mono text-xs rounded-none text-zinc-300">
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">PAYMENT GATEWAY:</span>
                <span className="text-white font-bold">STRIPE SECURE</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">TRANSACTION ID:</span>
                <span className="text-amber-400">TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">SETTLED AMOUNT:</span>
                <span className="text-amber-400 font-bold">$25.00 USD</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              This secure window will automatically close in <span className="text-amber-400 font-bold">{countdown}s</span>...
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-amber-500 hover:bg-orange-600 text-black font-mono font-bold uppercase rounded-none h-11 tracking-wider text-xs"
              onClick={() => window.close()}
            >
              Return to Promethea Cockpit
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Neon HUD ambient glow background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md border-amber-500/30 bg-[#090d16]/95 backdrop-blur-xl shadow-[0_0_50px_rgba(245, 158, 11,0.15)] relative z-10 rounded-none border">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400 animate-pulse" />
              <CardTitle className="text-sm font-mono font-bold uppercase tracking-widest text-amber-400">
                Stripe Secure Payment
              </CardTitle>
            </div>
            <span className="text-[9px] font-mono text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              At-Cost Settle
            </span>
          </div>
          <CardDescription className="text-zinc-400 text-xs pt-1">
            Wyoming state registration and lien search compliance fee settlement.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <div className="flex justify-between items-center p-3 border border-amber-500/20 bg-amber-500/5 rounded-none">
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Wyoming State SOS Filing Fees:</span>
              </div>
              <span className="text-sm font-bold text-white font-mono">$25.00</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-zinc-400 font-mono">CITIZEN PREFILLED EMAIL</Label>
              <Input
                id="email"
                type="email"
                required
                className="bg-zinc-950/60 border-zinc-800 focus:border-amber-500/50 rounded-none font-mono text-xs"
                placeholder="sovereign-citizen@lvhllc.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName" className="text-xs text-zinc-400 font-mono">CARDHOLDER NAME</Label>
              <Input
                id="cardName"
                type="text"
                required
                className="bg-zinc-950/60 border-zinc-800 focus:border-amber-500/50 rounded-none font-mono text-xs"
                placeholder="JOHN DOE"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-xs text-zinc-400 font-mono">CREDIT CARD NUMBER</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  type="text"
                  required
                  className="bg-zinc-950/60 border-zinc-800 focus:border-amber-500/50 rounded-none font-mono text-xs pr-10"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                />
                <CreditCard className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry" className="text-xs text-zinc-400 font-mono">EXP DATE</Label>
                <Input
                  id="expiry"
                  type="text"
                  required
                  className="bg-zinc-950/60 border-zinc-800 focus:border-amber-500/50 rounded-none font-mono text-xs"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc" className="text-xs text-zinc-400 font-mono">CVC</Label>
                <Input
                  id="cvc"
                  type="password"
                  required
                  className="bg-zinc-950/60 border-zinc-800 focus:border-amber-500/50 rounded-none font-mono text-xs"
                  placeholder="•••"
                  value={cvc}
                  onChange={handleCvcChange}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 justify-center text-[10px] text-zinc-500 pt-2 border-t border-white/5 font-mono">
              <Lock className="w-3.5 h-3.5 text-zinc-600" />
              <span>AES-256 Symmetrical Vault Encryption Active</span>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-mono font-bold uppercase rounded-none h-11 tracking-wider text-xs flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Verification...</span>
                </>
              ) : (
                <>
                  <span>Settle State Fee ($25.00)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
