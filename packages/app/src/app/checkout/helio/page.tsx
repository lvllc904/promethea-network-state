'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button } from '@promethea/ui';
import { Loader2, Coins, ShieldCheck, CheckCircle2, Link as LinkIcon, Smartphone, Wallet2, ArrowRight } from 'lucide-react';

export default function HelioCheckoutPage() {
  const [selectedChain, setSelectedChain] = useState<'Solana' | 'Ethereum' | 'Polygon'>('Solana');
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'SOL' | 'USDT'>('USDC');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isSuccess && countdown === 0) {
      window.close();
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown]);

  const handleConnectWallet = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsWalletConnected(true);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletConnected) {
      alert("Please connect your wallet first.");
      return;
    }
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Dispatch success postMessage to the parent window
      if (window.opener) {
        window.opener.postMessage(
          { type: 'PAYMENT_SUCCESS', gateway: 'Helio' },
          '*'
        );
      }
    }, 2500);
  };

  const getAmountStr = () => {
    if (selectedToken === 'USDC' || selectedToken === 'USDT') return '25.00';
    if (selectedToken === 'SOL') return '0.14'; // ~ $25
    return '25.00';
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#030712] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Neon HUD ambient glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <Card className="w-full max-w-md border-purple-500/30 bg-[#090d16]/90 backdrop-blur-xl shadow-[0_0_50px_rgba(147,51,234,0.15)] relative z-10 rounded-none border">
          <CardHeader className="text-center pt-8">
            <div className="mx-auto bg-purple-500/10 text-purple-400 p-4 rounded-full w-fit mb-4 border border-purple-500/30 animate-pulse">
              <CheckCircle2 className="w-16 h-16" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold text-purple-400 uppercase tracking-wider">
              On-Chain Settled
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs mt-2">
              At-cost Web3 state filing has been successfully recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center pb-8">
            <div className="p-4 border border-white/5 bg-zinc-950/50 font-mono text-xs rounded-none text-zinc-300">
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">PAYMENT GATEWAY:</span>
                <span className="text-white font-bold">HELIO WEB3</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">BLOCK HASH:</span>
                <span className="text-purple-400">0x{Math.random().toString(16).substr(2, 14).toUpperCase()}...</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">SETTLED AMOUNT:</span>
                <span className="text-amber-400 font-bold">{getAmountStr()} {selectedToken} ({selectedChain})</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              This secure window will automatically close in <span className="text-purple-400 font-bold">{countdown}s</span>...
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-purple-500 hover:bg-purple-600 text-black font-mono font-bold uppercase rounded-none h-11 tracking-wider text-xs"
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
    <div className="min-h-screen bg-[#030712] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Neon HUD ambient glow background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md border-purple-500/30 bg-[#090d16]/95 backdrop-blur-xl shadow-[0_0_50px_rgba(147,51,234,0.15)] relative z-10 rounded-none border">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-purple-400 animate-pulse" />
              <CardTitle className="text-sm font-mono font-bold uppercase tracking-widest text-purple-400">
                Helio Web3 Checkout
              </CardTitle>
            </div>
            <span className="text-[9px] font-mono text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              On-Chain Settle
            </span>
          </div>
          <CardDescription className="text-zinc-400 text-xs pt-1">
            Wyoming state registration and lien search compliance fee settlement.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <div className="flex justify-between items-center p-3 border border-purple-500/20 bg-purple-500/5 rounded-none">
              <div className="flex items-center gap-1.5 text-xs text-purple-300 font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Wyoming State SOS Filing Fees:</span>
              </div>
              <span className="text-sm font-bold text-white font-mono">{getAmountStr()} {selectedToken}</span>
            </div>

            {/* Blockchain selection tabs */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-500 font-mono block uppercase">Select Network</span>
              <div className="grid grid-cols-3 gap-2">
                {(['Solana', 'Ethereum', 'Polygon'] as const).map((chain) => (
                  <Button
                    key={chain}
                    type="button"
                    variant={selectedChain === chain ? 'default' : 'outline'}
                    className={`h-8 text-[10px] font-mono rounded-none ${
                      selectedChain === chain 
                        ? 'bg-purple-500 text-black font-bold border-transparent' 
                        : 'border-zinc-800 hover:bg-zinc-900 text-zinc-400'
                    }`}
                    onClick={() => {
                      setSelectedChain(chain);
                      if (chain === 'Solana') {
                        setSelectedToken('USDC');
                      } else {
                        setSelectedToken('USDC');
                      }
                    }}
                  >
                    {chain}
                  </Button>
                ))}
              </div>
            </div>

            {/* Token selection */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-500 font-mono block uppercase">Select Token</span>
              <div className="grid grid-cols-3 gap-2">
                {(selectedChain === 'Solana' ? (['USDC', 'SOL'] as const) : (['USDC', 'USDT'] as const)).map((token) => (
                  <Button
                    key={token}
                    type="button"
                    variant={selectedToken === token ? 'default' : 'outline'}
                    className={`h-8 text-[10px] font-mono rounded-none ${
                      selectedToken === token 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold' 
                        : 'border-zinc-800 hover:bg-zinc-900 text-zinc-400'
                    }`}
                    onClick={() => setSelectedToken(token)}
                  >
                    {token}
                  </Button>
                ))}
              </div>
            </div>

            {/* Wallet connection block */}
            <div className="border border-white/5 bg-zinc-950/40 p-4 flex flex-col items-center justify-center text-center space-y-3">
              {!isWalletConnected ? (
                <>
                  <Wallet2 className="w-8 h-8 text-zinc-600" />
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-zinc-300">No Web3 Wallet Linked</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Connect Phantom, MetaMask, or WalletConnect</p>
                  </div>
                  <Button
                    type="button"
                    disabled={isConnecting}
                    className="h-8 text-[10px] font-mono bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-none w-full"
                    onClick={handleConnectWallet}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>Initializing Bridge...</span>
                      </>
                    ) : (
                      <span>Connect Secure Citizen Wallet</span>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold bg-amber-500/10 px-3 py-1.5 border border-amber-500/20 w-full justify-center">
                    <Smartphone className="w-4 h-4" />
                    <span>WALLET CONNECTED (0x7...E89)</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono">Simulated Balance: 350.00 USDC // 4.5 SOL</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 justify-center text-[10px] text-zinc-500 pt-2 border-t border-white/5 font-mono">
              <LinkIcon className="w-3.5 h-3.5 text-zinc-600" />
              <span>Multi-Chain Settlement Oracle: Active</span>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              type="submit"
              disabled={isProcessing || !isWalletConnected}
              className={`w-full font-mono font-bold uppercase rounded-none h-11 tracking-wider text-xs flex items-center justify-center gap-2 ${
                isWalletConnected 
                  ? 'bg-purple-500 hover:bg-purple-600 text-black' 
                  : 'bg-zinc-800 text-zinc-600 border-zinc-900 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Settling On-Chain Contract...</span>
                </>
              ) : (
                <>
                  <span>Settle via {selectedToken} ({getAmountStr()} {selectedToken})</span>
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
