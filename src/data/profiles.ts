import { OUT_OF_FRIDGE_TABLE, TIMING } from './fermentation';

/**
 * Historical note: the persisted key is still `pizzaId`, so old saved state and old backup files
 * stay valid. It now holds any product id.
 */
export const PRODUCT_IDS = ['classica', 'contemporanea', 'genovese', 'recco', 'pane'] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

/** The two pizzas, the original choice of the first wizard step. */
export const PIZZA_IDS = ['classica', 'contemporanea'] as const;

export type ProductKind = 'pizza' | 'focaccia' | 'recco' | 'pane';
export type RouteId = 'fridge' | 'no-fridge';

interface Range {
  min: number;
  max: number;
}

export interface Timing {
  /** Bulk rest after mixing (minutes). Ignored on the direct route when `proofMin` is set. */
  restMin: number;
  /** Fixed final proof (minutes). When set, the bulk rest absorbs the slack on the direct route. */
  proofMin?: number;
  /** Minutes before baking at which the last hands-on step happens (topping, brine, scoring). */
  toppingLeadMin: number;
  minTotalH: number;
  maxFridgeH: number;
  /** Start-to-bake duration a fresh calculation proposes (minutes). */
  defaultTotalMin: number;
  /** Minutes out of the fridge before baking, by ambient °C (linear interpolation). */
  outOfFridge: readonly { tempC: number; minutes: number }[];
}

/** Extra ingredient as a ratio of the dough weight of the whole batch (grams per gram of dough). */
export type ExtraId = 'brineWater' | 'brineOil' | 'brineSalt' | 'panOil' | 'cheese';
export interface ExtraRatio {
  id: ExtraId;
  perDoughG: number;
}

export interface ProductProfile {
  id: ProductId;
  kind: ProductKind;
  label: string;
  description: string;
  /** False for Recco: no yeast, no fermentation schedule. */
  leavened: boolean;
  routes: readonly RouteId[];
  hydrationPct: Range & { default: number };
  /** Salt as % of flour. */
  saltPct: number;
  /** Olive oil in the dough, % of flour: cap and the value a fresh calculation starts from. */
  oil: { maxPct: number; default: number };
  /** Multiplier on the yeast model k / E: richer or wetter doughs need more yeast. */
  yeastFactor: number;
  /** Suggested piece weight (slider range and default). A piece is a ball, a tray or a loaf. */
  ballG: Range & { default: number };
  unit: {
    kind: 'ball' | 'tray' | 'loaf';
    count: Range & { default: number };
    /** Hard validation limits for the weight of one piece. */
    limitsG: Range;
  };
  targetDoughTempC: Range;
  /** W range in which this flour strength is "recommended". */
  idealW: Range;
  /** Fridge window the profile prefers (hours), informational. */
  preferredFridgeH: Range;
  timing: Timing;
  extras: readonly ExtraRatio[];
  /** Salt goes in after this many minutes of mixing, or after the first water stage. */
  saltAddition: { kind: 'after-minutes'; minutes: number } | { kind: 'after-first-water-stage' };
}

const PIZZA_TIMING: Timing = {
  restMin: TIMING.restMin,
  toppingLeadMin: TIMING.toppingLeadMin,
  minTotalH: TIMING.minTotalH,
  maxFridgeH: TIMING.maxFridgeH,
  defaultTotalMin: TIMING.defaultTotalMin,
  outOfFridge: OUT_OF_FRIDGE_TABLE,
};
const PIZZA_UNIT = {
  kind: 'ball',
  count: { min: 1, max: 60, default: 6 },
  limitsG: { min: 220, max: 330 },
} as const;

// Source basis for classica: AVPN disciplinare (hydration ~55-62%, W 250-320).
export const CLASSICA: ProductProfile = {
  id: 'classica',
  kind: 'pizza',
  label: 'Napoletana classica',
  description: 'Tradizionale: idratazione contenuta, cornicione morbido, cottura rapida.',
  leavened: true,
  routes: ['fridge', 'no-fridge'],
  hydrationPct: { min: 55, max: 63, default: 63 },
  saltPct: 3.0,
  oil: { maxPct: 1, default: 0 }, // ASSUMPTION: the disciplinare has no oil; a small optional amount
  yeastFactor: 1,
  ballG: { min: 220, max: 330, default: 280 },
  unit: PIZZA_UNIT,
  targetDoughTempC: { min: 24, max: 26 },
  idealW: { min: 250, max: 320 },
  preferredFridgeH: { min: 8, max: 24 }, // ASSUMPTION
  timing: PIZZA_TIMING,
  extras: [],
  saltAddition: { kind: 'after-minutes', minutes: 3 },
};

// ASSUMPTION: the whole contemporanea profile is a reconstruction from public knowledge.
export const CONTEMPORANEA: ProductProfile = {
  id: 'contemporanea',
  kind: 'pizza',
  label: 'Napoletana contemporanea',
  description: 'Più idratata e alveolata, maturazione lunga in frigo, cornicione soffice.',
  leavened: true,
  routes: ['fridge', 'no-fridge'],
  hydrationPct: { min: 65, max: 75, default: 68 },
  saltPct: 2.4,
  oil: { maxPct: 2, default: 0 },
  yeastFactor: 1,
  ballG: { min: 230, max: 280, default: 260 },
  unit: PIZZA_UNIT,
  targetDoughTempC: { min: 23, max: 25 },
  idealW: { min: 300, max: 360 },
  preferredFridgeH: { min: 24, max: 48 },
  timing: PIZZA_TIMING,
  extras: [],
  saltAddition: { kind: 'after-first-water-stage' },
};

// ASSUMPTION: every number of the products below is reconstructed from public recipes
// (see docs/plan-focacce-pane.md) and not yet calibrated against a real bake.
export const GENOVESE: ProductProfile = {
  id: 'genovese',
  kind: 'focaccia',
  label: 'Focaccia genovese',
  description: 'Alta e morbida, con olio e salamoia, cotta in teglia nel forno di casa.',
  leavened: true,
  routes: ['fridge', 'no-fridge'],
  hydrationPct: { min: 62, max: 75, default: 66 },
  saltPct: 2.2,
  oil: { maxPct: 8, default: 5 },
  yeastFactor: 2,
  // One piece is one tray: about 0.5 g of dough per cm2 (600 g for a 30x40 tray).
  ballG: { min: 200, max: 1500, default: 600 },
  unit: { kind: 'tray', count: { min: 1, max: 6, default: 1 }, limitsG: { min: 200, max: 1500 } },
  targetDoughTempC: { min: 24, max: 26 },
  idealW: { min: 220, max: 300 },
  preferredFridgeH: { min: 12, max: 48 },
  timing: {
    restMin: 60,
    toppingLeadMin: 20, // brine and finger dimples, then a short rest before the oven
    minTotalH: 4,
    maxFridgeH: 72,
    defaultTotalMin: 20 * 60, // overnight in the fridge, baked the next day at lunch
    outOfFridge: [
      { tempC: 18, minutes: 210 },
      { tempC: 24, minutes: 150 },
      { tempC: 30, minutes: 120 },
    ],
  },
  // Per gram of dough: brine of 2 parts water to 1 part oil (180 g for a 600 g tray), salt ~9 % of
  // the brine water, and oil for the pan.
  extras: [
    { id: 'brineWater', perDoughG: 0.2 },
    { id: 'brineOil', perDoughG: 0.1 },
    { id: 'brineSalt', perDoughG: 0.018 },
    { id: 'panOil', perDoughG: 0.04 },
  ],
  saltAddition: { kind: 'after-first-water-stage' },
};

export const RECCO: ProductProfile = {
  id: 'recco',
  kind: 'recco',
  label: 'Focaccia di Recco',
  description:
    'Senza lievito: due sfoglie sottilissime con formaggio fresco, cotta ad alta temperatura.',
  leavened: false,
  routes: ['no-fridge'],
  hydrationPct: { min: 46, max: 55, default: 50 },
  saltPct: 2,
  oil: { maxPct: 12, default: 10 },
  yeastFactor: 0,
  ballG: { min: 150, max: 900, default: 300 },
  unit: { kind: 'tray', count: { min: 1, max: 6, default: 1 }, limitsG: { min: 150, max: 900 } },
  targetDoughTempC: { min: 22, max: 24 },
  idealW: { min: 280, max: 340 },
  preferredFridgeH: { min: 0, max: 0 },
  timing: {
    restMin: 30,
    toppingLeadMin: 20, // rolling the two sheets and filling them
    minTotalH: 1,
    maxFridgeH: 0,
    defaultTotalMin: 2 * 60,
    outOfFridge: OUT_OF_FRIDGE_TABLE,
  },
  // ASSUMPTION: about 1 g of fresh soft cheese per g of dough (one secondary source, unverified).
  extras: [{ id: 'cheese', perDoughG: 1 }],
  saltAddition: { kind: 'after-first-water-stage' },
};

export const PANE: ProductProfile = {
  id: 'pane',
  kind: 'pane',
  label: 'Pane',
  description: 'Pane comune a lievitazione diretta, in pagnotte o filoni, cotto nel forno di casa.',
  leavened: true,
  routes: ['no-fridge'],
  hydrationPct: { min: 58, max: 70, default: 65 },
  saltPct: 2,
  oil: { maxPct: 2, default: 0 },
  yeastFactor: 2.5,
  ballG: { min: 250, max: 1500, default: 500 },
  unit: { kind: 'loaf', count: { min: 1, max: 12, default: 2 }, limitsG: { min: 250, max: 1500 } },
  targetDoughTempC: { min: 24, max: 26 },
  idealW: { min: 220, max: 300 },
  preferredFridgeH: { min: 0, max: 0 },
  timing: {
    restMin: 60,
    proofMin: 50, // final proof after shaping; the bulk rise takes the rest of the time
    toppingLeadMin: 10, // scoring and loading the oven
    minTotalH: 3,
    maxFridgeH: 0,
    defaultTotalMin: 5 * 60,
    outOfFridge: OUT_OF_FRIDGE_TABLE,
  },
  extras: [],
  saltAddition: { kind: 'after-first-water-stage' },
};

export const PROFILES: Record<ProductId, ProductProfile> = {
  classica: CLASSICA,
  contemporanea: CONTEMPORANEA,
  genovese: GENOVESE,
  recco: RECCO,
  pane: PANE,
};
