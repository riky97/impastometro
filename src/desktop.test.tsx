// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryStorage } from './state/memory-storage';

/** A wide screen: the media query for the rail matches. */
function stubDesktop() {
  window.matchMedia = ((query: string) => ({
    matches: true,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
}

async function loadPage(storage: Storage) {
  vi.resetModules();
  const { App } = await import('./App');
  const { startPersistence } = await import('./state/session');
  const stop = startPersistence(storage);
  render(<App />);
  return stop;
}

const confirmButton = () => screen.getByRole('button', { name: /^Conferma/ });
const rail = () => screen.getByRole('complementary', { name: 'Ricette' });

beforeEach(() => {
  stubDesktop();
});
afterEach(() => {
  cleanup();
  // @ts-expect-error restore the jsdom default (no matchMedia)
  delete window.matchMedia;
});

describe('desktop rail', () => {
  it('opens on the calculation with the recipes beside it, not on a dashboard', async () => {
    const stop = await loadPage(new MemoryStorage());
    expect(screen.queryByRole('heading', { name: 'Le tue ricette' })).not.toBeInTheDocument();
    expect(within(rail()).getByRole('button', { name: 'Nuovo impasto' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prodotto e strumenti/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
    stop();
  });

  it('lists a saved recipe, opens it from the rail and manages it from its page', async () => {
    const user = userEvent.setup();
    const stop = await loadPage(new MemoryStorage());
    for (let step = 1; step <= 4; step++) await user.click(confirmButton());
    await user.click(screen.getByRole('button', { name: 'Salva ricetta' }));

    expect(within(rail()).getByText('In corso')).toBeInTheDocument();
    const item = within(rail()).getByRole('button', { name: /^Napoletana classica/ });
    expect(item).toHaveTextContent('6 × 280 g · 63%');

    await user.click(item);
    expect(item).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'Napoletana classica', level: 2 })).toBeVisible();

    // Rename from the page: the rail follows.
    await user.click(screen.getByRole('button', { name: 'Rinomina' }));
    const name = screen.getByLabelText('Nome della ricetta');
    await user.clear(name);
    await user.type(name, 'Sabato{Enter}');
    expect(within(rail()).getByRole('button', { name: /Sabato/ })).toBeInTheDocument();

    // Delete from the page: asks first, then the recipe leaves the rail and the work comes back.
    await user.click(screen.getByRole('button', { name: 'Elimina' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Elimina' }));
    expect(within(rail()).queryByRole('button', { name: /Sabato/ })).not.toBeInTheDocument();
    expect(within(rail()).getByText('Ricette salvate · 0')).toBeInTheDocument();
    stop();
  });

  it('duplicates from the recipe page into a prefilled calculation', async () => {
    const user = userEvent.setup();
    const stop = await loadPage(new MemoryStorage());
    for (let step = 1; step <= 4; step++) await user.click(confirmButton());
    await user.click(screen.getByRole('button', { name: 'Salva ricetta' }));
    await user.click(within(rail()).getByRole('button', { name: /^Napoletana classica/ }));

    await user.click(screen.getByRole('button', { name: 'Duplica' }));
    await user.click(screen.getByRole('button', { name: 'Cancella e duplica' }));
    expect(screen.getByRole('button', { name: /4\. Tempo/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
    stop();
  });
});
