import { Badge } from '../components/Badge';
import { NumberField } from '../components/NumberField';
import { RangeField } from '../components/RangeField';
import { StepFooter } from '../components/StepFooter';
import { errorClass, sectionTitle } from '../components/ui';
import { W_SUITABILITY_LABELS } from '../data/messages.it';
import { PROFILES } from '../data/profiles';
import type { CalcResult } from '../engine/calculate';
import { midW, oilBounds } from '../engine/hydration';
import { wSuitability } from '../engine/suitability';
import type { WizardState } from '../state/schema';
import { actions } from '../state/store';
import { messageFor } from './issues';

export function StepFlour({ state, result }: { state: WizardState; result: CalcResult }) {
  const edit = (patch: Parameters<typeof actions.edit>[1]) => actions.edit(2, patch);
  const profile = PROFILES[state.pizzaId];
  const wMid = midW(state.wMin, state.wMax);
  const wLevel = wSuitability(profile, wMid);
  const { hydration } = result;
  const oil = oilBounds(profile);
  const flourIssues = result.issues.filter((i) => i.field === 'flour');
  const wError = messageFor(flourIssues, ['w-out-of-range', 'w-min-above-max']);

  return (
    <div className="space-y-7">
      <section className="space-y-3">
        <h2 className={sectionTitle}>Forza della farina (W)</h2>
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            id="w-min"
            label="W minimo"
            value={state.wMin}
            min={150}
            max={450}
            onChange={(wMin) => edit({ wMin })}
            invalid={Boolean(wError)}
            describedBy={wError ? 'w-error' : undefined}
          />
          <NumberField
            id="w-max"
            label="W massimo"
            value={state.wMax}
            min={150}
            max={450}
            onChange={(wMax) => edit({ wMax })}
            invalid={Boolean(wError)}
            describedBy={wError ? 'w-error' : undefined}
          />
        </div>
        {wError && (
          <p id="w-error" role="alert" className={errorClass}>
            {wError}
          </p>
        )}
        <p className="flex items-center gap-2 text-sm text-ink-2">
          Intervallo {state.wMin}-{state.wMax} (calcolo con {wMid}):
          <Badge level={wLevel} label={W_SUITABILITY_LABELS[wLevel]} />
        </p>
        <p className="text-sm text-ink-3">
          Ideale per questa pizza: W {profile.idealW.min}-{profile.idealW.max}.
        </p>
      </section>

      <RangeField
        id="hydration"
        label="Idratazione"
        value={hydration.value}
        min={hydration.min}
        max={hydration.max}
        step={1}
        unit="%"
        disabled={hydration.min === hydration.max}
        onChange={(hydrationPct) => edit({ hydrationPct })}
        hint={`${
          hydration.min === hydration.max
            ? 'Con questa farina e questo metodo l’idratazione è fissa. '
            : ''
        }Consigliata ${hydration.recommended}%. Acqua da pesare per 1 kg di farina: ${result.waterPerKgG}\u00a0g.`}
      />

      <RangeField
        id="oil"
        label="Olio d'oliva"
        value={result.oilPct}
        min={oil.min}
        max={oil.max}
        step={0.5}
        unit="%"
        disabled={profile.oil.locked}
        onChange={(oilPct) => edit({ oilPct })}
        hint={profile.oil.locked ? 'Nella napoletana classica non si usa olio.' : undefined}
      />

      <NumberField
        id="flour-temp"
        label="Temperatura della farina"
        unit="°C"
        value={state.flourTempC}
        onChange={(flourTempC) => edit({ flourTempC })}
      />

      <StepFooter step={2} disabled={flourIssues.length > 0} />
    </div>
  );
}
