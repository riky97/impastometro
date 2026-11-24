import { formatClock, formatDayLong, formatDuration } from '../engine/dates';
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

/** Phase list grouped by day: the clock time first and large, then the phase and its duration. */
export function PhaseList({
  phases,
  numbers,
  titles,
}: {
  phases: readonly Phase[];
  numbers: ReadonlyMap<PhaseId, number>;
  titles: Record<PhaseId, string>;
}) {
  const days: { day: string; items: Phase[] }[] = [];
  for (const p of phases) {
    const day = formatDayLong(p.startMs);
    const last = days[days.length - 1];
    if (last?.day === day) last.items.push(p);
    else days.push({ day, items: [p] });
  }
  return (
    <div>
      {days.map(({ day, items }) => (
        <section key={day} aria-label={day}>
          <h3 className="pt-3 text-xs font-medium tracking-wide text-ink-3 uppercase">{day}</h3>
          <ol className="divide-y divide-line">
            {items.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <span className="w-14 shrink-0 text-xl font-semibold tabular-nums text-ink">
                  {formatClock(p.startMs)}
                </span>
                <span
                  aria-hidden
                  className={`size-2.5 shrink-0 rounded-full ${
                    p.kind === 'span' ? (SERIES[p.id] ?? 'bg-line-strong') : 'border-2 border-ink-3'
                  }`}
                />
                <span className="min-w-0 grow font-medium text-ink">
                  <span className="tabular-nums text-ink-3">{numbers.get(p.id)}.</span>{' '}
                  {titles[p.id]}
                </span>
                {p.kind === 'span' && (
                  <span className="shrink-0 text-sm tabular-nums text-ink-2">
                    {formatDuration(p.durationMin)}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
