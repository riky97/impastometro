import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { RecipeFileActions } from '../components/RecipeFileActions';
import { RecipeCard, type RecipeSummary } from '../components/RecipeCard';
import { btnPrimary } from '../components/ui';
import { METHODS } from '../data/methods';
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
    pizza: PROFILES[inputs.pizzaId].label,
    character: PROFILES[inputs.pizzaId].description,
    balls: result.balls.count,
    ballWeightG: result.balls.weightG,
    hydrationPct: result.hydration.value,
    flourG: result.ingredients.flourG,
    method: METHODS[inputs.method].label,
    oven: OVENS[inputs.ovenId].label,
  };
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Le tue ricette</h2>
        <button
          type="button"
          className={`${btnPrimary} min-h-11`}
          onClick={() => (inProgress ? setConfirm({ kind: 'new' }) : startNew())}
        >
          Nuovo impasto
        </button>
      </div>

      <ul className="grid gap-4">
        {inProgress && (
          <RecipeCard
            highlight
            name="Calcolo in corso"
            subtitle={`${state.showResult ? 'Risultato pronto' : `Passaggio ${state.step} di 4`} · ${PROFILES[state.pizzaId].label}`}
            summary={summarize(state)}
            primaryLabel="Riprendi"
            onPrimary={() => setView('calc')}
          />
        )}
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            name={recipe.name}
            summary={summarize({ ...createDefaultState(now), ...recipe.data })}
            primaryLabel="Vedi ricetta"
            onPrimary={() => showRecipe(recipe.id)}
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
