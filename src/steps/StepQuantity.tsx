import { ChoiceGroup } from '../components/ChoiceGroup';
import { NumberField } from '../components/NumberField';
import { RangeField } from '../components/RangeField';
import { MinusIcon, PlusIcon } from '../components/icons';
import { StepFooter } from '../components/StepFooter';
import { btnSecondary } from '../components/ui';
import { QUANTITY_LIMITS } from '../data/quantity';
import { PROFILES } from '../data/profiles';
import type { CalcResult } from '../engine/calculate';
import type { WizardState } from '../state/schema';
import { actions } from '../state/store';
import { messageFor } from './issues';

const stepperButton = `${btnSecondary} size-12 shrink-0 px-0`;

export function StepQuantity({ state, result }: { state: WizardState; result: CalcResult }) {
  const edit = (patch: Parameters<typeof actions.edit>[1]) => actions.edit(3, patch);
  const ballWeight = state.ballWeightG ?? PROFILES[state.pizzaId].ballG.default;
  const issues = result.issues.filter((i) => i.field === 'quantity');
  const { ingredients, balls } = result;

  return (
    <div className="space-y-7">
      <ChoiceGroup
        legend="Come vuoi indicare la quantità?"
        name="quantity-mode"
        value={state.quantityMode}
        choices={[
          { value: 'balls', label: 'Numero di panetti' },
          { value: 'flour', label: 'Kg di farina' },
        ]}
        onChange={(quantityMode) => edit({ quantityMode })}
      />

      {state.quantityMode === 'balls' ? (
        <NumberField
          id="balls"
          label="Numero di panetti"
          value={state.balls}
          step={1}
          onChange={(balls) => edit({ balls: Math.round(balls) })}
          error={messageFor(issues, ['balls-out-of-range'])}
          startSlot={
            <button
              type="button"
              aria-label="Un panetto in meno"
              className={stepperButton}
              onClick={() => edit({ balls: Math.max(QUANTITY_LIMITS.balls.min, state.balls - 1) })}
            >
              <MinusIcon className="size-5" />
            </button>
          }
          endSlot={
            <button
              type="button"
              aria-label="Un panetto in più"
              className={stepperButton}
              onClick={() => edit({ balls: Math.min(QUANTITY_LIMITS.balls.max, state.balls + 1) })}
            >
              <PlusIcon className="size-5" />
            </button>
          }
        />
      ) : (
        <NumberField
          id="flour-kg"
          label="Farina"
          unit="kg"
          step={0.05}
          value={state.flourKg}
          onChange={(flourKg) => edit({ flourKg })}
          error={messageFor(issues, ['flour-out-of-range'])}
          hint={`Da ${QUANTITY_LIMITS.flourKg.min} a ${QUANTITY_LIMITS.flourKg.max} kg.`}
        />
      )}

      <RangeField
        id="ball-weight"
        label="Peso del panetto"
        value={ballWeight}
        min={QUANTITY_LIMITS.ballG.min}
        max={QUANTITY_LIMITS.ballG.max}
        step={5}
        unit=" g"
        onChange={(ballWeightG) => edit({ ballWeightG })}
      />

      {state.quantityMode === 'flour' && (
        <ChoiceGroup
          legend="Come dividere l'impasto?"
          name="split"
          value={state.split}
          stacked
          choices={[
            { value: 'keep-weight', label: 'Mantieni il peso scelto' },
            { value: 'equal', label: 'Tutto in panetti uguali' },
          ]}
          onChange={(split) => edit({ split })}
        />
      )}

      <p className="rounded-control bg-brand-50 p-3.5 text-sm text-ink" aria-live="polite">
        Impasto totale: <strong>{ingredients.totalG} g</strong> = {balls.count} panetti da{' '}
        {balls.weightG} g{balls.leftoverG > 0 && <> + {balls.leftoverG} g di impasto avanzato</>}.
      </p>

      <StepFooter step={3} disabled={issues.length > 0} />
    </div>
  );
}
