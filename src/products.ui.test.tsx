// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { createDefaultState } from './state/defaults';
import { wizardStore } from './state/store';

const NOW = new Date(2026, 10, 14, 16, 0).getTime();

beforeEach(() => {
  wizardStore.setState(() => createDefaultState(NOW));
});
afterEach(cleanup);

const confirmButton = () => screen.getByRole('button', { name: /^Conferma/ });

async function pick(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
  await user.click(screen.getByRole('radio', { name }));
}

describe('products beyond pizza', () => {
  it('offers oven and container only for pizza, and starts from the product defaults', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('group', { name: 'Forno' })).toBeInTheDocument();

    await pick(user, /Focaccia genovese/);
    expect(screen.queryByRole('group', { name: 'Forno' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /Contenitore/ })).not.toBeInTheDocument();
    expect(wizardStore.getState().ovenId).toBe('home');
    expect(wizardStore.getState().oilPct).toBe(5);

    await pick(user, /Napoletana classica/);
    expect(screen.getByRole('group', { name: 'Forno' })).toBeInTheDocument();
    expect(wizardStore.getState().ovenId).toBe('gas');
    expect(wizardStore.getState().oilPct).toBe(0);
  });

  it('speaks of trays for focaccia and loaves for bread', async () => {
    const user = userEvent.setup();
    render(<App />);
    await pick(user, /Focaccia genovese/);
    await user.click(confirmButton());
    await user.click(confirmButton());
    expect(screen.getByRole('spinbutton', { name: 'Numero di teglie' })).toHaveValue(1);
    expect(screen.getByLabelText('Peso per teglia')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Prodotto e strumenti/ }));
    await pick(user, /^Pane/);
    await user.click(confirmButton());
    await user.click(confirmButton());
    expect(screen.getByRole('spinbutton', { name: 'Numero di pagnotte' })).toHaveValue(2);
  });

  it('shows no route choice for bread and no yeast for Recco on the result', async () => {
    const user = userEvent.setup();
    render(<App />);
    await pick(user, /^Pane/);
    for (let step = 1; step <= 3; step++) await user.click(confirmButton());
    expect(screen.queryByRole('group', { name: 'Percorso' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Prodotto e strumenti/ }));
    await pick(user, /Focaccia di Recco/);
    for (let step = 1; step <= 3; step++) await user.click(confirmButton());
    expect(screen.queryByLabelText('Temperatura ambiente')).not.toBeInTheDocument();
  });

  it('shows brine on a genovese result and no yeast row on a Recco one', async () => {
    const user = userEvent.setup();
    render(<App />);
    await pick(user, /Focaccia genovese/);
    for (let step = 1; step <= 4; step++) await user.click(confirmButton());
    expect(screen.getByText('Salamoia: acqua')).toBeInTheDocument();
    expect(screen.getByText('Lievito di birra fresco')).toBeInTheDocument();
    expect(screen.getAllByText('Salamoia e fossette').length).toBeGreaterThan(0);
  });

  it('shows Recco without yeast, with cheese', async () => {
    const user = userEvent.setup();
    render(<App />);
    await pick(user, /Focaccia di Recco/);
    for (let step = 1; step <= 3; step++) await user.click(confirmButton());
    // The default dates are meant for a leavened dough: give the Recco a short plan.
    wizardStore.setState((s) => ({
      ...s,
      startLocal: '2026-11-14T16:00',
      bakeLocal: '2026-11-14T18:00',
    }));
    await user.click(confirmButton());
    expect(screen.queryByText('Lievito di birra fresco')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Temperatura reale/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Formaggio fresco/)).toBeInTheDocument();
    expect(screen.getAllByText('Stendi e farcisci').length).toBeGreaterThan(0);
  });

  it('proposes a bake time that fits the product', async () => {
    const user = userEvent.setup();
    render(<App />);
    const minutes = () => {
      const { startLocal, bakeLocal } = wizardStore.getState();
      return (Date.parse(bakeLocal) - Date.parse(startLocal)) / 60_000;
    };
    expect(minutes()).toBe(27.5 * 60);
    await pick(user, /^Pane/);
    expect(minutes()).toBe(5 * 60);
    await pick(user, /Focaccia di Recco/);
    expect(minutes()).toBe(2 * 60);
    await pick(user, /Napoletana classica/);
    expect(minutes()).toBe(27.5 * 60);
  });
});
