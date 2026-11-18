/** Fresh yeast model: pct = k / E, with E = ambientHours + fridgeHours * fridgeWeight. */
export const YEAST = {
  // ASSUMPTION: k is calibrated so the reference case yields 1.0 g per kg of flour (0.1%).
  k: 1.3075,
  fridgeWeight: 0.25,
  minPct: 0.03,
  maxPct: 1.5,
  dryRatio: 1 / 3,
  /** Below this many grams per batch, show the "dilute in water" hint. */
  diluteBelowG: 0.5,
} as const;

/** Bench rise until ~+30% volume. ASSUMPTION: calibrated on the reference case. */
export const BENCH_RISE = {
  refMin: 158, // 2 h 38 at refYeastPct and refTempC
  refYeastPct: 0.1,
  refTempC: 23,
  yeastExponent: 0.5, // duration ~ (refYeast / yeast) ^ exponent
  q10: 2, // fermentation speed doubles every 10 °C
} as const;

/** Minutes the balls must sit out of the fridge before baking, by ambient °C (linear interp). */
export const OUT_OF_FRIDGE_TABLE: readonly { tempC: number; minutes: number }[] = [
  { tempC: 18, minutes: 390 }, // ASSUMPTION: 6-7 h at 18 °C
  { tempC: 24, minutes: 240 },
  { tempC: 30, minutes: 180 },
];

/** Out-of-fridge reductions after long cold maturation (real fridge hours). Highest first. */
export const OUT_OF_FRIDGE_REDUCTION: readonly { afterHours: number; factor: number }[] = [
  { afterHours: 72, factor: 0.85 },
  { afterHours: 48, factor: 0.9 },
];

export const TIMING = {
  restMin: 60,
  /** Minutes before baking at which the balls are stretched and topped. */
  toppingLeadMin: 10, // ASSUMPTION
  minTotalH: 6,
  maxFridgeH: 72,
  defaultTotalMin: 27.5 * 60,
} as const;

/** Desired dough temperature: water = 3 * target - flour - ambient - friction. */
export const WATER_TEMP_LIMITS = { minC: 5, maxC: 30 } as const;

/** Machine mixers add the water in stages above these hydrations (%). */
export const WATER_STAGES = { twoAbovePct: 68, threeAbovePct: 72 } as const; // ASSUMPTION
