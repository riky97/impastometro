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
  'balls-out-of-range': (p) => `Il numero di panetti deve essere tra ${p.min} e ${p.max}.`,
  'ball-weight-out-of-range': (p) => `Il peso del panetto deve essere tra ${p.min} e ${p.max} g.`,
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
