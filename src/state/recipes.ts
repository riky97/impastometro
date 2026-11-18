import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { PROFILES } from '../data/profiles';
import { createDefaultState } from './defaults';
import { wizardSchema, type WizardState } from './schema';
import { createStore, wizardStore } from './store';

/**
 * A saved recipe keeps the user's choices plus the dates and measured dough temperature it was
 * saved with. Those last four are optional so recipes saved before they existed still load.
 */
export const recipeDataSchema = wizardSchema
  .omit({ version: true, step: true, confirmed: true, showResult: true })
  .partial({ startLocal: true, bakeLocal: true, doughTempC: true, showDryYeast: true });

export const recipeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  savedAt: z.number(),
  data: recipeDataSchema,
});
export const recipesSchema = z.array(recipeSchema);

export type Recipe = z.infer<typeof recipeSchema>;

/** The backup file: the saved recipes wrapped with a marker so a stray JSON file is refused. */
const backupSchema = z.object({ app: z.literal('impastometro'), recipes: recipesSchema });

export const serializeRecipes = (recipes: Recipe[]): string =>
  JSON.stringify({ app: 'impastometro', recipes }, null, 2);

/** Returns the recipes in a backup file, or null when the text is not a valid backup. */
export function parseRecipesFile(text: string): Recipe[] | null {
  try {
    const parsed = backupSchema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data.recipes : null;
  } catch {
    return null;
  }
}

export const recipesStore = createStore<Recipe[]>([]);

export const useRecipes = (): Recipe[] =>
  useSyncExternalStore(recipesStore.subscribe, recipesStore.getState);

/** The card already shows the ball count, so the default name is just the style. */
const autoName = (data: Recipe['data']): string => PROFILES[data.pizzaId].label;

export const recipeActions = {
  /** Saves the current inputs under an automatic name; the user can rename it later. */
  save(state: WizardState, nowMs: number): void {
    const data = recipeDataSchema.parse(state);
    const id = `${nowMs.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    recipesStore.setState((all) => [{ id, name: autoName(data), savedAt: nowMs, data }, ...all]);
  },
  rename(id: string, name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    recipesStore.setState((all) => all.map((r) => (r.id === id ? { ...r, name: trimmed } : r)));
  },
  remove(id: string): void {
    recipesStore.setState((all) => all.filter((r) => r.id !== id));
  },
  /** Adds the recipes whose id is not already saved; returns how many were added. */
  merge(incoming: Recipe[]): number {
    const known = new Set(recipesStore.getState().map((r) => r.id));
    const fresh = incoming.filter((r) => !known.has(r.id));
    if (fresh.length) recipesStore.setState((all) => [...fresh, ...all]);
    return fresh.length;
  },
  /** "Duplica": the recipe's inputs with fresh dates, waiting on the time step. */
  open(recipe: Recipe, nowMs: number): void {
    const fresh = createDefaultState(nowMs);
    wizardStore.setState(() => ({
      ...fresh,
      ...recipe.data,
      startLocal: fresh.startLocal,
      bakeLocal: fresh.bakeLocal,
      doughTempC: null,
      confirmed: [true, true, true, false],
      step: 4,
    }));
  },
};
