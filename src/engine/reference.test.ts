import { describe, expect, it } from 'vitest';
import { calculate } from './calculate';
import { formatClock } from './dates';
import { referenceInput } from './fixtures';
import type { Phase, PhaseId } from './types';

const phase = (phases: Phase[], id: PhaseId): Phase => {
  const found = phases.find((p) => p.id === id);
  if (!found) throw new Error(`missing phase ${id}`);
  return found;
};

describe('reference case (classica, spirale, 1 kg, 14-15 Nov 2026)', () => {
  const result = calculate(referenceInput());

  it('is valid', () => {
    expect(result.issues).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('computes the ingredients', () => {
    const { ingredients } = result;
    expect(ingredients.flourG).toBe(1000);
    expect(ingredients.waterG).toBe(630);
    expect(ingredients.saltG).toBe(30);
    expect(ingredients.freshYeastG).toBeCloseTo(1, 0);
    expect(Math.abs(ingredients.freshYeastG - 1)).toBeLessThanOrEqual(0.05);
    expect(ingredients.oilG).toBe(0);
    expect(ingredients.totalG).toBe(1661);
    expect(result.waterTempC).toBe(10);
  });

  it('splits 5 balls of 280 g plus 261 g leftover', () => {
    expect(result.balls).toEqual({ count: 5, weightG: 280, leftoverG: 261 });
  });

  it('offers 6 equal balls of ~277 g as the alternative split', () => {
    const equal = calculate(
      referenceInput({
        quantity: { mode: 'flour', flourKg: 1, ballWeightG: 280, split: 'equal' },
      }),
    );
    expect(equal.balls).toEqual({ count: 6, weightG: 277, leftoverG: 0 });
  });

  it('builds the timeline within one minute', () => {
    const { phases } = result.schedule;
    expect(formatClock(phase(phases, 'mix').startMs)).toBe('16:00');
    expect(phase(phases, 'mix').durationMin).toBe(13);
    expect(formatClock(phase(phases, 'rest').startMs)).toBe('16:13');
    expect(phase(phases, 'rest').durationMin).toBe(60);
    expect(formatClock(phase(phases, 'shape').startMs)).toBe('17:13');

    const rise = phase(phases, 'preFridgeRise');
    expect(formatClock(rise.startMs)).toBe('17:13');
    expect(Math.abs(rise.durationMin - 158)).toBeLessThanOrEqual(1);

    const fridge = phase(phases, 'fridge');
    expect(formatClock(fridge.startMs)).toBe('19:51');
    expect(Math.abs(fridge.durationMin - (19 * 60 + 14))).toBeLessThanOrEqual(1);

    const out = phase(phases, 'outOfFridge');
    expect(formatClock(out.startMs)).toBe('15:05');
    expect(Math.abs(out.durationMin - (4 * 60 + 25))).toBeLessThanOrEqual(1);

    expect(formatClock(phase(phases, 'bake').startMs)).toBe('19:30');
    expect(result.schedule.totalMin).toBe(27.5 * 60);
  });

  it('rates the pairings', () => {
    expect(result.suitability.pizzaOven).toBe('recommended');
    expect(result.suitability.flourW).toBe('discouraged'); // W 370 vs ideal 250-320
  });
});
