import { WATER_TEMP_LIMITS } from '../data/fermentation';
import { METHODS, type MethodId } from '../data/methods';
import type { PizzaProfile } from '../data/profiles';
import { clamp } from './hydration';

export const targetDoughTempC = (profile: PizzaProfile): number =>
  (profile.targetDoughTempC.min + profile.targetDoughTempC.max) / 2;

/** Desired-dough-temperature formula: 3 * target - flour - ambient - friction, clamped. */
export function waterTempC(
  profile: PizzaProfile,
  method: MethodId,
  flourTempC: number,
  ambientTempC: number,
): number {
  const raw = 3 * targetDoughTempC(profile) - flourTempC - ambientTempC - METHODS[method].frictionC;
  return Math.round(clamp(raw, WATER_TEMP_LIMITS.minC, WATER_TEMP_LIMITS.maxC) * 10) / 10;
}
