import { useMemo } from 'react';
import { NewCalculationButton } from './components/NewCalculationButton';
import { RecipeRail } from './components/RecipeRail';
import { StaleDatesBanner } from './components/StaleDatesBanner';
import { StepTabs } from './components/StepTabs';
import { calculate } from './engine/calculate';
import { toCalcInput } from './state/selectors';
import { useWizardState } from './state/store';
import { setView, useStaleDates, useView } from './state/ui';
import { useIsDesktop } from './state/viewport';
import { Dashboard } from './steps/Dashboard';
import { RecipeView } from './steps/RecipeView';
import { ResultScreen } from './steps/ResultScreen';
import { StepEquipment } from './steps/StepEquipment';
import { StepFlour } from './steps/StepFlour';
import { StepQuantity } from './steps/StepQuantity';
import { StepTime } from './steps/StepTime';

export function App() {
  const state = useWizardState();
  const staleDates = useStaleDates();
  const desktop = useIsDesktop();
  // On a wide screen the rail is the list of recipes, so "home" shows the calculation instead.
  const storedView = useView();
  const view = storedView === 'home' && desktop ? 'calc' : storedView;
  const result = useMemo(() => calculate(toCalcInput(state)), [state]);
  const home = view === 'home';
  const recipeView = view === 'recipe';
  const showResult = view === 'calc' && state.showResult && result.valid;
  const wide = showResult || recipeView || home;

  const main = (
    <main>
      {home ? (
        <Dashboard state={state} />
      ) : recipeView ? (
        <RecipeView />
      ) : showResult ? (
        <ResultScreen state={state} result={result} />
      ) : (
        <>
          {state.step === 1 && <StepEquipment state={state} />}
          {state.step === 2 && <StepFlour state={state} result={result} />}
          {state.step === 3 && <StepQuantity state={state} result={result} />}
          {state.step === 4 && <StepTime state={state} result={result} />}
        </>
      )}
    </main>
  );
  const tabs = view === 'calc' && !showResult && <StepTabs state={state} />;

  if (desktop) {
    return (
      <div className="mx-auto grid min-h-dvh max-w-[96rem] grid-cols-[19rem_1fr]">
        <RecipeRail state={state} />
        <div className="min-w-0 px-8 pb-10">
          <div className={`mx-auto pt-6 ${wide ? 'max-w-5xl' : 'max-w-xl'}`}>
            <div className="space-y-4 pb-6 empty:hidden">
              {staleDates && <StaleDatesBanner />}
              {tabs}
            </div>
            {main}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto min-h-dvh w-full px-4 pb-10 ${wide ? 'max-w-5xl' : 'max-w-xl'}`}>
      <header className="space-y-4 pt-5 pb-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight text-brand-800">Impastometro</h1>
          {!home && (
            <div className="flex gap-1">
              <button
                type="button"
                className="min-h-11 shrink-0 rounded-control px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-brand-50"
                onClick={() => setView('home')}
              >
                Ricette
              </button>
              {!recipeView && <NewCalculationButton />}
            </div>
          )}
        </div>
        {staleDates && <StaleDatesBanner />}
        {tabs}
      </header>
      {main}
    </div>
  );
}
