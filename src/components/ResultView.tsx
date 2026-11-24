import type { ReactNode } from 'react';
import { IngredientList } from './IngredientList';
import { NextPhaseStrip } from './NextPhaseStrip';
import { NumberField } from './NumberField';
import { PhaseStepper } from './PhaseStepper';
import { PhaseList, TimelineBar } from './Timeline';
import { phaseTitles } from '../data/procedures.it';
import { PROFILES } from '../data/profiles';
import { cardClass, sectionTitle } from './ui';
import type { CalcResult } from '../engine/calculate';
import { formatClock, formatDay, formatDuration } from '../engine/dates';
import type { PhaseId } from '../engine/types';
import { useNow } from '../state/clock';
import type { WizardState } from '../state/schema';

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

interface Props {
  state: WizardState;
  result: CalcResult;
  onToggleYeast: (showDry: boolean) => void;
  /** Omitted on a saved recipe: the measured temperature is already part of what was saved. */
  onDoughTemp?: (value: number | null) => void;
  /** Heading of the page: the product, or the recipe name. */
  title: string;
  /** Buttons next to the heading (save, edit). */
  actions?: ReactNode;
}

/** The final page: summary, ingredients, timeline and procedure. Knows nothing about the stores. */
export function ResultView({ state, result, onToggleYeast, onDoughTemp, title, actions }: Props) {
  const { schedule, ingredients } = result;
  const nowMs = useNow();
  const titles = phaseTitles(PROFILES[state.pizzaId], result.route);
  const numbers = new Map<PhaseId, number>(result.procedure.map((p, i) => [p.id, i + 1]));
  const bakeMs = schedule.phases[schedule.phases.length - 1]?.startMs ?? 0;
  const route = result.leavened
    ? result.route === 'fridge'
      ? 'Con frigorifero · '
      : 'Senza frigorifero · '
    : '';

  // Phone: summary, ingredients, timeline, procedure, then the optional re-plan card. Desktop: two
  // columns (wrappers become real blocks and `order-*` stops applying). The breakpoint is the width of
  // the page itself, not of the screen, because the desktop rail takes a third of it..
  return (
    <div className="@container space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          <p className="text-sm text-ink-2">
            {route}cottura{' '}
            <strong className="font-semibold text-ink">
              {formatDay(bakeMs)}, {formatClock(bakeMs)}
            </strong>
          </p>
        </div>
        {actions && <div className="flex w-full gap-2 sm:w-auto">{actions}</div>}
      </header>
      <NextPhaseStrip phases={schedule.phases} titles={titles} numbers={numbers} nowMs={nowMs} />
      <div className="grid gap-6 @4xl:grid-cols-2 @4xl:items-start @4xl:gap-8">
        <div className="contents @4xl:block @4xl:space-y-6">
          <dl className="order-1 grid grid-cols-[1fr_1.45fr_1fr] divide-x divide-line rounded-2xl border border-line bg-surface">
            <SummaryCell label="Idratazione" value={String(result.hydration.value)} unit="%" />
            <SummaryCell label="Tempo totale" value={formatDuration(schedule.totalMin)} />
            <SummaryCell label="Impasto" value={String(ingredients.totalG)} unit="g" />
          </dl>

          <div className="order-2">
            <IngredientList
              result={result}
              showDryYeast={state.showDryYeast}
              onToggleYeast={onToggleYeast}
            />
          </div>

          {onDoughTemp && (
            <section className={`${cardClass} order-5`} aria-labelledby="dough-temp-title">
              <h2 id="dough-temp-title" className={`${sectionTitle} mb-3 text-lg`}>
                Temperatura reale dell'impasto
              </h2>
              <NumberField
                id="dough-temp"
                label="Temperatura misurata dopo l'impasto"
                unit="°C"
                value={state.doughTempC}
                onChange={onDoughTemp}
                onClear={() => onDoughTemp(null)}
                hint="Facoltativa: se la inserisci, la tabella di marcia viene ricalcolata."
              />
            </section>
          )}
        </div>

        <div className="contents @4xl:block @4xl:space-y-6">
          <section className={`${cardClass} order-3`} aria-labelledby="timeline-title">
            <h2 id="timeline-title" className={`${sectionTitle} mb-4 text-lg`}>
              Tabella di marcia
            </h2>
            <TimelineBar phases={schedule.phases} titles={titles} />
            <div className="mt-2">
              <PhaseList phases={schedule.phases} numbers={numbers} titles={titles} nowMs={nowMs} />
            </div>
          </section>

          <div className="order-4">
            <PhaseStepper procedure={result.procedure} />
          </div>
        </div>
      </div>
    </div>
  );
}
