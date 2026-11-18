import { useState } from 'react';
import { IngredientList } from '../components/IngredientList';
import { NumberField } from '../components/NumberField';
import { PhaseStepper } from '../components/PhaseStepper';
import { PhaseList, TimelineBar } from '../components/Timeline';
import { btnPrimary, btnSecondary, cardClass, sectionTitle } from '../components/ui';
import type { CalcResult } from '../engine/calculate';
import { formatDuration } from '../engine/dates';
import type { PhaseId } from '../engine/types';
import type { WizardState } from '../state/schema';
import { recipeActions } from '../state/recipes';
import { actions } from '../state/store';

function SummaryCell({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="px-3 py-3 sm:px-4">
      <dt className="text-sm text-ink-2">{label}</dt>
      <dd className="whitespace-nowrap text-xl font-semibold tabular-nums tracking-tight text-ink sm:text-2xl">
        {value}
        {unit && <span className="ml-0.5 text-base font-medium text-ink-3">{unit}</span>}
      </dd>
    </div>
  );
}

export function ResultScreen({ state, result }: { state: WizardState; result: CalcResult }) {
  const { schedule, ingredients } = result;
  const [saved, setSaved] = useState(false);
  const numbers = new Map<PhaseId, number>(result.procedure.map((p, i) => [p.id, i + 1]));

  // Phone: summary, ingredients, timeline, procedure, then the optional re-plan card. Desktop: two
  // columns (wrappers become real blocks and `order-*` stops applying).
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
      <div className="contents lg:block lg:space-y-6">
        <dl className="order-1 grid grid-cols-[1fr_1.45fr_1fr] divide-x divide-line rounded-2xl border border-line bg-surface">
          <SummaryCell label="Idratazione" value={String(result.hydration.value)} unit="%" />
          <SummaryCell label="Tempo totale" value={formatDuration(schedule.totalMin)} />
          <SummaryCell label="Impasto" value={String(ingredients.totalG)} unit="g" />
        </dl>

        <div className="order-2">
          <IngredientList
            result={result}
            showDryYeast={state.showDryYeast}
            onToggleYeast={actions.setShowDryYeast}
          />
        </div>

        <section className={`${cardClass} order-5`} aria-labelledby="dough-temp-title">
          <h2 id="dough-temp-title" className={`${sectionTitle} mb-3 text-lg`}>
            Temperatura reale dell'impasto
          </h2>
          <NumberField
            id="dough-temp"
            label="Temperatura misurata dopo l'impasto"
            unit="°C"
            value={state.doughTempC}
            onChange={actions.setDoughTemp}
            onClear={() => actions.setDoughTemp(null)}
            hint="Facoltativa: se la inserisci, la tabella di marcia viene ricalcolata."
          />
        </section>
      </div>

      <div className="contents lg:block lg:space-y-6">
        <section className={`${cardClass} order-3`} aria-labelledby="timeline-title">
          <h2 id="timeline-title" className={`${sectionTitle} mb-4 text-lg`}>
            Tabella di marcia
          </h2>
          <TimelineBar phases={schedule.phases} />
          <div className="mt-2">
            <PhaseList phases={schedule.phases} numbers={numbers} />
          </div>
        </section>

        <div className="order-4">
          <PhaseStepper procedure={result.procedure} />
        </div>

        <div className="order-6 space-y-2">
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
        </div>
      </div>
    </div>
  );
}
