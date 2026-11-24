import { formatClock, formatDay, formatDuration } from '../engine/dates';
import { nextPhase } from '../engine/progress';
import type { Phase, PhaseId } from '../engine/types';

/** What to do next and when, read at arm's length. Shows nothing once the bake time has passed. */
export function NextPhaseStrip({
  phases,
  titles,
  numbers,
  nowMs,
}: {
  phases: readonly Phase[];
  titles: Record<PhaseId, string>;
  numbers: ReadonlyMap<PhaseId, number>;
  nowMs: number;
}) {
  const next = nextPhase(phases, nowMs);
  if (!next) return null;
  const { phase } = next;
  const otherDay = formatDay(phase.startMs) !== formatDay(nowMs);
  return (
    <section
      aria-label={next.underway ? 'Prossima fase' : 'Prima fase'}
      className="flex items-center justify-between gap-4 rounded-2xl border border-brand-600 bg-surface px-4 py-3"
    >
      <div className="min-w-0">
        <p className="text-sm text-ink-2">{next.underway ? 'Prossima fase' : 'Si comincia con'}</p>
        <p className="truncate text-lg font-semibold text-ink">
          {numbers.get(phase.id)}. {titles[phase.id]}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm text-ink-2">{otherDay ? formatDay(phase.startMs) : 'alle'}</p>
        <p className="text-3xl leading-tight font-semibold tabular-nums text-ink">
          {formatClock(phase.startMs)}
        </p>
        <p className="text-sm tabular-nums text-ink-2">tra {formatDuration(next.inMin)}</p>
      </div>
    </section>
  );
}
