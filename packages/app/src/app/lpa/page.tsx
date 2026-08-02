import React from 'react';
import Link from 'next/link';

export default function LPAPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-inter py-16 px-6 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-mono text-sm mb-8 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Return to Platform
        </Link>
        
        <div className="p-8 md:p-12 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <svg className="w-32 h-32 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          </div>
          
          <div className="space-y-4 mb-12 border-b border-slate-800 pb-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded font-mono text-xs uppercase tracking-wider">Confidential</span>
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded font-mono text-xs uppercase tracking-wider">Legal Document</span>
            </div>
            <h1 className="font-orbitron text-3xl md:text-5xl font-bold text-white uppercase tracking-tight">Limited Partnership Agreement</h1>
            <p className="text-slate-400 font-mono text-sm">Document ID: TPNS-LPA-2026-V1.0.4 | Classification: Master Fund Covenant</p>
          </div>
          
          <div className="prose prose-invert prose-slate max-w-none prose-headings:font-orbitron prose-headings:text-slate-200 prose-a:text-cyan-400 prose-strong:text-white">
            <div className="p-6 bg-slate-950/50 rounded-xl border border-slate-800/50 text-center mb-8">
              <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <h3 className="font-orbitron text-xl text-slate-300 mb-2">Secure Document Vault</h3>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">The full execution copy of the Limited Partnership Agreement (LPA) requires a sovereign signature to access. Below is a public alignment summary of the legal covenants as they map to the smart contracts.</p>
            </div>
            
            <h3>Article II: Master-Series Architecture</h3>
            <p>
              Establishes the segregation of assets, liabilities, and bookkeeping pursuant to Delaware DRULPA Section 17-218. 
              On-chain, this isolation is enforced by the TPNS Platform Factory. The parent platform deploys independent Smart Contract instances (Series Tokens) for each physical asset class.
            </p>
            
            <h3>Article IV: The 3-Tier Execution Matrix</h3>
            <p>
              Outlines the strict parameterization of assets into yield profiles: Cash-Flow, Capital Gain, and High Complexity.
            </p>
            <ul>
              <li><strong>Tier 1:</strong> Predictable Cash Flow (e.g., NNN Industrial)</li>
              <li><strong>Tier 2:</strong> Value-Add / Capital Gains (e.g., Multi-Family conversions)</li>
              <li><strong>Tier 3:</strong> High Complexity (e.g., Distressed Aggregation & Quiet Title pipelines)</li>
            </ul>
            
            <h3>Article V: The 21/30/49 Metabolic Waterfall</h3>
            <p>
              Defines the flow of Free Cash Flow (FCF) after labor deductions (Tau). This specific distribution (21/30/49) is applied to TPNS's personal holdings and is a strongly suggested structure for independent fund managers building on the platform.
              This covenant is modeled in the <code>distributeYield()</code> function of the blockchain contracts.
            </p>
            <ul>
              <li><strong>49%</strong> - Investor Capital (LPs)</li>
              <li><strong>30%</strong> - The Commons (Network Treasury for continued land acquisition)</li>
              <li><strong>21%</strong> - The Governance / Operator Pool</li>
            </ul>
            
            <div className="mt-12 p-6 border border-slate-800 bg-slate-900 rounded flex justify-between items-center">
              <div>
                <h4 className="font-bold text-white mb-1">Request Full Document Access</h4>
                <p className="text-xs text-slate-400">Requires verified zero-knowledge accreditation credentials.</p>
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-mono text-sm rounded shadow-lg shadow-cyan-500/20 transition-all font-bold">
                Authenticate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
