import { useRef, useState } from 'react';
import {
  parseRecipesFile,
  recipeActions,
  recipesStore,
  serializeRecipes,
  useRecipes,
} from '../state/recipes';

const ghost =
  'min-h-11 rounded-control px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-brand-50 disabled:opacity-50 disabled:hover:bg-transparent';

/** Backup of the saved recipes as a JSON file, and the way back in. */
export function RecipeFileActions() {
  const recipes = useRecipes();
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');

  const exportFile = () => {
    const blob = new Blob([serializeRecipes(recipesStore.getState())], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `impastometro-ricette-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importFile = async (file: File) => {
    const parsed = parseRecipesFile(await file.text());
    if (!parsed) {
      setMessage('Il file non è un backup valido di Impastometro.');
      return;
    }
    const added = recipeActions.merge(parsed);
    setMessage(
      added === 0
        ? 'Nessuna ricetta nuova: sono già tutte qui.'
        : `Importat${added === 1 ? 'a 1 ricetta' : `e ${added} ricette`}.`,
    );
  };

  return (
    <div>
      <div className="flex gap-1">
        <button
          type="button"
          className={ghost}
          disabled={recipes.length === 0}
          onClick={exportFile}
        >
          Esporta ricette
        </button>
        <button type="button" className={ghost} onClick={() => input.current?.click()}>
          Importa ricette
        </button>
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          aria-label="File delle ricette"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = ''; // so the same file can be picked again
            if (file) void importFile(file);
          }}
        />
      </div>
      <p role="status" className="text-sm text-ink-2">
        {message}
      </p>
    </div>
  );
}
