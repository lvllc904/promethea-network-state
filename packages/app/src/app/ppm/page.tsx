import React from 'react';
import Link from 'next/link';

export default function PPMPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-inter py-16 px-6 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 font-mono text-sm mb-8 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Return to Platform
        </Link>
        
        <div className="p-8 md:p-12 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <svg className="w-32 h-32 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          </div>
          
          <div className="space-y-4 mb-12 border-b border-slate-800 pb-8">
            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded font-mono text-xs uppercase tracking-wider">Reg D 506(c)</span>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono text-xs uppercase tracking-wider">Offering Document</span>
            </div>
            <h1 className="font-orbitron text-3xl md:text-5xl font-bold text-white uppercase tracking-tight">Private Placement Memorandum</h1>
            <p className="text-slate-400 font-mono text-sm">Document ID: TPNS-PPM-2026-V1.0.4 | Entity: The Promethean Network State, LP</p>
          </div>
          
          <div className="prose prose-invert prose-slate max-w-none prose-headings:font-orbitron prose-headings:text-slate-200 prose-a:text-purple-400 prose-strong:text-white">
            <div className="p-6 bg-slate-950/50 rounded-xl border border-slate-800/50 text-center mb-8">
              <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <h3 className="font-orbitron text-xl text-slate-300 mb-2">Disclosure Vault</h3>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">The full execution copy of the Private Placement Memorandum requires verified accreditation status. Below is the executive summary of the offering and risk factors as aligned with the smart contracts.</p>
            </div>
            
            <h3>Executive Summary</h3>
            <p>
              The Promethean Network State, LP is a closed-end Series Limited Partnership operating under Regulation D, Rule 506(c). 
              The Master Fund seeks to raise $100,000,000 USD to secure hard assets (workforce housing, NNN land, and infrastructure), 
              fractionalizing capital on-chain while capturing raw labor value through the Labor Value Matrix.
            </p>
            
            <h3>The Labor Value Matrix</h3>
            <p>
              Unlike traditional funds, the Promethean Network State treats labor as a primary capital input. The PPM discloses the mathematical equation mapping raw physical energy to yield deduction:
            </p>
            <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-cyan-400 text-sm text-center my-6">
              τ = L_b × [1 + η(PUE - 1) + φ(WUE) + γ(C_grid)]
            </div>
            <p>
              This formula is actively executed on-chain via the <code>calculateTau()</code> smart contract function, ensuring real-world operational efficiency directly dictates profit distribution.
            </p>
            
            <h3>Risk Factors & On-Chain Security</h3>
            <p>
              The PPM outlines cryptographic isolation parameters separating individual child Series from the parent platform. 
              The TPNS Platform Factory architecture limits liability cross-contamination between segregated real-world asset pools.
            </p>
            
            <div className="mt-12 p-6 border border-slate-800 bg-slate-900 rounded flex justify-between items-center">
              <div>
                <h4 className="font-bold text-white mb-1">Verify Accreditation Status</h4>
                <p className="text-xs text-slate-400">Required to view the full offering disclosures and subscription agreements.</p>
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-mono text-sm rounded shadow-lg shadow-purple-500/20 transition-all font-bold">
                Verify Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
