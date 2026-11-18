import { useState } from 'react';
import type { PhaseProcedure } from '../data/procedures.it';
import { ChevronIcon } from './icons';

/** Phase-by-phase procedure; one phase open at a time. Local UI state only. */
export function PhaseStepper({ procedure }: { procedure: readonly PhaseProcedure[] }) {
  const [openId, setOpenId] = useState<string>(procedure[0]?.id ?? '');
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <h2 id="procedure-title" className="px-4 pt-4 pb-3 text-lg font-semibold text-ink sm:px-5">
        Procedimento
      </h2>
      <ol className="divide-y divide-line border-t border-line">
        {procedure.map((phase, index) => {
          const open = phase.id === openId;
          return (
            <li key={phase.id}>
              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`phase-${phase.id}`}
                  onClick={() => setOpenId(open ? '' : phase.id)}
                  className="flex min-h-14 w-full items-center gap-3 px-4 text-left text-base font-semibold text-ink transition-colors hover:bg-brand-50"
                >
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold tabular-nums text-brand-800"
                  >
                    {index + 1}
                  </span>
                  <span className="grow">{phase.title}</span>
                  <ChevronIcon
                    className={`size-5 shrink-0 text-ink-3 transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`}
                  />
                </button>
              </h3>
              {open && (
                <ul
                  id={`phase-${phase.id}`}
                  className="list-disc space-y-2 pr-4 pb-4 pl-[3.75rem] text-ink-2 marker:text-ink-3"
                >
                  {phase.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
