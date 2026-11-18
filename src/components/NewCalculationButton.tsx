import { useState } from 'react';
import { resetCalculation } from '../state/session';
import { ConfirmDialog } from './ConfirmDialog';

export function NewCalculationButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="min-h-11 shrink-0 whitespace-nowrap rounded-control px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-brand-50"
        onClick={() => setOpen(true)}
      >
        Nuovo impasto
      </button>
      {open && (
        <ConfirmDialog
          title="Iniziare un nuovo impasto?"
          message="Tutti i dati inseriti finora verranno cancellati."
          confirmLabel="Cancella e ricomincia"
          cancelLabel="Annulla"
          onCancel={() => setOpen(false)}
          onConfirm={() => {
            resetCalculation();
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
