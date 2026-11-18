import type { Suitability } from '../engine/types';

const STYLES: Record<Suitability, string> = {
  recommended: 'bg-brand-100 text-brand-800',
  evaluate: 'bg-warn-bg text-warn-ink',
  discouraged: 'bg-bad-bg text-bad-ink',
};

export function Badge({ level, label }: { level: Suitability; label: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[level]}`}
    >
      {label}
    </span>
  );
}
