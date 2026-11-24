import { W_TOLERANCE } from '../data/flour';
import type { OvenId } from '../data/ovens';
import { PROFILES, type ProductId, type ProductProfile } from '../data/profiles';
import type { Suitability } from './types';

/** Pizza + oven: classica on a home oven is discouraged, contemporanea there is "to evaluate". Not a pizza: always fine. */
export function pizzaOvenSuitability(pizza: ProductId, oven: OvenId): Suitability {
  if (oven !== 'home' || PROFILES[pizza].kind !== 'pizza') return 'recommended';
  return pizza === 'classica' ? 'discouraged' : 'evaluate';
}

/** Flour strength vs the profile's ideal W range (uses the midpoint of the user's range). */
export function wSuitability(profile: ProductProfile, wMid: number): Suitability {
  const { min, max } = profile.idealW;
  if (wMid >= min && wMid <= max) return 'recommended';
  const distance = wMid < min ? min - wMid : wMid - max;
  return distance <= W_TOLERANCE ? 'evaluate' : 'discouraged';
}
