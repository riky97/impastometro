import { OIL_LIMITS, W_CAP } from '../data/flour';
import { METHODS, type MethodId } from '../data/methods';
import type { PizzaProfile } from '../data/profiles';

export interface HydrationBounds {
  min: number;
  max: number;
  recommended: number;
}

export const midW = (wMin: number, wMax: number): number => (wMin + wMax) / 2;

/** Hydration range = min(profile max, method cap, W cap); the minimum shrinks if the cap is lower. */
export function hydrationBounds(
  profile: PizzaProfile,
  method: MethodId,
  wMid: number,
): HydrationBounds {
  const cap = Math.min(
    profile.hydrationPct.max,
    METHODS[method].maxHydrationPct,
    W_CAP.base + W_CAP.perW * wMid,
  );
  const max = Math.floor(cap);
  const min = Math.min(profile.hydrationPct.min, max);
  return { min, max, recommended: Math.min(profile.hydrationPct.default, max) };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Grams of water to weigh per 1 kg of flour. */
export const waterPerKgG = (hydrationPct: number): number => hydrationPct * 10;

export function oilBounds(profile: PizzaProfile): { min: number; max: number } {
  if (profile.oil.locked) return { min: 0, max: 0 };
  return { min: OIL_LIMITS.minPct, max: Math.min(OIL_LIMITS.maxPct, profile.oil.maxPct) };
}
