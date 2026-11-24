import { formatClock, formatDay, formatDuration } from '../engine/dates';
import type { Phase, PhaseId } from '../engine/types';

/** Warm phases in green/sand, the cold phase in slate: temperature reads before the labels do. */
const SERIES: Partial<Record<PhaseId, string>> = {
  mix: 'bg-series-work',
  rest: 'bg-series-rest',
  preFridgeRise: 'bg-series-warm',
  ambientRise: 'bg-series-warm',
  fridge: 'bg-series-cold',
  outOfFridge: 'bg-series-warm',
};

/** Horizontal bar: one segment per timed phase, widths proportional to the durations. */
export function TimelineBar({
  phases,
  titles,
}: {
  phases: readonly Phase[];
  titles: Record<PhaseId, string>;
}) {
  const spans = phases.filter((p) => p.kind === 'span' && p.durationMin > 0);
  return (
    <div
      role="img"
      aria-label={`Tabella di marcia: ${spans.map((p) => `${titles[p.id]} ${formatDuration(p.durationMin)}`).join(', ')}`}
      className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
    >
      {spans.map((p) => (
        <div
          key={p.id}
          className={`${SERIES[p.id] ?? 'bg-line-strong'} min-w-1.5`}
          style={{ flexGrow: p.durationMin, flexBasis: 0 }}
          title={`${titles[p.id]}: ${formatDuration(p.durationMin)}`}
        />
      ))}
    </div>
  );
}

/** Phase list with start timestamps and durations. `numbers` maps a phase to its step number. */
export function PhaseList({
  phases,
  numbers,
  titles,
}: {
  phases: readonly Phase[];
  numbers: ReadonlyMap<PhaseId, number>;
  titles: Record<PhaseId, string>;
}) {
  return (
    <ol className="divide-y divide-line">
      {phases.map((p) => (
        <li key={p.id} className="flex items-center gap-3 py-3">
          <span
            aria-hidden
            className={`size-2.5 shrink-0 rounded-full ${
              p.kind === 'span' ? (SERIES[p.id] ?? 'bg-line-strong') : 'border-2 border-ink-3'
            }`}
          />
          <span className="min-w-0 grow font-medium text-ink">
            <span className="tabular-nums text-ink-3">{numbers.get(p.id)}.</span> {titles[p.id]}
          </span>
          <span className="shrink-0 text-right text-sm leading-snug tabular-nums text-ink-2">
            <span className="block font-semibold text-ink">
              {formatDay(p.startMs)}, {formatClock(p.startMs)}
            </span>
            {p.kind === 'span' && <span className="block">{formatDuration(p.durationMin)}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
