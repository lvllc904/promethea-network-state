import type { DataFreshness } from '@/lib/guildhall-types';
import { formatFreshness } from '@/lib/guildhall-formatters';
import { GuildhallStatusBadge } from './GuildhallStatusBadge';

export function TelemetryProvenance({
  freshness,
  source,
  updatedAt,
  className = '',
}: {
  freshness: DataFreshness;
  source?: string;
  updatedAt?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs text-guildhall-subtle ${className}`}>
      <GuildhallStatusBadge freshness={freshness} />
      {source && <span>{source}</span>}
      {updatedAt && <span>Updated {updatedAt}</span>}
      {!source && freshness === 'unavailable' && <span>{formatFreshness(freshness)}</span>}
    </div>
  );
}
