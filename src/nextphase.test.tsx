// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { NextPhaseStrip } from './components/NextPhaseStrip';
import { PhaseList } from './components/Timeline';
import { PHASE_TITLES } from './data/procedures.it';
import { calculate } from './engine/calculate';
import { parseLocalDateTime } from './engine/dates';
import { referenceInput } from './engine/fixtures';
import { nextPhase } from './engine/progress';

afterEach(cleanup);

const { phases } = calculate(referenceInput()).schedule;
const numbers = new Map(phases.map((p, i) => [p.id, i + 1] as const));
const at = (local: string): number => parseLocalDateTime(local) ?? NaN;

describe('nextPhase', () => {
  it('is the first phase before anything has started', () => {
    const next = nextPhase(phases, at('2026-11-14T15:00'));
    expect(next?.phase.id).toBe('mix');
    expect(next?.underway).toBe(false);
  });

  it('is the phase after the one underway', () => {
    // The reference case rests from 16:13 to 17:13, so the shaping is next.
    const next = nextPhase(phases, at('2026-11-14T16:47'));
    expect(next?.phase.id).toBe('shape');
    expect(next?.underway).toBe(true);
    expect(Math.round(next?.inMin ?? 0)).toBe(26);
  });

  it('is nothing once the bake time has passed', () => {
    expect(nextPhase(phases, at('2026-11-15T19:31'))).toBeNull();
  });
});

describe('next phase on screen', () => {
  it('shows the next phase with its time and the wait', () => {
    render(
      <NextPhaseStrip
        phases={phases}
        titles={PHASE_TITLES}
        numbers={numbers}
        nowMs={at('2026-11-14T16:47')}
      />,
    );
    expect(screen.getByRole('region', { name: 'Prossima fase' })).toHaveTextContent('3. Staglio');
    expect(screen.getByText('17:13')).toBeInTheDocument();
    expect(screen.getByText('tra 26 min')).toBeInTheDocument();
  });

  it('shows nothing for a plan that is already over', () => {
    render(
      <NextPhaseStrip
        phases={phases}
        titles={PHASE_TITLES}
        numbers={numbers}
        nowMs={at('2026-11-20T10:00')}
      />,
    );
    expect(screen.queryByRole('region', { name: /fase|comincia/i })).not.toBeInTheDocument();
  });

  it('marks the present moment in the timeline and leaves it out when there is no clock', () => {
    const { rerender } = render(
      <PhaseList
        phases={phases}
        titles={PHASE_TITLES}
        numbers={numbers}
        nowMs={at('2026-11-14T16:47')}
      />,
    );
    expect(screen.getByLabelText('Adesso: 16:47')).toBeInTheDocument();
    rerender(<PhaseList phases={phases} titles={PHASE_TITLES} numbers={numbers} />);
    expect(screen.queryByText('Adesso')).not.toBeInTheDocument();
  });
});
