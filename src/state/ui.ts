import { useSyncExternalStore } from 'react';
import { createStore } from './store';

/** Transient UI flags that are deliberately NOT persisted. */
export type View = 'home' | 'calc' | 'recipe';

/** `view` starts as 'calc' so the wizard renders without a session; startPersistence opens 'home'. */
export const uiStore = createStore<{ staleDates: boolean; view: View; recipeId: string | null }>({
  staleDates: false,
  view: 'calc',
  recipeId: null,
});

export function useStaleDates(): boolean {
  return useSyncExternalStore(uiStore.subscribe, () => uiStore.getState().staleDates);
}

export function setStaleDates(staleDates: boolean): void {
  uiStore.setState((s) => (s.staleDates === staleDates ? s : { ...s, staleDates }));
}

export function useView(): View {
  return useSyncExternalStore(uiStore.subscribe, () => uiStore.getState().view);
}

export function setView(view: View): void {
  uiStore.setState((s) => (s.view === view ? s : { ...s, view }));
}

/** The read-only page of one saved recipe. */
export function showRecipe(recipeId: string): void {
  uiStore.setState((s) => ({ ...s, view: 'recipe', recipeId }));
}

export function useRecipeId(): string | null {
  return useSyncExternalStore(uiStore.subscribe, () => uiStore.getState().recipeId);
}
