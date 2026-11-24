import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PlusIcon } from '../components/icons';
import { ProductIcon } from '../components/ProductIcon';
import { RecipeCard, type RecipeSummary } from '../components/RecipeCard';
import { RecipeFileActions } from '../components/RecipeFileActions';
import { btnPrimary, btnSecondary } from '../components/ui';
import { unitName } from '../data/messages.it';
import { OVENS } from '../data/ovens';
import { PROFILES } from '../data/profiles';
import { calculate } from '../engine/calculate';
import { createDefaultState } from '../state/defaults';
import { recipeActions, useRecipes, type Recipe } from '../state/recipes';
import type { WizardState } from '../state/schema';
import { toCalcInput } from '../state/selectors';
import { resetCalculation } from '../state/session';
import { setView, showRecipe } from '../state/ui';

/** What the card shows at a glance, computed from the inputs with throw-away dates. */
function summarize(inputs: WizardState): RecipeSummary {
  const result = calculate(toCalcInput(inputs));
  return {
    pizzaId: inputs.pizzaId,
    unit: result.unit,
    balls: result.balls.count,
    ballWeightG: result.balls.weightG,
    hydrationPct: result.hydration.value,
    flourG: result.ingredients.flourG,
    oven: OVENS[inputs.ovenId].label,
  };
}

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
  const [confirm, setConfirm] = useState<
    { kind: 'new' } | { kind: 'duplicate' | 'remove'; recipe: Recipe } | null
  >(null);
  const inProgress = state.confirmed.some(Boolean);
  const now = Date.now();

  const startNew = () => {
    resetCalculation();
    setView('calc');
  };

  /** Opens the calculation prefilled with the recipe; the new recipe exists once it is saved. */
  const duplicate = (recipe: Recipe) => {
    recipeActions.open(recipe, now);
    setView('calc');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Le tue ricette</h2>
        <button
          type="button"
          className={`${btnSecondary} gap-2`}
          onClick={() => (inProgress ? setConfirm({ kind: 'new' }) : startNew())}
        >
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
            onDuplicate={() =>
              inProgress ? setConfirm({ kind: 'duplicate', recipe }) : duplicate(recipe)
            }
            onRemove={() => setConfirm({ kind: 'remove', recipe })}
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

      {confirm?.kind === 'new' && (
        <ConfirmDialog
          title="Iniziare un nuovo impasto?"
          message="Il calcolo in corso verrà cancellato. Le ricette salvate restano."
          confirmLabel="Cancella e ricomincia"
          cancelLabel="Annulla"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setConfirm(null);
            startNew();
          }}
        />
      )}
      {confirm?.kind === 'duplicate' && (
        <ConfirmDialog
          title="Duplicare la ricetta?"
          message="Il calcolo in corso verrà cancellato. Le ricette salvate restano."
          confirmLabel="Cancella e duplica"
          cancelLabel="Annulla"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            setConfirm(null);
            duplicate(confirm.recipe);
          }}
        />
      )}
      {confirm?.kind === 'remove' && (
        <ConfirmDialog
          title="Eliminare la ricetta?"
          message={`«${confirm.recipe.name}» verrà cancellata e non si può recuperare.`}
          confirmLabel="Elimina"
          cancelLabel="Annulla"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            recipeActions.remove(confirm.recipe.id);
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}
