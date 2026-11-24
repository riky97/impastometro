import { STEPS, type Step, type WizardState } from '../state/schema';
import { actions, isStepUnlocked } from '../state/store';
import { CheckIcon } from './icons';

/** Full label for screen readers and wide screens; short label on phones. */
const TAB_LABELS: Record<Step, { full: string; short: string }> = {
  1: { full: 'Prodotto e strumenti', short: 'Prodotto' },
  2: { full: 'Farina', short: 'Farina' },
  3: { full: 'Quantità', short: 'Quantità' },
  4: { full: 'Tempo', short: 'Tempo' },
};

export function StepTabs({ state }: { state: WizardState }) {
  return (
    <nav
      aria-label="Passaggi"
      className="grid grid-cols-4 gap-1 rounded-control border border-line bg-surface p-1"
    >
      {STEPS.map((step) => {
        const unlocked = isStepUnlocked(state.confirmed, step);
        const active = state.step === step;
        const done = state.confirmed[step - 1];
        return (
          <button
            key={step}
            type="button"
            disabled={!unlocked}
            aria-current={active ? 'step' : undefined}
            aria-label={`${step}. ${TAB_LABELS[step].full}${done ? ' (confermato)' : ''}`}
            onClick={() => actions.goTo(step)}
            className={`flex min-h-11 items-center justify-center gap-1 rounded-lg px-1 text-[0.8125rem] font-medium transition-colors sm:px-3 sm:text-sm ${
              active
                ? 'bg-brand-700 text-white'
                : unlocked
                  ? 'text-brand-800 hover:bg-brand-50'
                  : 'text-ink-3 opacity-70'
            }`}
          >
            {done ? <CheckIcon className="size-4 shrink-0" /> : <span>{step}</span>}
            <span className="sm:hidden">{TAB_LABELS[step].short}</span>
            <span className="hidden sm:inline">{TAB_LABELS[step].full}</span>
          </button>
        );
      })}
    </nav>
  );
}
