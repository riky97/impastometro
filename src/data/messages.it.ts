/** Italian UI messages keyed by engine codes. Engine code never contains user-facing text. */
export const SUITABILITY_LABELS = {
  recommended: 'Consigliato',
  evaluate: 'Da valutare',
  discouraged: 'Sconsigliato',
} as const;

export const W_SUITABILITY_LABELS = {
  recommended: 'Consigliata',
  evaluate: 'Da valutare',
  discouraged: 'Sconsigliata',
} as const;

type Params = Record<string, number>;

export const ISSUE_MESSAGES: Record<string, (p: Params) => string> = {
  'w-out-of-range': (p) => `La forza W deve essere tra ${p.min} e ${p.max}.`,
  'w-min-above-max': () => 'Il W minimo non può essere maggiore del W massimo.',
  'flour-out-of-range': (p) => `La farina deve essere tra ${p.min} e ${p.max} kg.`,
  'balls-out-of-range': (p) => `Il numero deve essere tra ${p.min} e ${p.max}.`,
  'ball-weight-out-of-range': (p) => `Il peso deve essere tra ${p.min} e ${p.max} g.`,
  'invalid-date': () => 'Inserisci una data e un’ora valide.',
  'bake-before-start': () => 'La cottura deve essere dopo l’inizio dell’impasto.',
  'total-too-short': (p) =>
    `Servono almeno ${p.hours} ore, più ${p.mixingMin} minuti di impasto, tra inizio e cottura.`,
  'fridge-too-long': (p) =>
    `Il tempo in frigorifero supera il massimo di ${p.hours} ore: anticipa l’inizio o posticipa la cottura.`,
  'fridge-infeasible': () =>
    'Il tempo non basta per il percorso con frigorifero: scegli «Senza frigorifero» o allunga i tempi.',
};

export function describeIssue(issue: { code: string; params: Record<string, number> }): string {
  return ISSUE_MESSAGES[issue.code]?.(issue.params) ?? 'Controlla i dati inseriti.';
}

/** What a "piece" is called: a pizza ball, a focaccia tray or a loaf of bread. */
export const UNIT_LABELS = {
  ball: {
    one: 'panetto',
    many: 'panetti',
    count: 'Numero di panetti',
    weight: 'Peso del panetto',
    less: 'Un panetto in meno',
    more: 'Un panetto in più',
    equal: 'Tutto in panetti uguali',
  },
  tray: {
    one: 'teglia',
    many: 'teglie',
    count: 'Numero di teglie',
    weight: 'Peso per teglia',
    less: 'Una teglia in meno',
    more: 'Una teglia in più',
    equal: 'Tutto in teglie uguali',
  },
  loaf: {
    one: 'pagnotta',
    many: 'pagnotte',
    count: 'Numero di pagnotte',
    weight: 'Peso della pagnotta',
    less: 'Una pagnotta in meno',
    more: 'Una pagnotta in più',
    equal: 'Tutto in pagnotte uguali',
  },
} as const;

export type UnitKind = keyof typeof UNIT_LABELS;

export const unitName = (kind: UnitKind, count: number): string =>
  count === 1 ? UNIT_LABELS[kind].one : UNIT_LABELS[kind].many;

/** Extra ingredients that are not part of the dough. */
export const EXTRA_LABELS = {
  brineWater: 'Salamoia: acqua',
  brineOil: 'Salamoia: olio',
  brineSalt: 'Salamoia: sale',
  panOil: 'Olio per la teglia',
  cheese: 'Formaggio fresco (stracchino o crescenza)',
} as const;
