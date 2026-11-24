import { OVENS } from '../data/ovens';
import type { UnitKind } from '../data/messages.it';
import type { ProductId } from '../data/profiles';
import { calculate } from '../engine/calculate';
import type { WizardState } from './schema';
import { toCalcInput } from './selectors';

/** What a recipe shows at a glance. */
export interface RecipeSummary {
  pizzaId: ProductId;
  unit: UnitKind;
  balls: number;
  ballWeightG: number;
  hydrationPct: number;
  flourG: number;
  oven: string;
}

/** Computed from the inputs with throw-away dates: the engine is the only source of numbers. */
export function summarize(inputs: WizardState): RecipeSummary {
  const result = calculate(toCalcInput(inputs));
  return {
    pizzaId: inputs.pizzaId,
    unit: result.unit,
    balls: result.balls.count,
    ballWeightG: result.balls.weightG,
    hydrationPct: result.hydration.value,
    flourG: result.ingredients.flourG,
    oven: OVENS[inputs.ovenId].label,
  };
}
