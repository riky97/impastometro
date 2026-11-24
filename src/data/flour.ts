export const W_LIMITS = { min: 150, max: 450 } as const;
/** W points around the ideal range that are still rated "da valutare". */
export const W_TOLERANCE = 30; // ASSUMPTION
export const DEFAULT_W = { min: 280, max: 320 } as const;

/** Hydration cap from flour strength: base + perW * W. */
export const W_CAP = { base: 50, perW: 0.06 } as const; // ASSUMPTION

export const OIL_LIMITS = { minPct: 0, maxPct: 12 } as const;
export const DEFAULT_FLOUR_TEMP_C = 23;
export const DEFAULT_AMBIENT_TEMP_C = 23;
