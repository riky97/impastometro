import { ChoiceGroup } from '../components/ChoiceGroup';
import { DateTimeField } from '../components/DateTimeField';
import { NumberField } from '../components/NumberField';
import { StepFooter } from '../components/StepFooter';
import { errorClass } from '../components/ui';
import type { CalcResult } from '../engine/calculate';
import { formatDuration } from '../engine/dates';
import type { WizardState } from '../state/schema';
import { actions } from '../state/store';
import { setStaleDates } from '../state/ui';
import { messageFor } from './issues';

export function StepTime({ state, result }: { state: WizardState; result: CalcResult }) {
  const edit = (patch: Parameters<typeof actions.edit>[1]) => {
    if (patch.startLocal !== undefined || patch.bakeLocal !== undefined) setStaleDates(false);
    actions.edit(4, patch);
  };
  const issues = result.issues.filter((i) => i.field === 'time');
  const timeError = messageFor(issues, [
    'invalid-date',
    'bake-before-start',
    'total-too-short',
    'fridge-too-long',
    'fridge-infeasible',
  ]);

  return (
    <div className="space-y-7">
      <DateTimeField
        id="start"
        label="Inizio impasto"
        value={state.startLocal}
        onChange={(startLocal) => edit({ startLocal })}
      />
      <div>
        <DateTimeField
          id="bake"
          label="Ora di cottura"
          value={state.bakeLocal}
          onChange={(bakeLocal) => edit({ bakeLocal })}
          invalid={!!timeError}
          describedBy={timeError ? 'time-error' : undefined}
        />
        {timeError && (
          <p id="time-error" role="alert" className={errorClass}>
            {timeError}
          </p>
        )}
      </div>

      <ChoiceGroup
        legend="Percorso"
        name="route"
        value={state.route}
        choices={[
          { value: 'fridge', label: 'Con frigorifero' },
          { value: 'no-fridge', label: 'Senza frigorifero' },
        ]}
        onChange={(route) => edit({ route })}
      />

      <NumberField
        id="ambient-temp"
        label="Temperatura ambiente"
        unit="°C"
        value={state.ambientTempC}
        onChange={(ambientTempC) => edit({ ambientTempC })}
      />

      {issues.length === 0 && (
        <p className="rounded-control bg-brand-50 p-3.5 text-sm text-ink" aria-live="polite">
          Tempo totale: <strong>{formatDuration(result.schedule.totalMin)}</strong>
          {state.route === 'fridge' && (
            <>, di cui {formatDuration(result.schedule.fridgeMin)} in frigorifero</>
          )}
          .
        </p>
      )}

      <StepFooter step={4} disabled={issues.length > 0} />
    </div>
  );
}
