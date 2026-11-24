import { useState } from 'react';
import { ResultView } from '../components/ResultView';
import { btnPrimary, btnSecondary } from '../components/ui';
import { PROFILES } from '../data/profiles';
import type { CalcResult } from '../engine/calculate';
import { recipeActions } from '../state/recipes';
import type { WizardState } from '../state/schema';
import { actions } from '../state/store';

/** The result of the calculation in progress: editable temperature, save and back to the wizard. */
export function ResultScreen({ state, result }: { state: WizardState; result: CalcResult }) {
  const [saved, setSaved] = useState(false);
  return (
    <ResultView
      state={state}
      result={result}
      title={PROFILES[state.pizzaId].label}
      onToggleYeast={actions.setShowDryYeast}
      onDoughTemp={result.leavened ? actions.setDoughTemp : undefined}
      actions={
        <>
          <button
            type="button"
            className={`${btnPrimary} min-h-11 flex-1 px-5 sm:flex-none`}
            disabled={saved}
            onClick={() => {
              recipeActions.save(state, Date.now());
              setSaved(true);
            }}
          >
            {saved ? 'Ricetta salvata' : 'Salva ricetta'}
          </button>
          <button
            type="button"
            className={`${btnSecondary} flex-1 sm:flex-none`}
            onClick={actions.backToWizard}
          >
            Modifica i dati
          </button>
        </>
      }
    />
  );
}
