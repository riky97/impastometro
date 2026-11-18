export const METHOD_IDS = ['spirale', 'planetaria', 'mano'] as const;
export type MethodId = (typeof METHOD_IDS)[number];

export interface MethodConfig {
  id: MethodId;
  label: string;
  /** Maximum hydration (% of flour) this method can handle. */
  maxHydrationPct: number;
  /** Friction factor (°C) used by the desired-dough-temperature formula. */
  frictionC: number;
  /** Total mixing time in minutes. */
  mixingMin: number;
}

// ASSUMPTION: friction factors are calibrated so the reference case gives water at 10 °C.
// ASSUMPTION: mixing times for planetaria and hand are guesses (spirale is specified: 13 min).
export const METHODS: Record<MethodId, MethodConfig> = {
  spirale: { id: 'spirale', label: 'Spirale', maxHydrationPct: 75, frictionC: 19, mixingMin: 13 },
  planetaria: {
    id: 'planetaria',
    label: 'Planetaria',
    maxHydrationPct: 70,
    frictionC: 14,
    mixingMin: 20,
  },
  mano: { id: 'mano', label: 'A mano', maxHydrationPct: 65, frictionC: 4, mixingMin: 15 },
};
