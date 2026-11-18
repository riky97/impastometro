import { YEAST } from '../data/fermentation';
import { clamp } from './hydration';

/** Effective fermentation hours: the cold hours count for a fraction of the warm ones. */
export const effectiveHours = (ambientH: number, fridgeH: number): number =>
  ambientH + fridgeH * YEAST.fridgeWeight;

/** Fresh brewer's yeast as % of flour. */
export function yeastPct(effHours: number): number {
  return clamp(YEAST.k / Math.max(effHours, 0.5), YEAST.minPct, YEAST.maxPct);
}

/** Grams for the batch: 0.1 g resolution, 0.01 g below the dilution threshold. */
export function freshYeastG(flourG: number, pct: number): number {
  const raw = (flourG * pct) / 100;
  return raw < YEAST.diluteBelowG ? Math.round(raw * 100) / 100 : Math.round(raw * 10) / 10;
}

export const dryYeastG = (freshG: number): number =>
  Math.round(freshG * YEAST.dryRatio * 100) / 100;

export const needsDilution = (freshG: number): boolean => freshG < YEAST.diluteBelowG;
