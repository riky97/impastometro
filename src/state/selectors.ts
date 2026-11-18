import { PROFILES } from '../data/profiles';
import { hydrationBounds, midW } from '../engine/hydration';
import { parseLocalDateTime } from '../engine/dates';
import type { CalcInput } from '../engine/types';
import type { WizardState } from './schema';

/** Maps stored user inputs to the engine's input. Pure; "null = default" is resolved here. */
export function toCalcInput(state: WizardState): CalcInput {
  const profile = PROFILES[state.pizzaId];
  const bounds = hydrationBounds(profile, state.method, midW(state.wMin, state.wMax));
  const ballWeightG = state.ballWeightG ?? profile.ballG.default;
  return {
    pizzaId: state.pizzaId,
    method: state.method,
    container: state.container,
    ovenId: state.ovenId,
    ovenModelId: state.ovenModelId,
    wMin: state.wMin,
    wMax: state.wMax,
    hydrationPct: state.hydrationPct ?? bounds.recommended,
    oilPct: state.oilPct,
    flourTempC: state.flourTempC,
    quantity:
      state.quantityMode === 'balls'
        ? { mode: 'balls', balls: state.balls, ballWeightG }
        : { mode: 'flour', flourKg: state.flourKg, ballWeightG, split: state.split },
    startMs: parseLocalDateTime(state.startLocal) ?? NaN,
    bakeMs: parseLocalDateTime(state.bakeLocal) ?? NaN,
    route: state.route,
    ambientTempC: state.ambientTempC,
    doughTempC: state.doughTempC,
  };
}
