import { WATER_STAGES } from '../data/fermentation';
import { METHODS } from '../data/methods';
import { findModel } from '../data/oven-models';
import { PROFILES, type ExtraId } from '../data/profiles';
import { buildProcedure, type PhaseProcedure } from '../data/procedures.it';
import {
  clamp,
  hydrationBounds,
  midW,
  oilBounds,
  waterPerKgG,
  type HydrationBounds,
} from './hydration';
import { computeIngredients, splitBalls, type BallSplit, type Ingredients } from './quantities';
import { buildSchedule } from './schedule';
import { pizzaOvenSuitability, wSuitability } from './suitability';
import type { CalcInput, Route, Schedule, Suitability, ValidationIssue } from './types';
import { validateInputs, validateTime } from './validation';
import { targetDoughTempC, waterTempC } from './water';

export interface CalcResult {
  valid: boolean;
  issues: ValidationIssue[];
  hydration: HydrationBounds & { value: number };
  waterPerKgG: number;
  oilPct: number;
  waterTempC: number;
  targetDoughTempC: { min: number; max: number };
  /** False for Recco: no yeast row, no fermentation. */
  leavened: boolean;
  /** What one piece is: a ball, a tray or a loaf. */
  unit: 'ball' | 'tray' | 'loaf';
  /** The route actually planned: a product that has no fridge route always gets the direct one. */
  route: Route;
  ingredients: Ingredients;
  /** Brine, pan oil, cheese...: grams for the whole batch. */
  extras: { id: ExtraId; g: number }[];
  balls: BallSplit;
  schedule: Schedule;
  procedure: PhaseProcedure[];
  suitability: { pizzaOven: Suitability; flourW: Suitability };
}

/** The single entry point: user inputs in, everything derived out. Pure and UI-free. */
export function calculate(input: CalcInput): CalcResult {
  const profile = PROFILES[input.pizzaId];
  const method = METHODS[input.method];
  const wMid = midW(input.wMin, input.wMax);

  const bounds = hydrationBounds(profile, input.method, wMid);
  const hydrationPct = clamp(input.hydrationPct, bounds.min, bounds.max);
  const oil = oilBounds(profile);
  const oilPct = clamp(input.oilPct, oil.min, oil.max);
  const saltPct = profile.saltPct;
  const target = targetDoughTempC(profile);

  const route: Route = profile.routes.includes(input.route)
    ? input.route
    : (profile.routes[0] ?? 'no-fridge');
  const product = {
    timing: profile.timing,
    yeastFactor: profile.yeastFactor,
    leavened: profile.leavened,
  };
  const planned = buildSchedule({
    startMs: input.startMs,
    bakeMs: input.bakeMs,
    route,
    ambientTempC: input.ambientTempC,
    mixingMin: method.mixingMin,
    targetDoughTempC: target,
    ...product,
  });
  // A measured dough temperature re-plans the schedule, with the yeast already weighed.
  const schedule =
    input.doughTempC == null
      ? planned
      : buildSchedule({
          startMs: input.startMs,
          bakeMs: input.bakeMs,
          route,
          ambientTempC: input.ambientTempC,
          mixingMin: method.mixingMin,
          targetDoughTempC: target,
          doughTempC: input.doughTempC,
          fixedYeastPct: planned.yeastPct,
          ...product,
        });

  const ingredients = computeIngredients(input.quantity, {
    hydrationPct,
    saltPct,
    oilPct,
    yeastPct: planned.yeastPct,
  });
  const balls = splitBalls(input.quantity, ingredients.totalG);
  const batchDoughG = balls.count * balls.weightG;
  const extras = profile.extras.map((e) => ({
    id: e.id,
    g: Math.round(e.perDoughG * batchDoughG),
  }));
  const water = waterTempC(profile, input.method, input.flourTempC, input.ambientTempC);
  const waterStages =
    input.method === 'mano'
      ? 1
      : hydrationPct > WATER_STAGES.threeAbovePct
        ? 3
        : hydrationPct > WATER_STAGES.twoAbovePct
          ? 2
          : 1;

  const issues = [
    ...validateInputs(input),
    ...validateTime({ ...input, route }, schedule, method.mixingMin),
  ];

  return {
    valid: issues.length === 0,
    issues,
    hydration: { ...bounds, value: hydrationPct },
    waterPerKgG: waterPerKgG(hydrationPct),
    oilPct,
    waterTempC: water,
    targetDoughTempC: profile.targetDoughTempC,
    leavened: profile.leavened,
    unit: profile.unit.kind,
    route,
    ingredients,
    extras,
    balls,
    schedule,
    procedure: buildProcedure({
      profile,
      method: input.method,
      container: input.container,
      oven: input.ovenId,
      model: findModel(input.ovenId, input.ovenModelId),
      route,
      waterStages,
      waterTempC: water,
      ballCount: balls.count,
      ballWeightG: balls.weightG,
    }),
    suitability: {
      pizzaOven: pizzaOvenSuitability(input.pizzaId, input.ovenId),
      flourW: wSuitability(profile, wMid),
    },
  };
}
