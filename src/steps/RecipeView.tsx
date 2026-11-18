import { useMemo, useState } from 'react';
import { ResultView } from '../components/ResultView';
import { hintClass } from '../components/ui';
import { calculate } from '../engine/calculate';
import { createDefaultState } from '../state/defaults';
import { useRecipes } from '../state/recipes';
import { toCalcInput } from '../state/selectors';
import { useRecipeId } from '../state/ui';

/** A saved recipe as it was when saved: same page as the result, with the saved dates. */
export function RecipeView() {
  const id = useRecipeId();
  const recipe = useRecipes().find((r) => r.id === id);
  const [showDryYeast, setShowDryYeast] = useState(recipe?.data.showDryYeast ?? false);
  const shown = useMemo(() => {
    if (!recipe) return null;
    // Recipes saved before dates were kept fall back to a plan that starts now.
    const state = { ...createDefaultState(Date.now()), ...recipe.data, showDryYeast };
    return { state, result: calculate(toCalcInput(state)) };
  }, [recipe, showDryYeast]);

  if (!recipe || !shown) return <p className="text-ink-2">Ricetta non trovata.</p>;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-ink">{recipe.name}</h2>
      {recipe.data.startLocal === undefined && (
        <p className={hintClass}>
          Questa ricetta è stata salvata senza orari: la tabella di marcia parte da adesso.
        </p>
      )}
      <ResultView state={shown.state} result={shown.result} onToggleYeast={setShowDryYeast} />
    </div>
  );
}
