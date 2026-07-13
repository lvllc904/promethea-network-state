import { useState } from 'react';
import { DynamicContextProvider, useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';

function AuthCore() {
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const authenticate = async () => {
    if (!primaryWallet) return;
    try {
      setStatus('Verifying utility token (UVT) gating...');
      setError(null);

      // In a real scenario, you would check the token account balance for UVT.
      // We will simulate success for the demo.
      const hasUvt = true; // Replace with actual RPC call

      if (!hasUvt) {
        throw new Error('No UVT found in wallet. Access denied.');
      }

      setStatus('Signing authentication payload...');
      const message = `Promethean Network State\nAction: Authenticate\nTimestamp: ${Date.now()}`;
      
      const connector = primaryWallet.connector as any;
      if (!connector.signMessage) {
        throw new Error('Wallet does not support message signing');
      }

      const signature = await connector.signMessage(message);

      setStatus('Verifying with Apex Master Guardian...');
      // Convert signature and message to format expected by backend if necessary
      // For this demo, we can just fetch our local endpoint.
      
      const did = `did:prmth:${primaryWallet.address}`;
      
      // Simulate backend verify (Normally POST to /auth/challenge then /auth/verify)
      // Here we just mock the token and hash for the sake of the demo's redirect
      const uid = 'citizen-' + primaryWallet.address.slice(0, 6);
      const token = 'verified-token';
      const hash = signature; 

      setStatus('Hydrating Cockpit...');
      
      // Redirect back to Body 1 (DAC)
      const baseUrl = 'http://localhost:3000';
      window.location.href = `${baseUrl}/dashboard?did=${did}&uid=${uid}&token=${token}&hash=${hash}`;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
      setStatus('');
      await handleLogOut();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-mono p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-2">Promethean Gateway</h1>
        <p className="text-zinc-400 text-center text-sm mb-8">Body 2 Authentication & Multisig</p>
        
        <div className="flex justify-center mb-6">
          <DynamicWidget />
        </div>

        {primaryWallet && (
          <div className="space-y-4">
            <button 
              onClick={authenticate}
              disabled={!!status}
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase tracking-widest rounded transition-colors disabled:opacity-50"
            >
              Verify On-Chain & Enter
            </button>
            {status && <p className="text-cyan-400 text-xs text-center animate-pulse">{status}</p>}
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: '1802302e-c5ee-461c-b2cb-23007ebfe069',
        walletConnectors: [SolanaWalletConnectors],
      }}
    >
      <AuthCore />
    </DynamicContextProvider>
  );
}

export default App;
