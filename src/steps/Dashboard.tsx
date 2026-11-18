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
import { setView } from '../state/ui';

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
  const [confirm, setConfirm] = useState<'new' | Recipe | null>(null);
  const inProgress = state.confirmed.some(Boolean);
  const now = Date.now();

  const startNew = () => {
    resetCalculation();
    setView('calc');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Le tue ricette</h2>
        <button
          type="button"
          className={`${btnPrimary} min-h-11`}
          onClick={() => (inProgress ? setConfirm('new') : startNew())}
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
            primaryLabel="Usa questa ricetta"
            onPrimary={() => {
              recipeActions.open(recipe, now);
              setView('calc');
            }}
            onRename={(name) => recipeActions.rename(recipe.id, name)}
            onDuplicate={() => recipeActions.duplicate(recipe.id, now)}
            onRemove={() => setConfirm(recipe)}
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

      {confirm === 'new' && (
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
      {confirm && confirm !== 'new' && (
        <ConfirmDialog
          title="Eliminare la ricetta?"
          message={`«${confirm.name}» verrà cancellata e non si può recuperare.`}
          confirmLabel="Elimina"
          cancelLabel="Annulla"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            recipeActions.remove(confirm.id);
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}
