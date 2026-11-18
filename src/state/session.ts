import { createDefaultState } from './defaults';
import { createPersistence, loadRecipes, saveRecipes, type Persistence } from './persistence';
import { recipesStore } from './recipes';
import { wizardStore } from './store';
import { setStaleDates, setView } from './ui';

function browserStorage(): Storage | null {
  try {
    return window.localStorage; // accessing it can throw (private mode, blocked cookies)
  } catch {
    return null;
  }
}

let current: Persistence | null = null;

/**
 * Restores the saved calculation into the store, then keeps saving it. Call once, before the
 * first render. Returns a function that stops persisting (used by tests).
 */
export function startPersistence(storage: Storage | null = browserStorage()): () => void {
  current?.dispose();
  const persistence = createPersistence(wizardStore, storage);
  current = persistence;

  const restored = persistence.restore();
  wizardStore.setState(() => restored.state);
  setStaleDates(restored.datesInPast);
  setView('home');
  recipesStore.setState(() => loadRecipes(storage));
  const stopRecipes = recipesStore.subscribe(() => saveRecipes(storage, recipesStore.getState()));

  const flushWhenHidden = (): void => {
    if (document.visibilityState === 'hidden') persistence.flush();
  };
  window.addEventListener('pagehide', persistence.flush);
  document.addEventListener('visibilitychange', flushWhenHidden);

  return () => {
    window.removeEventListener('pagehide', persistence.flush);
    document.removeEventListener('visibilitychange', flushWhenHidden);
    stopRecipes();
    persistence.dispose();
    if (current === persistence) current = null;
  };
}

/** "Nuovo calcolo": defaults in the store, saved state removed. */
export function resetCalculation(): void {
  if (current) current.reset();
  else wizardStore.setState(() => createDefaultState(Date.now()));
  setStaleDates(false);
}
