import { actions } from '../state/store';
import { setStaleDates } from '../state/ui';
import { btnSecondary } from './ui';

/** Non-blocking notice shown after a restore when the saved dates have already passed. */
export function StaleDatesBanner() {
  return (
    <div role="status" className="rounded-control bg-warn-bg p-4 text-warn-ink">
      <p className="text-sm">
        Le date salvate sono già passate: scegli di nuovo inizio impasto e ora di cottura. Il resto
        dei dati è rimasto.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className={btnSecondary}
          onClick={() => {
            setStaleDates(false);
            actions.goTo(4);
          }}
        >
          Scegli le date
        </button>
        <button type="button" className={btnSecondary} onClick={() => setStaleDates(false)}>
          Chiudi
        </button>
      </div>
    </div>
  );
}
