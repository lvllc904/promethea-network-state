'use client';

import React from 'react';

interface DocumentItem {
  id: string;
  title: string;
  code: string;
  type: string;
  accessStatus: 'Authorized' | 'Gated' | 'Under Review';
}

interface ComplianceDocumentVaultProps {
  userWallet?: string;
  isAccredited?: boolean;
}

export const ComplianceDocumentVault: React.FC<ComplianceDocumentVaultProps> = ({
  userWallet = '0x...71a2',
  isAccredited = true,
}) => {
  const documents: DocumentItem[] = [
    { id: '1', title: 'Private Placement Memorandum', code: 'PPM', type: 'SEC Rule 506(c)', accessStatus: isAccredited ? 'Authorized' : 'Gated' },
    { id: '2', title: 'Limited Partnership Agreement', code: 'LPA', type: 'DRULPA § 17-218', accessStatus: isAccredited ? 'Authorized' : 'Gated' },
    { id: '3', title: 'Subscription Booklet & W-9', code: 'PDF', type: 'Investor Questionnaire', accessStatus: 'Under Review' },
  ];

  return (
    <div className="relative w-full rounded-xl bg-slate-900/40 p-4 backdrop-blur-md shadow-2xl text-slate-100 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
            <span className="text-cyan-400">🔒</span> Compliance & Document Vault
          </h3>
          <p className="text-[10px] text-slate-400">
            Holder of Record Verification & Watermarked Vault
          </p>
        </div>
        <div className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 text-[8px] font-mono">
          Wallet: {userWallet}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-3 rounded bg-slate-950/75 hover:bg-slate-900/80 transition-colors flex flex-col items-center text-center relative group"
          >
            {/* Watermark Tag */}
            <div className="absolute top-1 right-1 text-[7px] font-mono text-slate-500 bg-slate-900 px-1 rounded">
              SEC
            </div>

            <div className="w-9 h-11 bg-slate-900 rounded flex flex-col items-center justify-center my-2 group-hover:scale-105 transition-transform shadow-inner">
              <span className="text-[10px] font-extrabold text-cyan-400 font-mono">{doc.code}</span>
            </div>

            <div className="text-[10px] font-bold text-slate-200 mb-0.5">{doc.title}</div>
            <div className="text-[8px] text-slate-400 mb-2">{doc.type}</div>

            <div className={`mt-auto px-2 py-0.5 rounded-full text-[8px] font-mono ${
              doc.accessStatus === 'Authorized'
                ? 'bg-emerald-950/80 text-emerald-300'
                : doc.accessStatus === 'Under Review'
                ? 'bg-amber-950/80 text-amber-300'
                : 'bg-rose-950/80 text-rose-300'
            }`}>
              {doc.accessStatus === 'Authorized' ? '✓ Authorized' : doc.accessStatus}
            </div>
          </div>
        ))}
      </div>

      {/* 3-Tier Platform Fee Matrix Table */}
      <div className="pt-2 border-t border-slate-850">
        <div className="text-[10px] font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span>Platform Fee Engine (LPA § 2.3)</span>
        </div>

        <div className="overflow-x-auto rounded bg-slate-950/60">
          <table className="w-full text-left text-[9px]">
            <thead className="bg-slate-900 text-slate-400 font-mono text-[9px]">
              <tr>
                <th className="p-1.5">Complexity</th>
                <th className="p-1.5">Operational Profile</th>
                <th className="p-1.5 text-right">Fee (% of FCF)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr className="hover:bg-slate-900/50">
                <td className="p-1.5 font-bold text-emerald-400">Tier 1</td>
                <td className="p-1.5 text-[8px] text-slate-400">NNN ground leases, stabilized title</td>
                <td className="p-1.5 text-right font-mono font-bold text-emerald-400">1.0%</td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="p-1.5 font-bold text-sky-400">Tier 2 & 3</td>
                <td className="p-1.5 text-[8px] text-slate-400">Multifamily, Maker Guilds, operating biz</td>
                <td className="p-1.5 text-right font-mono font-bold text-sky-400">2.0%</td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="p-1.5 font-bold text-amber-400">Tier 4 & 5</td>
                <td className="p-1.5 text-[8px] text-slate-400">Skyscrapers, off-grid utilities</td>
                <td className="p-1.5 text-right font-mono font-bold text-amber-400">3.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
