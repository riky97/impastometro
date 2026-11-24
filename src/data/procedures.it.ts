import { BAKE } from './bake';
import type { ContainerId } from './containers';
import type { MethodId } from './methods';
import type { OvenModel } from './oven-models';
import type { OvenId } from './ovens';
import type { ProductProfile } from './profiles';

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
  profile: ProductProfile;
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

type Titles = Record<PhaseKey, string>;

/** Titles of the phases for a product; the timeline and the procedure both use them. */
export function phaseTitles(profile: ProductProfile, route: 'fridge' | 'no-fridge'): Titles {
  switch (profile.kind) {
    case 'focaccia':
      return {
        ...PHASE_TITLES,
        shape: route === 'fridge' ? 'In contenitore' : 'In teglia',
        outOfFridge: 'In teglia',
        ambientRise: 'Lievitazione in teglia',
        topping: 'Salamoia e fossette',
      };
    case 'pane':
      return {
        ...PHASE_TITLES,
        rest: 'Prima lievitazione',
        shape: 'Formatura',
        ambientRise: 'Seconda lievitazione',
        topping: 'Taglio',
      };
    case 'recco':
      return { ...PHASE_TITLES, rest: 'Riposo', topping: 'Stendi e farcisci' };
    case 'pizza':
      return PHASE_TITLES;
  }
}

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

function focacciaMixSteps(ctx: ProcedureContext): string[] {
  const steps = [
    `Usa acqua a ${ctx.waterTempC} °C e sciogli il lievito nella prima parte dell'acqua.`,
  ];
  if (ctx.waterStages > 1) {
    steps.push(
      `Aggiungi l'acqua in ${ctx.waterStages} riprese, aspettando che la precedente sia assorbita.`,
    );
  }
  steps.push(
    "Aggiungi il sale dopo che la prima parte d'acqua è stata assorbita, poi l'olio a filo.",
    'Impasta fino a ottenere un impasto liscio ed elastico, poi misura la temperatura.',
  );
  return steps;
}

const FOCACCIA_STEPS: Partial<Record<PhaseKey, string[]>> = {
  rest: ['Lascia riposare l’impasto, coperto, in una ciotola unta.'],
  preFridgeRise: [
    'Lascia il contenitore a temperatura ambiente finché l’impasto cresce di circa il 30%.',
  ],
  fridge: ['Copri il contenitore e mettilo in frigorifero fino all’ora indicata.'],
  outOfFridge: [
    'Tira fuori l’impasto, versalo nella teglia unta e allargalo con le mani unte, senza forzarlo.',
    'Lascia lievitare in teglia, coperto, in un posto tiepido (28-30 °C), fino a quasi i bordi.',
  ],
  ambientRise: [
    'Lascia lievitare in teglia, coperto, in un posto tiepido (28-30 °C), fino a quasi i bordi.',
  ],
  topping: [
    'Prepara la salamoia emulsionando acqua, olio e sale.',
    'Fai le fossette con le dita aperte e versa la salamoia, che deve riempirle.',
    'Lascia riposare una ventina di minuti, poi inforna.',
  ],
};

function focacciaStepsFor(id: PhaseKey, ctx: ProcedureContext): string[] {
  if (id === 'mix') return focacciaMixSteps(ctx);
  if (id === 'shape') {
    return ctx.route === 'fridge'
      ? ['Piega l’impasto su se stesso e mettilo in un contenitore unto, con il coperchio.']
      : ['Versa l’impasto nella teglia unta e allargalo con le mani unte, senza forzarlo.'];
  }
  if (id === 'bake') {
    const [tLo, tHi] = BAKE.focaccia.tempC;
    const [mLo, mHi] = BAKE.focaccia.minutes;
    return [
      `Forno statico a ${tLo}-${tHi} °C, ben preriscaldato, teglia sul ripiano basso o medio.`,
      `Cuoci ${mLo}-${mHi} minuti, fino a doratura.`,
    ];
  }
  return FOCACCIA_STEPS[id] ?? [];
}

const PANE_STEPS: Partial<Record<PhaseKey, string[]>> = {
  rest: [
    'Lascia lievitare l’impasto, coperto, fino a quando raddoppia.',
    'Se vuoi, dagli due giri di pieghe nella prima ora.',
  ],
  ambientRise: [
    'Lascia lievitare coperto finché il pane è cresciuto della metà e un dito premuto lascia un segno che torna piano.',
  ],
  topping: [
    'Incidi la superficie con una lama, con un taglio deciso.',
    'Metti una ciotola d’acqua sul fondo del forno per il vapore e inforna subito.',
  ],
};

function paneStepsFor(id: PhaseKey, ctx: ProcedureContext): string[] {
  if (id === 'mix') {
    return [
      `Usa acqua a ${ctx.waterTempC} °C e sciogli il lievito nell'acqua.`,
      "Aggiungi il sale dopo che la prima parte d'acqua è stata assorbita.",
      'Impasta fino a ottenere un impasto liscio ed elastico, poi misura la temperatura.',
    ];
  }
  if (id === 'shape') {
    return [
      `Dividi l'impasto in ${ctx.ballCount} pezzi da circa ${ctx.ballWeightG} g.`,
      'Forma pagnotte o filoni, chiudendo bene la chiusura.',
      'Disponili sulla teglia con carta forno, con la chiusura verso il basso.',
    ];
  }
  if (id === 'bake') {
    const [sLo, sHi] = BAKE.pane.steamTempC;
    const [sMin, sMax] = BAKE.pane.steamMin;
    const [fLo, fHi] = BAKE.pane.finishTempC;
    const [tLo, tHi] = BAKE.pane.totalMin;
    return [
      `Preriscalda il forno statico a ${sLo}-${sHi} °C per almeno 30-40 minuti.`,
      `Cuoci con il vapore per ${sMin}-${sMax} minuti, poi togli la ciotola e continua a ${fLo}-${fHi} °C.`,
      `In tutto ${tLo}-${tHi} minuti per pezzi da 500 g, di più per pezzi più grandi: è cotto quando suona vuoto battendo sul fondo.`,
    ];
  }
  return PANE_STEPS[id] ?? [];
}

function reccoStepsFor(id: PhaseKey, ctx: ProcedureContext): string[] {
  if (id === 'mix') {
    return [
      'Impasta farina, acqua, olio e sale fino a ottenere un impasto liscio ed elastico. Non serve il lievito.',
    ];
  }
  if (id === 'rest') {
    return ['Copri e lascia riposare almeno 30 minuti: serve per poterlo stendere sottilissimo.'];
  }
  if (id === 'topping') {
    return [
      `Per ognuna delle ${ctx.ballCount} teglie dividi l'impasto in due parti, la base un po' più grande.`,
      'Stendi la prima sfoglia sottilissima, quasi trasparente, e adagiala nella teglia unta.',
      'Distribuisci il formaggio a ciuffi, copri con la seconda sfoglia, sigilla i bordi e bucherella.',
    ];
  }
  if (id === 'bake') {
    const [tLo, tHi] = BAKE.recco.tempC;
    const [mLo, mHi] = BAKE.recco.minutes;
    return [
      `Forno al massimo: ${tLo}-${tHi} °C. In un forno di casa a ${BAKE.recco.homeTempC} °C, con teglia o pietra molto calde.`,
      `Cuoci ${mLo}-${mHi} minuti (${BAKE.recco.homeMinutes[0]}-${BAKE.recco.homeMinutes[1]} a ${BAKE.recco.homeTempC} °C), fino a doratura a chiazze.`,
      'Il forno di casa non arriva alle temperature di un forno professionale: il risultato sarà più asciutto.',
    ];
  }
  return [];
}

export function buildProcedure(ctx: ProcedureContext): PhaseProcedure[] {
  const { kind } = ctx.profile;
  const order: PhaseKey[] =
    kind === 'recco'
      ? ['mix', 'rest', 'topping', 'bake']
      : ctx.route === 'fridge'
        ? ['mix', 'rest', 'shape', 'preFridgeRise', 'fridge', 'outOfFridge', 'topping', 'bake']
        : ['mix', 'rest', 'shape', 'ambientRise', 'topping', 'bake'];
  const titles = phaseTitles(ctx.profile, ctx.route);
  const stepsFor = (id: PhaseKey): string[] => {
    switch (kind) {
      case 'focaccia':
        return focacciaStepsFor(id, ctx);
      case 'pane':
        return paneStepsFor(id, ctx);
      case 'recco':
        return reccoStepsFor(id, ctx);
      case 'pizza':
        return id === 'mix'
          ? mixSteps(ctx)
          : id === 'shape'
            ? shapeSteps(ctx)
            : id === 'bake'
              ? bakeSteps(ctx)
              : STEPS[id];
    }
  };
  return order.map((id) => ({ id, title: titles[id], steps: stepsFor(id) }));
}
