// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryStorage } from './state/memory-storage';
import type { Recipe } from './state/recipes';
import { RECIPES_KEY, STORAGE_KEY } from './state/persistence';

/** A "page load": fresh modules, restored from the shared storage, landing on the dashboard. */
async function loadPage(storage: Storage) {
  vi.resetModules();
  const { App } = await import('./App');
  const { startPersistence } = await import('./state/session');
  const stop = startPersistence(storage);
  render(<App />);
  return stop;
}

/** Closing the tab: flush the pending wizard state, then tear the page down. */
function closePage(stop: () => void) {
  window.dispatchEvent(new Event('pagehide'));
  stop();
  cleanup();
}

const confirmButton = () => screen.getByRole('button', { name: /^Conferma/ });

let storage: MemoryStorage;
beforeEach(() => {
  storage = new MemoryStorage();
});
afterEach(cleanup);

describe('dashboard', () => {
  it('opens on an empty dashboard and starts a new dough', async () => {
    const user = userEvent.setup();
    await loadPage(storage);
    expect(screen.getByRole('heading', { name: 'Le tue ricette' })).toBeInTheDocument();
    expect(screen.getByText(/Nessuna ricetta salvata/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
    expect(screen.getByText('0 di 4 passaggi confermati')).toBeInTheDocument();
  });

  it('saves a recipe from the result and shows it as a card with the essentials', async () => {
    const user = userEvent.setup();
    await loadPage(storage);
    await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
    await user.click(screen.getByRole('radio', { name: /Napoletana contemporanea/ }));
    for (let step = 1; step <= 4; step++) await user.click(confirmButton());
    await user.click(screen.getByRole('button', { name: 'Salva ricetta' }));
    expect(screen.getByRole('button', { name: 'Ricetta salvata' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Ricette' }));
    const card = screen
      .getByRole('heading', { name: 'Napoletana contemporanea' })
      .closest('li') as HTMLElement;
    expect(within(card).getByText(/panetti da 260 g/)).toBeInTheDocument();
    expect(within(card).getByText('Spirale')).toBeInTheDocument();
    expect(within(card).getByText('Forno a gas')).toBeInTheDocument();
    expect(storage.getItem(RECIPES_KEY)).toContain('contemporanea');
  });

  it('keeps recipes across a reload and shows one with the times it was saved with', async () => {
    const user = userEvent.setup();
    let stop = await loadPage(storage);
    const { wizardStore } = await import('./state/store');
    await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
    for (let step = 1; step <= 4; step++) await user.click(confirmButton());
    wizardStore.setState((s) => ({
      ...s,
      startLocal: '2026-11-20T15:30',
      bakeLocal: '2026-11-21T19:30',
    }));
    await user.click(screen.getByRole('button', { name: 'Salva ricetta' }));
    closePage(stop);

    stop = await loadPage(storage);
    expect(screen.getByRole('heading', { name: 'Napoletana classica' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Vedi ricetta' }));
    expect(screen.getByRole('heading', { name: 'Tabella di marcia' })).toBeInTheDocument();
    expect(screen.getByText('ven 20 nov, 15:30')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Temperatura reale/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salva ricetta' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ricette' }));
    expect(screen.getByRole('heading', { name: 'Le tue ricette' })).toBeInTheDocument();
    stop();
  });

  it('opens a recipe saved before times were kept, with a plan that starts now', async () => {
    const user = userEvent.setup();
    let stop = await loadPage(storage);
    await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
    for (let step = 1; step <= 4; step++) await user.click(confirmButton());
    await user.click(screen.getByRole('button', { name: 'Salva ricetta' }));
    closePage(stop);

    // The shape saved before dates were kept: the four optional fields are absent.
    const dropped = new Set(['startLocal', 'bakeLocal', 'doughTempC', 'showDryYeast']);
    const old = JSON.parse(storage.getItem(RECIPES_KEY) as string) as {
      data: Record<string, unknown>;
    }[];
    for (const recipe of old) {
      recipe.data = Object.fromEntries(
        Object.entries(recipe.data).filter(([k]) => !dropped.has(k)),
      );
    }
    storage.setItem(RECIPES_KEY, JSON.stringify(old));

    stop = await loadPage(storage);
    await user.click(screen.getByRole('button', { name: 'Vedi ricetta' }));
    expect(screen.getByText(/salvata senza orari/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tabella di marcia' })).toBeInTheDocument();
    stop();
  });

  it('shows the unfinished calculation as a card and resumes it', async () => {
    const user = userEvent.setup();
    let stop = await loadPage(storage);
    await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
    await user.click(confirmButton());
    closePage(stop);

    stop = await loadPage(storage);
    expect(screen.getByText('Calcolo in corso')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Riprendi' }));
    expect(screen.getByRole('button', { name: /2\. Farina/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
    stop();
  });

  it('renames and deletes a recipe, asking before deleting', async () => {
    const user = userEvent.setup();
    const stop = await loadPage(storage);
    await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
    for (let step = 1; step <= 4; step++) await user.click(confirmButton());
    await user.click(screen.getByRole('button', { name: 'Salva ricetta' }));
    await user.click(screen.getByRole('button', { name: 'Ricette' }));

    await user.click(screen.getByRole('button', { name: 'Rinomina' }));
    const name = screen.getByLabelText('Nome della ricetta');
    await user.clear(name);
    await user.type(name, 'Sabato con gli amici{Enter}');
    expect(screen.getByRole('heading', { name: 'Sabato con gli amici' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Elimina' }));
    await user.click(screen.getByRole('button', { name: 'Annulla' }));
    expect(screen.getByRole('heading', { name: 'Sabato con gli amici' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Elimina' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Elimina' }));
    expect(screen.queryByRole('heading', { name: 'Sabato con gli amici' })).not.toBeInTheDocument();
    stop();
  });

  it('duplicates a recipe into a prefilled calculation with fresh dates, asking first', async () => {
    const user = userEvent.setup();
    const stop = await loadPage(storage);
    const { wizardStore } = await import('./state/store');
    await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
    for (let step = 1; step <= 4; step++) await user.click(confirmButton());
    wizardStore.setState((s) => ({
      ...s,
      startLocal: '2026-11-20T15:30',
      bakeLocal: '2026-11-21T19:30',
    }));
    await user.click(screen.getByRole('button', { name: 'Salva ricetta' }));
    await user.click(screen.getByRole('button', { name: 'Ricette' }));

    await user.click(screen.getByRole('button', { name: 'Duplica' }));
    await user.click(screen.getByRole('button', { name: 'Annulla' }));
    expect(screen.getByRole('heading', { name: 'Le tue ricette' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Duplica' }));
    await user.click(screen.getByRole('button', { name: 'Cancella e duplica' }));
    expect(screen.getByRole('button', { name: /4\. Tempo/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByText('3 di 4 passaggi confermati')).toBeInTheDocument();
    expect(wizardStore.getState().startLocal).not.toBe('2026-11-20T15:30');
    stop();
  });

  it('imports a backup, skips recipes already saved and refuses other files', async () => {
    const user = userEvent.setup();
    const { serializeRecipes } = await import('./state/recipes');
    const stop = await loadPage(storage);
    await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
    for (let step = 1; step <= 4; step++) await user.click(confirmButton());
    await user.click(screen.getByRole('button', { name: 'Salva ricetta' }));
    await user.click(screen.getByRole('button', { name: 'Ricette' }));

    const { recipesStore } = await import('./state/recipes');
    const saved = recipesStore.getState()[0] as Recipe;
    const backup = serializeRecipes([saved, { ...saved, id: 'altro', name: 'Dal telefono' }]);
    const pick = (text: string) =>
      user.upload(
        screen.getByLabelText('File delle ricette'),
        new File([text], 'ricette.json', { type: 'application/json' }),
      );

    await pick(backup);
    expect(await screen.findByText('Importata 1 ricetta.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dal telefono' })).toBeInTheDocument();

    await pick(backup);
    expect(await screen.findByText(/Nessuna ricetta nuova/)).toBeInTheDocument();

    await pick('{"recipes":[]}');
    expect(await screen.findByText(/non è un backup valido/)).toBeInTheDocument();
    stop();
  });

  it('ignores a corrupt recipes payload and leaves the wizard state alone', async () => {
    storage.setItem(RECIPES_KEY, '[{"id":1}]');
    storage.setItem(STORAGE_KEY, 'not json');
    await loadPage(storage);
    expect(screen.getByText(/Nessuna ricetta salvata/)).toBeInTheDocument();
  });
});
