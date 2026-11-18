import { useSyncExternalStore } from 'react';
import { createDefaultState } from './defaults';
import type { Step, WizardState } from './schema';

export interface Store<T> {
  getState: () => T;
  setState: (updater: (state: T) => T) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    setState: (updater) => {
      const next = updater(state);
      if (next === state) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const wizardStore = createStore<WizardState>(createDefaultState(Date.now()));

export function useWizardState(): WizardState {
  return useSyncExternalStore(wizardStore.subscribe, wizardStore.getState);
}

/** Fields the user edits in the wizard (everything except bookkeeping). */
export type InputPatch = Partial<
  Omit<WizardState, 'version' | 'step' | 'confirmed' | 'showResult' | 'doughTempC' | 'showDryYeast'>
>;

export const isStepUnlocked = (confirmed: WizardState['confirmed'], step: Step): boolean =>
  confirmed.slice(0, step - 1).every(Boolean);

const withConfirmed = (
  confirmed: WizardState['confirmed'],
  step: Step,
  value: boolean,
): WizardState['confirmed'] => {
  const next: WizardState['confirmed'] = [...confirmed];
  next[step - 1] = value;
  return next;
};

export const actions = {
  /** Editing a step's inputs withdraws its confirmation and leaves the result view. */
  edit(step: Step, patch: InputPatch): void {
    wizardStore.setState((s) => ({
      ...s,
      ...patch,
      confirmed: withConfirmed(s.confirmed, step, false),
      showResult: false,
    }));
  },
  confirm(step: Step): void {
    wizardStore.setState((s) => ({
      ...s,
      confirmed: withConfirmed(s.confirmed, step, true),
      step: step < 4 ? ((step + 1) as Step) : s.step,
      showResult: step === 4,
    }));
  },
  goTo(step: Step): void {
    wizardStore.setState((s) =>
      isStepUnlocked(s.confirmed, step) ? { ...s, step, showResult: false } : s,
    );
  },
  /** "Modifica i dati": back from the result to the wizard. */
  backToWizard(): void {
    wizardStore.setState((s) => ({ ...s, step: 1, showResult: false }));
  },
  setDoughTemp(doughTempC: number | null): void {
    wizardStore.setState((s) => ({ ...s, doughTempC }));
  },
  setShowDryYeast(showDryYeast: boolean): void {
    wizardStore.setState((s) => ({ ...s, showDryYeast }));
  },
};
