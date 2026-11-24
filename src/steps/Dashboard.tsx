import { PlusIcon } from '../components/icons';
import { ProductIcon } from '../components/ProductIcon';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeFileActions } from '../components/RecipeFileActions';
import { btnPrimary, btnSecondary } from '../components/ui';
import { unitName } from '../data/messages.it';
import { PROFILES } from '../data/profiles';
import { createDefaultState } from '../state/defaults';
import { recipeActions, useRecipes } from '../state/recipes';
import type { WizardState } from '../state/schema';
import { summarize } from '../state/summary';
import { setView, showRecipe } from '../state/ui';
import { useRecipeFlows } from './useRecipeFlows';

/** The unfinished calculation: one slim bar, not a card that repeats a recipe. */
function InProgressBar({ state }: { state: WizardState }) {
  const { balls, unit } = summarize(state);
  const where = state.showResult ? 'Risultato pronto' : `Passaggio ${state.step} di 4`;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brand-600 bg-surface p-3">
      <ProductIcon product={state.pizzaId} />
      <div className="min-w-0 grow">
        <p className="font-semibold text-ink">Calcolo in corso</p>
        <p className="truncate text-sm text-ink-2">
          {where} · {PROFILES[state.pizzaId].label}, {balls} {unitName(unit, balls)}
        </p>
      </div>
      <button
        type="button"
        className={`${btnPrimary} min-h-11 shrink-0 px-4`}
        onClick={() => setView('calc')}
      >
        Riprendi
      </button>
    </div>
  );
}

export function Dashboard({ state }: { state: WizardState }) {
  const recipes = useRecipes();
  const inProgress = state.confirmed.some(Boolean);
  const { requestNew, requestDuplicate, requestRemove, dialogs } = useRecipeFlows(inProgress);
  const now = Date.now();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Le tue ricette</h2>
        <button type="button" className={`${btnSecondary} gap-2`} onClick={requestNew}>
          <PlusIcon className="size-5" />
          Nuovo impasto
        </button>
      </div>

      {inProgress && <InProgressBar state={state} />}

      <ul className="grid gap-3 md:grid-cols-2">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            name={recipe.name}
            summary={summarize({ ...createDefaultState(now), ...recipe.data })}
            onOpen={() => showRecipe(recipe.id)}
            onRename={(name) => recipeActions.rename(recipe.id, name)}
            onDuplicate={() => requestDuplicate(recipe)}
            onRemove={() => requestRemove(recipe)}
          />
        ))}
      </ul>

      {recipes.length === 0 && (
        <p className="text-ink-2">
          Nessuna ricetta salvata. Calcola un impasto e premi «Salva ricetta» nel risultato: la
          ritroverai qui.
        </p>
      )}

      <RecipeFileActions />
      {dialogs}
    </div>
  );
}
