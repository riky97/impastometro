import { Fragment } from 'react';
import { formatClock, formatDayLong, formatDuration } from '../engine/dates';
import { nextPhase } from '../engine/progress';
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
  nowMs,
}: {
  phases: readonly Phase[];
  numbers: ReadonlyMap<PhaseId, number>;
  titles: Record<PhaseId, string>;
  /** When given, the next phase is highlighted and a line marks the present moment. */
  nowMs?: number;
}) {
  const next = nowMs === undefined ? null : nextPhase(phases, nowMs);
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
              <Fragment key={p.id}>
                {next?.underway && next.phase.id === p.id && nowMs !== undefined && (
                  <li
                    aria-label={`Adesso: ${formatClock(nowMs)}`}
                    className="flex items-center gap-3 border-t-2 border-brand-600 py-1.5 text-sm font-semibold text-brand-800"
                  >
                    <span className="w-14 shrink-0 tabular-nums">{formatClock(nowMs)}</span>
                    <span>Adesso</span>
                  </li>
                )}
                <li
                  className={`flex items-center gap-3 py-3 ${next?.phase.id === p.id ? 'rounded-control bg-brand-50' : ''}`}
                >
                  <span className="w-14 shrink-0 text-xl font-semibold tabular-nums text-ink">
                    {formatClock(p.startMs)}
                  </span>
                  <span
                    aria-hidden
                    className={`size-2.5 shrink-0 rounded-full ${
                      p.kind === 'span'
                        ? (SERIES[p.id] ?? 'bg-line-strong')
                        : 'border-2 border-ink-3'
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
              </Fragment>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
