import { useMemo, useState } from 'react';
import { ResultView } from '../components/ResultView';
import { btnPrimary, btnSecondary, hintClass, inputClass } from '../components/ui';
import { calculate } from '../engine/calculate';
import { createDefaultState } from '../state/defaults';
import { recipeActions, useRecipes } from '../state/recipes';
import { toCalcInput } from '../state/selectors';
import { useWizardState } from '../state/store';
import { useRecipeId } from '../state/ui';
import { useRecipeFlows } from './useRecipeFlows';

/** A saved recipe as it was when saved: same page as the result, with the saved dates. */
export function RecipeView() {
  const id = useRecipeId();
  const recipe = useRecipes().find((r) => r.id === id);
  const inProgress = useWizardState().confirmed.some(Boolean);
  const { requestDuplicate, requestRemove, dialogs } = useRecipeFlows(inProgress);
  const [showDryYeast, setShowDryYeast] = useState(recipe?.data.showDryYeast ?? false);
  const [draft, setDraft] = useState<string | null>(null);
  const shown = useMemo(() => {
    if (!recipe) return null;
    // Recipes saved before dates were kept fall back to a plan that starts now.
    const state = { ...createDefaultState(Date.now()), ...recipe.data, showDryYeast };
    return { state, result: calculate(toCalcInput(state)) };
  }, [recipe, showDryYeast]);

  if (!recipe || !shown) return <p className="text-ink-2">Ricetta non trovata.</p>;
  const action = `${btnSecondary} flex-1 sm:flex-none`;
  return (
    <div className="space-y-4">
      {recipe.data.startLocal === undefined && (
        <p className={hintClass}>
          Questa ricetta è stata salvata senza orari: la tabella di marcia parte da adesso.
        </p>
      )}
      {draft !== null && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            recipeActions.rename(recipe.id, draft);
            setDraft(null);
          }}
        >
          <input
            aria-label="Nome della ricetta"
            className={`${inputClass} min-w-0 grow`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          <button type="submit" className={`${btnPrimary} min-h-12 px-4`}>
            Salva nome
          </button>
        </form>
      )}
      <ResultView
        state={shown.state}
        result={shown.result}
        title={recipe.name}
        onToggleYeast={setShowDryYeast}
        actions={
          <>
            <button type="button" className={action} onClick={() => requestDuplicate(recipe)}>
              Duplica
            </button>
            <button type="button" className={action} onClick={() => setDraft(recipe.name)}>
              Rinomina
            </button>
            <button type="button" className={action} onClick={() => requestRemove(recipe)}>
              Elimina
            </button>
          </>
        }
      />
      {dialogs}
    </div>
  );
}
