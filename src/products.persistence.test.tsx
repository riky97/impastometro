// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRODUCT_IDS, PROFILES } from './data/profiles';
import { createDefaultState } from './state/defaults';
import { MemoryStorage } from './state/memory-storage';
import { RECIPES_KEY } from './state/persistence';
import { parseRecipesFile, recipeDataSchema, serializeRecipes, type Recipe } from './state/recipes';

/** A "page load": fresh modules, restored from the shared storage, landing on the dashboard. */
async function loadPage(storage: Storage) {
  vi.resetModules();
  const { App } = await import('./App');
  const { startPersistence } = await import('./state/session');
  const stop = startPersistence(storage);
  render(<App />);
  return stop;
}

function closePage(stop: () => void) {
  window.dispatchEvent(new Event('pagehide'));
  stop();
  cleanup();
}

const confirmButton = () => screen.getByRole('button', { name: /^Conferma/ });
const NOW = new Date(2026, 10, 14, 16, 0).getTime();

let storage: MemoryStorage;
beforeEach(() => {
  storage = new MemoryStorage();
});
afterEach(cleanup);

/** Pick a product, go through the four steps and save the recipe. */
async function saveRecipeFor(user: ReturnType<typeof userEvent.setup>, product: RegExp) {
  await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
  await user.click(screen.getByRole('radio', { name: product }));
  for (let step = 1; step <= 4; step++) await user.click(confirmButton());
  await user.click(screen.getByRole('button', { name: 'Salva ricetta' }));
}

describe('recipes of every product', () => {
  it('round-trips through a backup file, one recipe per product', () => {
    const recipes: Recipe[] = PRODUCT_IDS.map((id, i) => ({
      id: `r${i}`,
      name: PROFILES[id].label,
      savedAt: NOW + i,
      data: recipeDataSchema.parse({ ...createDefaultState(NOW), pizzaId: id }),
    }));
    expect(parseRecipesFile(serializeRecipes(recipes))).toEqual(recipes);
  });

  it('saves a bread, keeps it across a reload and shows it with its own unit', async () => {
    const user = userEvent.setup();
    let stop = await loadPage(storage);
    await saveRecipeFor(user, /^Pane/);
    closePage(stop);

    stop = await loadPage(storage);
    const card = screen.getByRole('heading', { name: 'Pane' }).closest('li') as HTMLElement;
    expect(within(card).getByText(/pagnotte da 500 g/)).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: /^Vedi ricetta/ }));
    expect(screen.getByRole('heading', { name: 'Tabella di marcia' })).toBeInTheDocument();
    expect(screen.getAllByText('Seconda lievitazione').length).toBeGreaterThan(0);
    expect(JSON.parse(storage.getItem(RECIPES_KEY) as string)[0].data.pizzaId).toBe('pane');
    stop();
  });

  it('duplicates a Recco into a calculation with a two-hour plan, not a day-long one', async () => {
    const user = userEvent.setup();
    const stop = await loadPage(storage);
    const { wizardStore } = await import('./state/store');
    await saveRecipeFor(user, /Focaccia di Recco/);
    await user.click(screen.getByRole('button', { name: 'Ricette' }));
    await user.click(screen.getByRole('button', { name: 'Duplica' }));
    await user.click(screen.getByRole('button', { name: 'Cancella e duplica' }));

    const { startLocal, bakeLocal, pizzaId } = wizardStore.getState();
    expect(pizzaId).toBe('recco');
    const minutes = (Date.parse(bakeLocal) - Date.parse(startLocal)) / 60_000;
    expect(minutes).toBe(120);
    stop();
  });

  it('keeps a bread calculation across a reload, on the step and with the product', async () => {
    const user = userEvent.setup();
    let stop = await loadPage(storage);
    await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
    await user.click(screen.getByRole('radio', { name: /^Pane/ }));
    await user.click(confirmButton());
    closePage(stop);

    stop = await loadPage(storage);
    await user.click(screen.getByRole('button', { name: 'Riprendi' }));
    expect(screen.getByRole('button', { name: /2\. Farina/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
    await user.click(screen.getByRole('button', { name: /Prodotto e strumenti/ }));
    expect(screen.getByRole('radio', { name: /^Pane/ })).toBeChecked();
    stop();
  });
});
