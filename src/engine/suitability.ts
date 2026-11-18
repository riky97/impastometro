import { W_TOLERANCE } from '../data/flour';
import type { OvenId } from '../data/ovens';
import type { PizzaId, PizzaProfile } from '../data/profiles';
import type { Suitability } from './types';

/** Pizza + oven: classica on a home oven is discouraged, contemporanea there is "to evaluate". */
export function pizzaOvenSuitability(pizza: PizzaId, oven: OvenId): Suitability {
  if (oven !== 'home') return 'recommended';
  return pizza === 'classica' ? 'discouraged' : 'evaluate';
}

/** Flour strength vs the profile's ideal W range (uses the midpoint of the user's range). */
export function wSuitability(profile: PizzaProfile, wMid: number): Suitability {
  const { min, max } = profile.idealW;
  if (wMid >= min && wMid <= max) return 'recommended';
  const distance = wMid < min ? min - wMid : wMid - max;
  return distance <= W_TOLERANCE ? 'evaluate' : 'discouraged';
}
