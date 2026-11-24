import { MS_PER_MIN } from './dates';
import type { Phase } from './types';

export interface NextPhase {
  /** Index of the phase in the schedule. */
  index: number;
  phase: Phase;
  /** Minutes from now until it starts. */
  inMin: number;
  /** False while the first phase has not started yet. */
  underway: boolean;
}

/** The first phase that starts after `nowMs`; null once the bake time has passed. Pure: no clock here. */
export function nextPhase(phases: readonly Phase[], nowMs: number): NextPhase | null {
  const index = phases.findIndex((p) => p.startMs > nowMs);
  const phase = phases[index];
  if (!phase) return null;
  return { index, phase, inMin: (phase.startMs - nowMs) / MS_PER_MIN, underway: index > 0 };
}
