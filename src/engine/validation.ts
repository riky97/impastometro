import { W_LIMITS } from '../data/flour';
import { PROFILES } from '../data/profiles';
import { QUANTITY_LIMITS } from '../data/quantity';
import type { CalcInput, Schedule, ValidationIssue } from './types';

const issue = (
  code: ValidationIssue['code'],
  field: ValidationIssue['field'],
  params: Record<string, number> = {},
): ValidationIssue => ({ code, field, params });

/** Input checks that do not need the schedule. */
export function validateInputs(input: CalcInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { wMin, wMax, quantity } = input;
  const { unit } = PROFILES[input.pizzaId];
  if (wMin > wMax) issues.push(issue('w-min-above-max', 'flour'));
  if (wMin < W_LIMITS.min || wMax > W_LIMITS.max) {
    issues.push(issue('w-out-of-range', 'flour', { min: W_LIMITS.min, max: W_LIMITS.max }));
  }
  if (quantity.mode === 'flour') {
    const { min, max } = QUANTITY_LIMITS.flourKg;
    if (quantity.flourKg < min || quantity.flourKg > max) {
      issues.push(issue('flour-out-of-range', 'quantity', { min, max }));
    }
  } else {
    const { min, max } = unit.count;
    if (!Number.isInteger(quantity.balls) || quantity.balls < min || quantity.balls > max) {
      issues.push(issue('balls-out-of-range', 'quantity', { min, max }));
    }
  }
  const { min: bMin, max: bMax } = unit.limitsG;
  if (quantity.ballWeightG < bMin || quantity.ballWeightG > bMax) {
    issues.push(issue('ball-weight-out-of-range', 'quantity', { min: bMin, max: bMax }));
  }
  return issues;
}

/** Time checks; `schedule` is the plan built for the same input. */
export function validateTime(
  input: CalcInput,
  schedule: Schedule,
  mixingMin: number,
): ValidationIssue[] {
  if (!Number.isFinite(input.startMs) || !Number.isFinite(input.bakeMs)) {
    return [issue('invalid-date', 'time')];
  }
  if (input.bakeMs <= input.startMs) return [issue('bake-before-start', 'time')];

  const issues: ValidationIssue[] = [];
  const { timing } = PROFILES[input.pizzaId];
  const neededMin = timing.minTotalH * 60 + mixingMin;
  if (schedule.totalMin < neededMin) {
    issues.push(issue('total-too-short', 'time', { hours: timing.minTotalH, mixingMin }));
  }
  if (input.route === 'fridge') {
    if (!schedule.feasible) issues.push(issue('fridge-infeasible', 'time'));
    if (schedule.fridgeMin / 60 > timing.maxFridgeH) {
      issues.push(issue('fridge-too-long', 'time', { hours: timing.maxFridgeH }));
    }
  }
  return issues;
}
