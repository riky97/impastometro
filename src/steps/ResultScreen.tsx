import { useState } from 'react';
import { ResultView } from '../components/ResultView';
import { btnPrimary, btnSecondary } from '../components/ui';
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
      onToggleYeast={actions.setShowDryYeast}
      onDoughTemp={result.leavened ? actions.setDoughTemp : undefined}
      footer={
        <>
          <button
            type="button"
            className={`${btnPrimary} w-full`}
            disabled={saved}
            onClick={() => {
              recipeActions.save(state, Date.now());
              setSaved(true);
            }}
          >
            {saved ? 'Ricetta salvata' : 'Salva ricetta'}
          </button>
          <button type="button" className={`${btnSecondary} w-full`} onClick={actions.backToWizard}>
            Modifica i dati
          </button>
        </>
      }
    />
  );
}
