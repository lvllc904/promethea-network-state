import type { DataFreshness } from '@/lib/guildhall-types';
import { formatFreshness } from '@/lib/guildhall-formatters';

const freshnessClasses: Record<DataFreshness, string> = {
  live: 'border-guildhall-treasury/40 bg-guildhall-treasury/10 text-guildhall-treasury',
  cached: 'border-guildhall-identity/40 bg-guildhall-identity/10 text-guildhall-identity',
  demo: 'border-guildhall-consensus/40 bg-guildhall-consensus/10 text-guildhall-consensus',
  unavailable: 'border-guildhall-danger/40 bg-guildhall-danger/10 text-guildhall-danger',
};

export function GuildhallStatusBadge({
  freshness,
  className = '',
}: {
  freshness: DataFreshness;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 text-xs font-medium ${freshnessClasses[freshness]} ${className}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatFreshness(freshness)}
    </span>
  );
}
