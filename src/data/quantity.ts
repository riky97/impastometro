export const QUANTITY_LIMITS = {
  flourKg: { min: 0.25, max: 10 },
  ballG: { min: 220, max: 330, default: 280 },
  balls: { min: 1, max: 60, default: 6 },
} as const;
