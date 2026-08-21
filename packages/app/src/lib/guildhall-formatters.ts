import type { DataFreshness } from './guildhall-types';

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value);
}

export function formatPercent(value: number, maximumFractionDigits = 1) {
  return `${value.toFixed(maximumFractionDigits)}%`;
}

export function formatTimestamp(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatFreshness(freshness: DataFreshness) {
  switch (freshness) {
    case 'live':
      return 'Live';
    case 'cached':
      return 'Cached';
    case 'demo':
      return 'Demo dataset';
    default:
      return 'Unavailable';
  }
}

export function getFreshnessLabel(freshness: DataFreshness, source?: string) {
  const base = formatFreshness(freshness);
  return source ? `${base} · ${source}` : base;
}
