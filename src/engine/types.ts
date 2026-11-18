import type { ContainerId } from '../data/containers';
import type { MethodId } from '../data/methods';
import type { OvenId } from '../data/ovens';
import type { PizzaId } from '../data/profiles';

export type Route = 'fridge' | 'no-fridge';
export type SplitMode = 'keep-weight' | 'equal';

export type QuantityInput =
  | { mode: 'balls'; balls: number; ballWeightG: number }
  | { mode: 'flour'; flourKg: number; ballWeightG: number; split: SplitMode };

/** Everything the user decides. The store holds exactly this (plus wizard bookkeeping). */
export interface CalcInput {
  pizzaId: PizzaId;
  method: MethodId;
  container: ContainerId;
  ovenId: OvenId;
  ovenModelId: string | null;
  wMin: number;
  wMax: number;
  hydrationPct: number;
  oilPct: number;
  flourTempC: number;
  quantity: QuantityInput;
  startMs: number;
  bakeMs: number;
  route: Route;
  ambientTempC: number;
  /** Measured dough temperature after mixing (optional). */
  doughTempC: number | null;
}

export type Suitability = 'recommended' | 'evaluate' | 'discouraged';

export type PhaseId =
  | 'mix'
  | 'rest'
  | 'shape'
  | 'preFridgeRise'
  | 'fridge'
  | 'outOfFridge'
  | 'ambientRise'
  | 'topping'
  | 'bake';

export interface Phase {
  id: PhaseId;
  startMs: number;
  /** Minutes. Milestones (shape, topping, bake) have 0. */
  durationMin: number;
  kind: 'span' | 'milestone';
}

export interface Schedule {
  phases: Phase[];
  yeastPct: number;
  /** Effective fermentation hours E used by the yeast model. */
  effectiveHours: number;
  totalMin: number;
  fridgeMin: number;
  /** False when the fridge route does not fit between start and bake. */
  feasible: boolean;
}

export type IssueCode =
  | 'w-out-of-range'
  | 'w-min-above-max'
  | 'flour-out-of-range'
  | 'balls-out-of-range'
  | 'ball-weight-out-of-range'
  | 'invalid-date'
  | 'bake-before-start'
  | 'total-too-short'
  | 'fridge-too-long'
  | 'fridge-infeasible';

export interface ValidationIssue {
  code: IssueCode;
  field: 'flour' | 'quantity' | 'time';
  /** Numbers to interpolate in the message (limits, values). */
  params: Record<string, number>;
}
