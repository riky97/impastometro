import { Badge } from '../components/Badge';
import { ChoiceGroup, type Choice } from '../components/ChoiceGroup';
import { StepFooter } from '../components/StepFooter';
import { hintClass, inputClass, labelClass } from '../components/ui';
import { CONTAINER_IDS, CONTAINERS } from '../data/containers';
import { METHOD_IDS, METHODS } from '../data/methods';
import { COOKING_BASES, OTHER_MODEL_ID, modelsForOven } from '../data/oven-models';
import { DEFAULT_OVEN, OVEN_IDS, OVENS, type OvenId } from '../data/ovens';
import { PRODUCT_IDS, PROFILES, type ProductId } from '../data/profiles';
import { SUITABILITY_LABELS } from '../data/messages.it';
import { pizzaOvenSuitability } from '../engine/suitability';
import { defaultBakeLocal } from '../state/defaults';
import type { WizardState } from '../state/schema';
import { actions } from '../state/store';

export function StepEquipment({ state }: { state: WizardState }) {
  const edit = (patch: Parameters<typeof actions.edit>[1]) => actions.edit(1, patch);

  const profile = PROFILES[state.pizzaId];
  const isPizza = profile.kind === 'pizza';

  const productChoices: Choice<ProductId>[] = PRODUCT_IDS.map((id) => {
    const level = pizzaOvenSuitability(id, state.ovenId);
    return {
      value: id,
      label: PROFILES[id].label,
      description: PROFILES[id].description,
      badge:
        isPizza && PROFILES[id].kind === 'pizza' ? (
          <Badge level={level} label={SUITABILITY_LABELS[level]} />
        ) : undefined,
    };
  });

  /** A new product starts from its own defaults; only pizza has a choice of oven and container. */
  const changeProduct = (pizzaId: ProductId) => {
    const next = PROFILES[pizzaId];
    const bakeLocal = defaultBakeLocal(state.startLocal, pizzaId);
    edit({
      pizzaId,
      ...(bakeLocal ? { bakeLocal } : {}),
      hydrationPct: null,
      oilPct: next.oil.default,
      balls: next.unit.count.default,
      ballWeightG: null,
      route: next.routes.includes(state.route) ? state.route : (next.routes[0] ?? 'no-fridge'),
      ...(next.kind !== 'pizza'
        ? { ovenId: 'home' as const, ovenModelId: null }
        : profile.kind !== 'pizza'
          ? { ovenId: DEFAULT_OVEN, ovenModelId: null }
          : {}),
    });
  };

  const changeOven = (ovenId: OvenId) =>
    edit({ ovenId, ovenModelId: ovenId === 'electric' ? OTHER_MODEL_ID : null });

  return (
    <div className="space-y-7">
      <ChoiceGroup
        legend="Prodotto"
        name="product"
        value={state.pizzaId}
        choices={productChoices}
        onChange={changeProduct}
      />
      <ChoiceGroup
        legend="Metodo di impasto"
        name="method"
        value={state.method}
        choices={METHOD_IDS.map((id) => ({ value: id, label: METHODS[id].label }))}
        onChange={(method) => edit({ method })}
      />
      {isPizza ? (
        <>
          <ChoiceGroup
            legend="Contenitore per il riposo"
            name="container"
            value={state.container}
            choices={CONTAINER_IDS.map((id) => ({ value: id, label: CONTAINERS[id].label }))}
            onChange={(container) => edit({ container })}
          />
          <ChoiceGroup
            legend="Forno"
            name="oven"
            value={state.ovenId}
            choices={OVEN_IDS.map((id) => ({ value: id, label: OVENS[id].label }))}
            onChange={changeOven}
          />
        </>
      ) : (
        <p className={hintClass}>Si cuoce nel forno di casa.</p>
      )}
      {isPizza && state.ovenId === 'electric' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="oven-model" className={labelClass}>
              Modello di forno (facoltativo)
            </label>
            <select
              id="oven-model"
              className={inputClass}
              value={state.ovenModelId ?? OTHER_MODEL_ID}
              onChange={(e) => edit({ ovenModelId: e.target.value })}
            >
              {modelsForOven('electric').map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cooking-base" className={labelClass}>
              Base di cottura
            </label>
            <select id="cooking-base" className={inputClass} defaultValue={COOKING_BASES[0].id}>
              {COOKING_BASES.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <StepFooter step={1} disabled={false} />
    </div>
  );
}
