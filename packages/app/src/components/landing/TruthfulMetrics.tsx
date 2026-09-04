import { Activity, Landmark, ShieldCheck } from 'lucide-react';
import { GuildhallStatusBadge } from '@/components/guildhall/GuildhallStatusBadge';

const metrics = [
  { label: 'Network uptime',   value: '99.99%', note: 'Demo value until a signed status source is connected.', icon: Activity,    accent: 'consensus' as const },
  { label: 'Verified capital', value: '$5.2M',  note: 'Demo value · source attribution pending.',              icon: Landmark,    accent: 'treasury'  as const },
  { label: 'Active citizens',  value: '1,402',  note: 'Demo value · cohort and timestamp pending.',            icon: ShieldCheck, accent: 'identity'  as const },
];

const accentBorder: Record<string, string> = {
  identity:  'rgba(245,158,11,0.16)',
  treasury:  'rgba(56,189,248,0.12)',
  consensus: 'rgba(52,211,153,0.12)',
};

export function TruthfulMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map(({ label, value, note, icon: Icon, accent }) => (
        <div
          key={label}
          className="rounded-2xl p-6 backdrop-blur-sm"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: `1px solid ${accentBorder[accent]}`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="guildhall-label">{label}</p>
              <p className="mt-3 font-code text-3xl text-guildhall-text">{value}</p>
            </div>
            <Icon className="h-5 w-5 text-guildhall-muted mt-0.5 shrink-0" aria-hidden="true" />
          </div>
          <div className="mt-5">
            <GuildhallStatusBadge freshness="demo" />
            <p className="mt-2 text-xs leading-5 text-guildhall-muted">{note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
