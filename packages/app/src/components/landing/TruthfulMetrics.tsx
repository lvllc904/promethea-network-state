import { Activity, Landmark, ShieldCheck } from 'lucide-react';
import { GuildhallPanel } from '@/components/guildhall/GuildhallPanel';
import { GuildhallStatusBadge } from '@/components/guildhall/GuildhallStatusBadge';

const metrics = [
  { label: 'Network uptime', value: '99.99%', note: 'Demo value until a signed status source is connected.', icon: Activity },
  { label: 'Verified capital', value: '$5.2M', note: 'Demo value · source attribution pending.', icon: Landmark },
  { label: 'Active citizens', value: '1,402', note: 'Demo value · cohort and timestamp pending.', icon: ShieldCheck },
];

export function TruthfulMetrics() {
  return (
    <div className="grid gap-px overflow-hidden border border-guildhall-line bg-guildhall-line md:grid-cols-3">
      {metrics.map(({ label, value, note, icon: Icon }) => (
        <GuildhallPanel key={label} className="border-0 bg-guildhall-panel" padded={false}>
          <div className="flex items-start justify-between gap-4">
            <div><p className="guildhall-label">{label}</p><p className="mt-3 font-code text-3xl text-guildhall-text">{value}</p></div>
            <Icon className="h-5 w-5 text-guildhall-muted" aria-hidden="true" />
          </div>
          <div className="mt-5"><GuildhallStatusBadge freshness="demo" /><p className="mt-2 text-xs leading-5 text-guildhall-muted">{note}</p></div>
        </GuildhallPanel>
      ))}
    </div>
  );
}
