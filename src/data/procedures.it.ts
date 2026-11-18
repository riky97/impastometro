import { BAKE } from './bake';
import type { ContainerId } from './containers';
import type { MethodId } from './methods';
import type { OvenModel } from './oven-models';
import type { OvenId } from './ovens';
import type { PizzaProfile } from './profiles';

/** Italian procedure texts. Plain data in, plain strings out: no engine imports. */

type PhaseKey =
  | 'mix'
  | 'rest'
  | 'shape'
  | 'preFridgeRise'
  | 'fridge'
  | 'outOfFridge'
  | 'ambientRise'
  | 'topping'
  | 'bake';

export interface ProcedureContext {
  profile: PizzaProfile;
  method: MethodId;
  container: ContainerId;
  oven: OvenId;
  model: OvenModel | undefined;
  route: 'fridge' | 'no-fridge';
  waterStages: 1 | 2 | 3;
  waterTempC: number;
  ballCount: number;
  ballWeightG: number;
}

export interface PhaseProcedure {
  id: PhaseKey;
  title: string;
  steps: string[];
}

// ASSUMPTION: spirale timing split (10 min slow in total, then 3 min faster).
const SPIRAL = { slowTotalMin: 10, saltAfterMin: 3, fastMin: 3 } as const;

export const PHASE_TITLES: Record<PhaseKey, string> = {
  mix: 'Impasta',
  rest: 'Puntata',
  shape: 'Staglio',
  preFridgeRise: 'Prima del frigo',
  fridge: 'Frigorifero',
  outOfFridge: 'Fuori frigo',
  ambientRise: 'Lievitazione a temperatura ambiente',
  topping: 'Condisci',
  bake: 'Cottura',
};

function mixSteps(ctx: ProcedureContext): string[] {
  const { profile, method, waterStages } = ctx;
  const steps = [
    `Usa acqua a ${ctx.waterTempC} °C e sciogli il lievito nella prima parte dell'acqua.`,
  ];
  if (waterStages > 1) {
    steps.push(
      `Aggiungi l'acqua in ${waterStages} riprese, aspettando che la precedente sia assorbita.`,
    );
  }
  if (profile.saltAddition.kind === 'after-minutes') {
    if (method === 'spirale') {
      steps.push(
        `Spirale in prima velocità: dopo ${SPIRAL.saltAfterMin} minuti aggiungi il sale, prosegui fino a ${SPIRAL.slowTotalMin} minuti in tutto, poi ${SPIRAL.fastMin} minuti in seconda velocità.`,
      );
    } else {
      steps.push(`Dopo ${profile.saltAddition.minutes} minuti di lavorazione aggiungi il sale.`);
    }
  } else {
    steps.push(`Aggiungi il sale dopo che la prima parte d'acqua è stata assorbita.`);
  }
  steps.push(
    'Impasta fino a ottenere un panetto liscio e omogeneo, poi misura la temperatura dell’impasto.',
  );
  return steps;
}

function bakeSteps(ctx: ProcedureContext): string[] {
  const { oven, model } = ctx;
  switch (oven) {
    case 'electric': {
      const high = model?.maxTopTempC === undefined ? BAKE.electric.topC : model.maxTopTempC;
      const top = high >= BAKE.electric.topCMax ? BAKE.electric.topCMax : BAKE.electric.topC;
      const [lo, hi] = BAKE.electric.standardSeconds;
      const seconds = model?.lowChamber
        ? `circa ${BAKE.electric.lowChamberSeconds}`
        : `${lo}-${hi}`;
      return [
        `Preriscalda con resistenza superiore a ${top} °C e inferiore a ${BAKE.electric.bottomC} °C (biscotto spesso).`,
        `Cuoci ${seconds} secondi, ruotando la pizza a metà cottura.`,
        'Controlla la prima pizza: il biscotto può essere troppo caldo, regola le resistenze se serve.',
      ];
    }
    case 'gas':
      return [
        `Piano a ${BAKE.gas.stoneC[0]}-${BAKE.gas.stoneC[1]} °C.`,
        `Cuoci ${BAKE.gas.seconds[0]}-${BAKE.gas.seconds[1]} secondi, ruotando la pizza.`,
      ];
    case 'wood':
      return [
        `Volta a ${BAKE.wood.vaultC[0]}-${BAKE.wood.vaultC[1]} °C con fiamma viva.`,
        `Cuoci ${BAKE.wood.seconds[0]}-${BAKE.wood.seconds[1]} secondi, ruotando la pizza.`,
      ];
    case 'home':
      return [
        `Forno al massimo, con pietra o acciaio preriscaldati ${BAKE.home.preheatMin[0]}-${BAKE.home.preheatMin[1]} minuti.`,
        `Cuoci ${BAKE.home.minutes[0]}-${BAKE.home.minutes[1]} minuti.`,
        'È un compromesso: il risultato sarà diverso da una cottura ad alta temperatura.',
      ];
  }
}

function shapeSteps(ctx: ProcedureContext): string[] {
  const where =
    ctx.container === 'cassettine'
      ? 'in cassettine unte, lasciando 3-4 cm tra un panetto e l’altro'
      : 'ognuno nel suo contenitore, lasciando 3-4 cm di spazio attorno';
  return [
    `Dividi l'impasto in ${ctx.ballCount} panetti da circa ${ctx.ballWeightG} g.`,
    'Forma le palline chiudendo bene la base.',
    `Disponili ${where}.`,
  ];
}

const STEPS: Record<Exclude<PhaseKey, 'mix' | 'bake' | 'shape'>, string[]> = {
  rest: ['Lascia riposare l’impasto sul banco, coperto, senza pieghe.'],
  preFridgeRise: [
    'Lascia i panetti a temperatura ambiente finché crescono di circa il 30%, fino a sfiorarsi.',
  ],
  fridge: ['Copri i contenitori e mettili in frigorifero fino all’ora indicata.'],
  outOfFridge: [
    'Tira fuori i panetti: devono tornare a temperatura ambiente fino a diventare elastici e stendibili.',
  ],
  ambientRise: ['Lascia lievitare a temperatura ambiente, coperto, fino all’infornata.'],
  topping: [
    'Stendi il panetto dal centro verso l’esterno, senza schiacciare il cornicione.',
    'Condisci poco e inforna subito.',
  ],
};

export function buildProcedure(ctx: ProcedureContext): PhaseProcedure[] {
  const order: PhaseKey[] =
    ctx.route === 'fridge'
      ? ['mix', 'rest', 'shape', 'preFridgeRise', 'fridge', 'outOfFridge', 'topping', 'bake']
      : ['mix', 'rest', 'shape', 'ambientRise', 'topping', 'bake'];
  return order.map((id) => ({
    id,
    title: PHASE_TITLES[id],
    steps:
      id === 'mix'
        ? mixSteps(ctx)
        : id === 'shape'
          ? shapeSteps(ctx)
          : id === 'bake'
            ? bakeSteps(ctx)
            : STEPS[id],
  }));
}
