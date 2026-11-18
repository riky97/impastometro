import { parseLocalDateTime } from './dates';
import type { CalcInput } from './types';

/** The reference case from the spec; tests override single fields. */
export function referenceInput(overrides: Partial<CalcInput> = {}): CalcInput {
  return {
    pizzaId: 'classica',
    method: 'spirale',
    container: 'cassettine',
    ovenId: 'electric',
    ovenModelId: 'ooni-volt-2',
    wMin: 360,
    wMax: 380, // midpoint 370
    hydrationPct: 63,
    oilPct: 0,
    flourTempC: 23,
    quantity: { mode: 'flour', flourKg: 1, ballWeightG: 280, split: 'keep-weight' },
    startMs: parseLocalDateTime('2026-11-14T16:00') ?? NaN,
    bakeMs: parseLocalDateTime('2026-11-15T19:30') ?? NaN,
    route: 'fridge',
    ambientTempC: 23,
    doughTempC: null,
    ...overrides,
  };
}
