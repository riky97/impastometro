import { addMinutes, formatLocalDateTime, parseLocalDateTime } from '../engine/dates';
import { DEFAULT_AMBIENT_TEMP_C, DEFAULT_FLOUR_TEMP_C, DEFAULT_W } from '../data/flour';
import { TIMING } from '../data/fermentation';
import { DEFAULT_OVEN } from '../data/ovens';
import { PROFILES, type ProductId } from '../data/profiles';
import { QUANTITY_LIMITS } from '../data/quantity';
import { SCHEMA_VERSION, type WizardState } from './schema';

/** Defaults for a fresh calculation. `nowMs` is a parameter so this stays testable. */
export function createDefaultState(nowMs: number): WizardState {
  const startMs = Math.floor(nowMs / 60_000) * 60_000;
  return {
    version: SCHEMA_VERSION,
    step: 1,
    confirmed: [false, false, false, false],
    showResult: false,
    pizzaId: 'classica',
    method: 'spirale',
    container: 'cassettine',
    ovenId: DEFAULT_OVEN,
    ovenModelId: null,
    wMin: DEFAULT_W.min,
    wMax: DEFAULT_W.max,
    hydrationPct: null,
    oilPct: 0,
    flourTempC: DEFAULT_FLOUR_TEMP_C,
    quantityMode: 'balls',
    balls: QUANTITY_LIMITS.balls.default,
    flourKg: 1,
    ballWeightG: null,
    split: 'keep-weight',
    startLocal: formatLocalDateTime(startMs),
    bakeLocal: formatLocalDateTime(addMinutes(startMs, TIMING.defaultTotalMin)),
    route: 'fridge',
    ambientTempC: DEFAULT_AMBIENT_TEMP_C,
    doughTempC: null,
    showDryYeast: false,
  };
}

/** The bake time a product proposes for a given start; null when the start is not a valid date. */
export function defaultBakeLocal(startLocal: string, productId: ProductId): string | null {
  const startMs = parseLocalDateTime(startLocal);
  return startMs === null
    ? null
    : formatLocalDateTime(addMinutes(startMs, PROFILES[productId].timing.defaultTotalMin));
}
