import { useState, type ReactNode } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { recipeActions, type Recipe } from '../state/recipes';
import { resetCalculation } from '../state/session';
import { setView, uiStore } from '../state/ui';

type Pending = { kind: 'new' } | { kind: 'duplicate' | 'remove'; recipe: Recipe } | null;

/**
 * The three actions that can wipe something (new calculation, duplicate, delete) with their
 * confirmations, shared by the dashboard, the desktop rail and the recipe page.
 */
export function useRecipeFlows(inProgress: boolean): {
  requestNew: () => void;
  requestDuplicate: (recipe: Recipe) => void;
  requestRemove: (recipe: Recipe) => void;
  dialogs: ReactNode;
} {
  const [pending, setPending] = useState<Pending>(null);

  const startNew = () => {
    resetCalculation();
    setView('calc');
  };
  /** Opens the calculation prefilled with the recipe; the new recipe exists once it is saved. */
  const duplicate = (recipe: Recipe) => {
    recipeActions.open(recipe, Date.now());
    setView('calc');
  };

  const dialogs = (
    <>
      {pending?.kind === 'new' && (
        <ConfirmDialog
          title="Iniziare un nuovo impasto?"
          message="Il calcolo in corso verrà cancellato. Le ricette salvate restano."
          confirmLabel="Cancella e ricomincia"
          cancelLabel="Annulla"
          onCancel={() => setPending(null)}
          onConfirm={() => {
            setPending(null);
            startNew();
          }}
        />
      )}
      {pending?.kind === 'duplicate' && (
        <ConfirmDialog
          title="Duplicare la ricetta?"
          message="Il calcolo in corso verrà cancellato. Le ricette salvate restano."
          confirmLabel="Cancella e duplica"
          cancelLabel="Annulla"
          onCancel={() => setPending(null)}
          onConfirm={() => {
            setPending(null);
            duplicate(pending.recipe);
          }}
        />
      )}
      {pending?.kind === 'remove' && (
        <ConfirmDialog
          title="Eliminare la ricetta?"
          message={`«${pending.recipe.name}» verrà cancellata e non si può recuperare.`}
          confirmLabel="Elimina"
          cancelLabel="Annulla"
          onCancel={() => setPending(null)}
          onConfirm={() => {
            recipeActions.remove(pending.recipe.id);
            // Deleting the recipe being viewed leaves nothing to show: back to the list.
            if (uiStore.getState().recipeId === pending.recipe.id) setView('home');
            setPending(null);
          }}
        />
      )}
    </>
  );

  return {
    requestNew: () => (inProgress ? setPending({ kind: 'new' }) : startNew()),
    requestDuplicate: (recipe) =>
      inProgress ? setPending({ kind: 'duplicate', recipe }) : duplicate(recipe),
    requestRemove: (recipe) => setPending({ kind: 'remove', recipe }),
    dialogs,
  };
}
