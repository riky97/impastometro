export const PIZZA_IDS = ['classica', 'contemporanea'] as const;
export type PizzaId = (typeof PIZZA_IDS)[number];

interface Range {
  min: number;
  max: number;
}

interface ProfileBase {
  label: string;
  description: string;
  hydrationPct: Range & { default: number };
  /** Salt as % of flour. */
  saltPct: number;
  ballG: Range & { default: number };
  targetDoughTempC: Range;
  /** W range in which this flour strength is "recommended". */
  idealW: Range;
  /** Fridge window the profile prefers (hours), informational. */
  preferredFridgeH: Range;
  /** Olive oil is optional, as % of flour, from 0 up to this cap. */
  oil: { maxPct: number };
}

export interface ClassicaProfile extends ProfileBase {
  id: 'classica';
  /** Salt goes in after this many minutes of mixing. */
  saltAddition: { kind: 'after-minutes'; minutes: number };
}

export interface ContemporaneaProfile extends ProfileBase {
  id: 'contemporanea';
  saltAddition: { kind: 'after-first-water-stage' };
  saltRangePct: Range;
}

export type PizzaProfile = ClassicaProfile | ContemporaneaProfile;

// Source basis for classica: AVPN disciplinare (hydration ~55-62%, W 250-320).
export const CLASSICA: ClassicaProfile = {
  id: 'classica',
  label: 'Napoletana classica',
  description: 'Tradizionale: idratazione contenuta, cornicione morbido, cottura rapida.',
  hydrationPct: { min: 55, max: 63, default: 63 },
  saltPct: 3.0,
  ballG: { min: 220, max: 330, default: 280 },
  targetDoughTempC: { min: 24, max: 26 },
  idealW: { min: 250, max: 320 },
  preferredFridgeH: { min: 8, max: 24 }, // ASSUMPTION
  oil: { maxPct: 1 }, // ASSUMPTION: the disciplinare has no oil; a small optional amount
  saltAddition: { kind: 'after-minutes', minutes: 3 },
};

// ASSUMPTION: the whole contemporanea profile is a reconstruction from public knowledge.
export const CONTEMPORANEA: ContemporaneaProfile = {
  id: 'contemporanea',
  label: 'Napoletana contemporanea',
  description: 'Più idratata e alveolata, maturazione lunga in frigo, cornicione soffice.',
  hydrationPct: { min: 65, max: 75, default: 68 },
  saltPct: 2.4,
  saltRangePct: { min: 2.2, max: 2.6 },
  ballG: { min: 230, max: 280, default: 260 },
  targetDoughTempC: { min: 23, max: 25 },
  idealW: { min: 300, max: 360 },
  preferredFridgeH: { min: 24, max: 48 },
  oil: { maxPct: 2 },
  saltAddition: { kind: 'after-first-water-stage' },
};

export const PROFILES: Record<PizzaId, PizzaProfile> = {
  classica: CLASSICA,
  contemporanea: CONTEMPORANEA,
};
