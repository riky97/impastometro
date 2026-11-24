import { PlusIcon } from './icons';
import { ProductIcon } from './ProductIcon';
import { RecipeFileActions } from './RecipeFileActions';
import { btnPrimary } from './ui';
import { PROFILES } from '../data/profiles';
import { createDefaultState } from '../state/defaults';
import { useRecipes } from '../state/recipes';
import type { WizardState } from '../state/schema';
import { summarize } from '../state/summary';
import { setView, showRecipe, useRecipeId, useView } from '../state/ui';
import { useRecipeFlows } from '../steps/useRecipeFlows';

const caption = 'px-1 pb-1 text-xs font-medium tracking-wide text-ink-3 uppercase';

function RailItem({
  product,
  title,
  meta,
  current,
  onClick,
}: {
  product: WizardState['pizzaId'];
  title: string;
  meta: string;
  current: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={current ? 'page' : undefined}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center gap-3 rounded-control px-2 py-1.5 text-left transition-colors ${
        current ? 'bg-brand-100' : 'hover:bg-brand-50'
      }`}
    >
      <ProductIcon product={product} />
      <span className="min-w-0 grow">
        <span className="block truncate font-medium text-ink">{title}</span>
        <span className="block truncate text-sm text-ink-2">{meta}</span>
      </span>
    </button>
  );
}

/** Desktop only: the recipes always at hand, the calculation or the recipe page beside them. */
export function RecipeRail({ state }: { state: WizardState }) {
  const recipes = useRecipes();
  const view = useView();
  const viewedId = useRecipeId();
  const inProgress = state.confirmed.some(Boolean);
  const { requestNew, dialogs } = useRecipeFlows(inProgress);
  const now = Date.now();

  const inProgressSummary = inProgress ? summarize(state) : null;

  return (
    <aside
      aria-label="Ricette"
      className="sticky top-0 flex h-dvh flex-col gap-5 overflow-y-auto border-r border-line bg-surface px-4 py-5"
    >
      <h1 className="text-xl font-bold tracking-tight text-brand-800">Impastometro</h1>
      <button type="button" className={`${btnPrimary} w-full gap-2`} onClick={requestNew}>
        <PlusIcon className="size-5" />
        Nuovo impasto
      </button>

      {inProgressSummary && (
        <section>
          <h2 className={caption}>In corso</h2>
          <RailItem
            product={state.pizzaId}
            title="Calcolo in corso"
            meta={`${state.showResult ? 'Risultato pronto' : `Passaggio ${state.step} di 4`} · ${PROFILES[state.pizzaId].label}`}
            current={view === 'calc'}
            onClick={() => setView('calc')}
          />
        </section>
      )}

      <section className="grow">
        <h2 className={caption}>Ricette salvate · {recipes.length}</h2>
        {recipes.length === 0 ? (
          <p className="px-1 text-sm text-ink-2">
            Nessuna ricetta salvata. Calcola un impasto e premi «Salva ricetta».
          </p>
        ) : (
          <ul>
            {recipes.map((recipe) => {
              const s = summarize({ ...createDefaultState(now), ...recipe.data });
              return (
                <li key={recipe.id}>
                  <RailItem
                    product={s.pizzaId}
                    title={recipe.name}
                    meta={`${s.balls} × ${s.ballWeightG} g · ${s.hydrationPct}%`}
                    current={view === 'recipe' && viewedId === recipe.id}
                    onClick={() => showRecipe(recipe.id)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="border-t border-line pt-3">
        <RecipeFileActions />
      </div>
      {dialogs}
    </aside>
  );
}
