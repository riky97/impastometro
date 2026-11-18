import type { OvenId } from './ovens';

export interface OvenModel {
  id: string;
  oven: OvenId;
  label: string;
  /** Highest top-element temperature (°C) the model allows. */
  maxTopTempC: number;
  /** Low baking chamber: bake time ~90 s. */
  lowChamber: boolean;
}

export const OTHER_MODEL_ID = 'altro';

// ASSUMPTION: max temperatures and chamber height are reconstructed; adjust after real bakes.
export const OVEN_MODELS: readonly OvenModel[] = [
  { id: 'ooni-volt-2', oven: 'electric', label: 'Ooni Volt 2', maxTopTempC: 450, lowChamber: true },
  {
    id: 'effeuno-p134h-509-pro',
    oven: 'electric',
    label: 'Effeuno P134H 509 PRO',
    maxTopTempC: 500,
    lowChamber: true,
  },
  {
    id: 'effeuno-p134ha-509-pro',
    oven: 'electric',
    label: 'Effeuno P134HA 509 PRO',
    maxTopTempC: 500,
    lowChamber: true,
  },
  {
    id: 'effeuno-p134h-509e-extra-power',
    oven: 'electric',
    label: 'Effeuno P134H 509E Extra Power',
    maxTopTempC: 500,
    lowChamber: true,
  },
  {
    id: 'effeuno-p134ha-509e-extra-power',
    oven: 'electric',
    label: 'Effeuno P134HA 509E Extra Power',
    maxTopTempC: 500,
    lowChamber: true,
  },
  {
    id: OTHER_MODEL_ID,
    oven: 'electric',
    label: 'Altro / non specificato',
    maxTopTempC: 450,
    lowChamber: false,
  },
];

export function modelsForOven(oven: OvenId): readonly OvenModel[] {
  return OVEN_MODELS.filter((m) => m.oven === oven);
}

export function findModel(oven: OvenId, modelId: string | null): OvenModel | undefined {
  return OVEN_MODELS.find((m) => m.oven === oven && m.id === modelId);
}

export const COOKING_BASES = [{ id: 'biscotto-spesso', label: 'Biscotto spesso' }] as const;
