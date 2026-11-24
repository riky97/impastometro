// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryStorage } from './state/memory-storage';
import { STORAGE_KEY } from './state/persistence';

/** A "page load": fresh module instances (empty store) that restore from the shared storage. */
async function loadPage(storage: Storage, view: 'home' | 'calc' = 'calc') {
  vi.resetModules();
  const { App } = await import('./App');
  const { startPersistence } = await import('./state/session');
  const { wizardStore } = await import('./state/store');
  const { setView } = await import('./state/ui');
  const stop = startPersistence(storage);
  setView(view); // startPersistence opens the dashboard; most tests want the wizard
  render(<App />);
  return { store: wizardStore, stop };
}

/** The page is closing: flush like the browser would on `pagehide`, then tear everything down. */
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

describe('page reload', () => {
  it('lands on the same step with the same inputs', async () => {
    const user = userEvent.setup();
    const first = await loadPage(storage);
    await user.click(screen.getByRole('radio', { name: /Napoletana contemporanea/ }));
    await user.click(screen.getByRole('radio', { name: /Forno a legna/ }));
    await user.click(confirmButton());
    const w = screen.getByLabelText('W minimo');
    await user.clear(w);
    await user.type(w, '300');
    const before = first.store.getState();
    closePage(first.stop);

    const second = await loadPage(storage);
    expect(second.store.getState()).toEqual(before);
    expect(screen.getByRole('button', { name: /Farina/ })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByLabelText('W minimo')).toHaveValue(300);
    expect(screen.getByText('1 di 4 passaggi confermati')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Prodotto e strumenti/ }));
    expect(screen.getByRole('radio', { name: /Napoletana contemporanea/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Forno a legna/ })).toBeChecked();
  });

  it('lands on the result screen, with the dough temperature', async () => {
    const user = userEvent.setup();
    const first = await loadPage(storage);
    for (let step = 1; step <= 4; step++) await user.click(confirmButton());
    await user.type(screen.getByLabelText(/Temperatura misurata/), '26');
    const before = first.store.getState();
    closePage(first.stop);

    const second = await loadPage(storage);
    expect(second.store.getState()).toEqual(before);
    expect(screen.getByRole('heading', { name: 'Tabella di marcia' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Temperatura misurata/)).toHaveValue(26);
  });

  it('survives a corrupt payload with defaults and no crash', async () => {
    storage.setItem(STORAGE_KEY, '{"version":1,"step":"oops"');
    await loadPage(storage);
    expect(screen.getByText('0 di 4 passaggi confermati')).toBeInTheDocument();
  });

  it('shows a banner when the saved bake time has passed, and keeps the data', async () => {
    const user = userEvent.setup();
    const first = await loadPage(storage);
    await user.click(screen.getByRole('radio', { name: /Forno a legna/ }));
    first.store.setState((s) => ({
      ...s,
      bakeLocal: '2020-01-02T19:30',
      startLocal: '2020-01-01T16:00',
    }));
    closePage(first.stop);

    const second = await loadPage(storage);
    expect(screen.getByRole('status')).toHaveTextContent('Le date salvate sono già passate');
    expect(second.store.getState().ovenId).toBe('wood');
    await user.click(screen.getByRole('button', { name: 'Chiudi' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('Nuovo impasto (header)', () => {
  it('asks for confirmation, then wipes the state and the storage', async () => {
    const user = userEvent.setup();
    const page = await loadPage(storage);
    await user.click(screen.getByRole('radio', { name: /Forno a legna/ }));
    window.dispatchEvent(new Event('pagehide'));
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Annulla' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(page.store.getState().ovenId).toBe('wood');

    await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
    await user.click(screen.getByRole('button', { name: 'Cancella e ricomincia' }));
    expect(page.store.getState().ovenId).toBe('gas');
    expect(screen.getByRole('radio', { name: /Forno a gas/ })).toBeChecked();
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    page.stop();
  });

  it('closes the dialog with Escape', async () => {
    const user = userEvent.setup();
    const page = await loadPage(storage);
    await user.click(screen.getByRole('button', { name: 'Nuovo impasto' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    page.stop();
  });
});
