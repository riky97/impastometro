import { useMemo } from 'react';
import { NewCalculationButton } from './components/NewCalculationButton';
import { ProgressBar } from './components/ProgressBar';
import { StaleDatesBanner } from './components/StaleDatesBanner';
import { calculate } from './engine/calculate';
import { toCalcInput } from './state/selectors';
import { useWizardState } from './state/store';
import { setView, useStaleDates, useView } from './state/ui';
import { Dashboard } from './steps/Dashboard';
import { ResultScreen } from './steps/ResultScreen';
import { StepEquipment } from './steps/StepEquipment';
import { StepFlour } from './steps/StepFlour';
import { StepQuantity } from './steps/StepQuantity';
import { StepTime } from './steps/StepTime';
import { StepTabs } from './components/StepTabs';

export function App() {
  const state = useWizardState();
  const staleDates = useStaleDates();
  const view = useView();
  const result = useMemo(() => calculate(toCalcInput(state)), [state]);
  const home = view === 'home';
  const showResult = !home && state.showResult && result.valid;

  return (
    <div className={`mx-auto min-h-dvh w-full px-4 pb-10 ${showResult ? 'max-w-5xl' : 'max-w-xl'}`}>
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
              <NewCalculationButton />
            </div>
          )}
        </div>
        {staleDates && <StaleDatesBanner />}
        {!home && !showResult && (
          <>
            <ProgressBar confirmedCount={state.confirmed.filter(Boolean).length} total={4} />
            <StepTabs state={state} />
          </>
        )}
      </header>
      <main>
        {home ? (
          <Dashboard state={state} />
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
    </div>
  );
}
