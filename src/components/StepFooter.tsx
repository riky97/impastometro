import type { ReactNode } from 'react';
import type { Step } from '../state/schema';
import { actions } from '../state/store';
import { btnPrimary } from './ui';

/** Primary action pinned to the bottom edge so a thumb can always reach it. */
export function StepFooter({
  step,
  disabled,
  summary,
}: {
  step: Step;
  disabled: boolean;
  /** A line shown just above the button, e.g. the total time. */
  summary?: ReactNode;
}) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-8 border-t border-line bg-ground px-4 py-3">
      {summary && (
        <p className="mb-2 text-sm text-ink" aria-live="polite">
          {summary}
        </p>
      )}
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
