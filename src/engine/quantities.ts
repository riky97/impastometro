import type { QuantityInput } from './types';
import { dryYeastG, freshYeastG, needsDilution } from './yeast';

export interface Ingredients {
  flourG: number;
  waterG: number;
  saltG: number;
  oilG: number;
  freshYeastG: number;
  dryYeastG: number;
  yeastNeedsDilution: boolean;
  totalG: number;
}

export interface BallSplit {
  count: number;
  weightG: number;
  /** Dough left over after the balls (keep-weight split only). */
  leftoverG: number;
}

export interface Percentages {
  hydrationPct: number;
  saltPct: number;
  oilPct: number;
  yeastPct: number;
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

export function computeIngredients(quantity: QuantityInput, pct: Percentages): Ingredients {
  const doughRatio = 1 + (pct.hydrationPct + pct.saltPct + pct.oilPct + pct.yeastPct) / 100;
  const flourG =
    quantity.mode === 'flour'
      ? Math.round(quantity.flourKg * 1000)
      : Math.round((quantity.balls * quantity.ballWeightG) / doughRatio);

  const waterG = Math.round((flourG * pct.hydrationPct) / 100);
  const saltG = Math.round((flourG * pct.saltPct) / 100);
  const oilG = round1((flourG * pct.oilPct) / 100);
  const fresh = freshYeastG(flourG, pct.yeastPct);
  return {
    flourG,
    waterG,
    saltG,
    oilG,
    freshYeastG: fresh,
    dryYeastG: dryYeastG(fresh),
    yeastNeedsDilution: needsDilution(fresh),
    totalG: Math.round(flourG + waterG + saltG + oilG + fresh),
  };
}

export function splitBalls(quantity: QuantityInput, totalG: number): BallSplit {
  if (quantity.mode === 'balls') {
    return { count: quantity.balls, weightG: quantity.ballWeightG, leftoverG: 0 };
  }
  if (quantity.split === 'keep-weight') {
    const count = Math.floor(totalG / quantity.ballWeightG);
    return {
      count,
      weightG: quantity.ballWeightG,
      leftoverG: Math.round(totalG - count * quantity.ballWeightG),
    };
  }
  const count = Math.max(1, Math.round(totalG / quantity.ballWeightG));
  return { count, weightG: Math.round(totalG / count), leftoverG: 0 };
}
