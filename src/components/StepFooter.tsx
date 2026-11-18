import type { Step } from '../state/schema';
import { actions } from '../state/store';
import { btnPrimary } from './ui';

/** Primary action pinned to the bottom edge so a thumb can always reach it. */
export function StepFooter({ step, disabled }: { step: Step; disabled: boolean }) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-8 border-t border-line bg-ground px-4 py-3">
      <button
        type="button"
        className={`${btnPrimary} w-full`}
        disabled={disabled}
        onClick={() => actions.confirm(step)}
      >
        {step === 4 ? 'Conferma e calcola' : 'Conferma e continua'}
      </button>
    </div>
  );
}
