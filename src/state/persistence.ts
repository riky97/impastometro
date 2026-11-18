import { parseLocalDateTime } from '../engine/dates';
import { createDefaultState } from './defaults';
import { recipesSchema, type Recipe } from './recipes';
import { wizardSchema, type WizardState } from './schema';
import { isStepUnlocked, type Store } from './store';

export const STORAGE_KEY = 'impastometro:state:v1';
export const SAVE_DEBOUNCE_MS = 300;
export const RECIPES_KEY = 'impastometro:recipes:v1';

/** Saved recipes live under their own key, so the wizard schema stays untouched. */
export function loadRecipes(storage: Storage | null): Recipe[] {
  try {
    const text = storage?.getItem(RECIPES_KEY);
    const parsed = text ? recipesSchema.safeParse(JSON.parse(text)) : null;
    return parsed?.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function saveRecipes(storage: Storage | null, recipes: Recipe[]): void {
  try {
    storage?.setItem(RECIPES_KEY, JSON.stringify(recipes));
  } catch {
    // Storage full or unavailable: recipes stay in memory for this session.
  }
}

/** Upgrades an older payload to the current schema. v1 is current, so nothing to do yet. */
export function migrate(raw: unknown): unknown {
  // When the schema changes: bump SCHEMA_VERSION, keep the old shape here and map it forward.
  return raw;
}

export type RestoreStatus = 'restored' | 'empty' | 'discarded';

export interface RestoreResult {
  state: WizardState;
  status: RestoreStatus;
  /** True when the saved bake time is already in the past. */
  datesInPast: boolean;
}

/** A restored payload must not land the user on a step they could not have reached. */
function sanitize(state: WizardState): WizardState {
  const step = isStepUnlocked(state.confirmed, state.step)
    ? state.step
    : ((state.confirmed.findIndex((done) => !done) + 1) as WizardState['step']);
  const showResult = state.showResult && state.confirmed.every(Boolean);
  return step === state.step && showResult === state.showResult
    ? state
    : { ...state, step, showResult };
}

/**
 * The plan is stale once its bake time has passed (the start has passed too by then). A start that
 * is merely in the past is normal: the default start is "now", and the user may be mid-process.
 */
function hasDatesInPast(state: WizardState, nowMs: number): boolean {
  const bake = parseLocalDateTime(state.bakeLocal);
  return bake !== null && bake < nowMs;
}

/** Every storage call is guarded: private mode, disabled storage and quota errors must not crash. */
function readItem(storage: Storage | null): string | null {
  try {
    return storage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function parsePayload(text: string): WizardState | null {
  try {
    const result = wizardSchema.safeParse(migrate(JSON.parse(text)));
    return result.success ? sanitize(result.data) : null;
  } catch {
    return null;
  }
}

export interface Persistence {
  /** Reads storage once. Does not touch the store. */
  restore: () => RestoreResult;
  /** Writes the pending state now (used when the page is going away). */
  flush: () => void;
  /** Clears the saved state and puts a fresh calculation in the store. */
  reset: () => void;
  dispose: () => void;
}

/**
 * The ONE persistence entry point: subscribes to the store and saves its state, debounced.
 * Nothing else in the app reads or writes storage.
 */
export function createPersistence(
  store: Store<WizardState>,
  storage: Storage | null,
  options: { debounceMs?: number; now?: () => number } = {},
): Persistence {
  const debounceMs = options.debounceMs ?? SAVE_DEBOUNCE_MS;
  const now = options.now ?? Date.now;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let suppressed = false;

  const write = (): void => {
    timer = null;
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(store.getState()));
    } catch {
      // Storage full or unavailable: keep working in memory.
    }
  };

  const unsubscribe = store.subscribe(() => {
    if (suppressed) return;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(write, debounceMs);
  });

  return {
    restore() {
      const text = readItem(storage);
      if (text === null) {
        return { state: createDefaultState(now()), status: 'empty', datesInPast: false };
      }
      const state = parsePayload(text);
      if (state === null) {
        return { state: createDefaultState(now()), status: 'discarded', datesInPast: false };
      }
      return { state, status: 'restored', datesInPast: hasDatesInPast(state, now()) };
    },
    flush() {
      if (timer !== null) {
        clearTimeout(timer);
        write();
      }
    },
    reset() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      try {
        storage?.removeItem(STORAGE_KEY);
      } catch {
        // Nothing to clean up if storage is unavailable.
      }
      suppressed = true;
      store.setState(() => createDefaultState(now()));
      suppressed = false;
    },
    dispose() {
      if (timer !== null) clearTimeout(timer);
      unsubscribe();
    },
  };
}
