// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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

describe('wizard', () => {
  it('starts with nothing confirmed and later steps locked', () => {
    render(<App />);
    expect(screen.getByText('0 di 4 passaggi confermati')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Farina/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Prodotto e strumenti/ })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  it('unlocks the next step once a step is confirmed', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(confirmButton());
    expect(screen.getByText('1 di 4 passaggi confermati')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Farina/ })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: /Quantità/ })).toBeDisabled();
  });

  it('shows the suitability badge for the chosen oven', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getAllByText('Consigliato')).toHaveLength(2);
    await user.click(screen.getByRole('radio', { name: /Forno di casa/ }));
    expect(screen.getByText('Sconsigliato')).toBeInTheDocument();
    expect(screen.getByText('Da valutare')).toBeInTheDocument();
  });

  it('blocks confirmation and explains invalid input in Italian', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(confirmButton());
    const wMin = screen.getByLabelText('W minimo');
    await user.clear(wMin);
    await user.type(wMin, '100');
    expect(screen.getByRole('alert')).toHaveTextContent('La forza W deve essere tra 150 e 450.');
    expect(wMin).toHaveAccessibleDescription(/La forza W/);
    expect(confirmButton()).toBeDisabled();
  });

  it('walks through all four steps to the result and back', async () => {
    const user = userEvent.setup();
    render(<App />);
    for (let step = 1; step <= 4; step++) await user.click(confirmButton());

    expect(screen.getByRole('heading', { name: 'Ingredienti' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tabella di marcia' })).toBeInTheDocument();
    expect(screen.getByText(/6 panetti da 280 g/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Modifica i dati' }));
    expect(screen.getByText('4 di 4 passaggi confermati')).toBeInTheDocument();
  });

  it('keeps the result usable when the dough temperature is typed', async () => {
    const user = userEvent.setup();
    render(<App />);
    for (let step = 1; step <= 4; step++) await user.click(confirmButton());
    await user.type(screen.getByLabelText(/Temperatura misurata/), '27');
    expect(wizardStore.getState().doughTempC).toBe(27);
    expect(screen.getByRole('heading', { name: 'Tabella di marcia' })).toBeInTheDocument();
  });

  it('rejects a bake time before the start', async () => {
    const user = userEvent.setup();
    render(<App />);
    for (let step = 1; step <= 3; step++) await user.click(confirmButton());
    fireEvent.change(screen.getByLabelText('Ora di cottura, data'), {
      target: { value: '2026-11-14' },
    });
    await user.selectOptions(screen.getByLabelText('Ora di cottura, ore'), '10');
    await user.selectOptions(screen.getByLabelText('Ora di cottura, minuti'), '00');
    expect(screen.getByRole('alert')).toHaveTextContent('La cottura deve essere dopo l’inizio');
    expect(confirmButton()).toBeDisabled();
  });
  it('picks the time on a 24-hour clock and keeps the stored format', async () => {
    const user = userEvent.setup();
    render(<App />);
    for (let step = 1; step <= 3; step++) await user.click(confirmButton());
    const hours = screen.getByLabelText('Inizio impasto, ore');
    expect(within(hours).getAllByRole('option')).toHaveLength(24);
    await user.selectOptions(hours, '15');
    await user.selectOptions(screen.getByLabelText('Inizio impasto, minuti'), '30');
    expect(wizardStore.getState().startLocal).toMatch(/^\d{4}-\d{2}-\d{2}T15:30$/);
  });

  it('lets the oil slider move within each pizza’s cap', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('radio', { name: /Napoletana classica/ }));
    await user.click(confirmButton());
    const oil = screen.getByLabelText("Olio d'oliva");
    expect(oil).toBeEnabled();
    expect(oil).toHaveAttribute('max', '1');

    await user.click(screen.getByRole('button', { name: /Prodotto e strumenti/ }));
    await user.click(screen.getByRole('radio', { name: /Napoletana contemporanea/ }));
    await user.click(confirmButton());
    expect(screen.getByLabelText("Olio d'oliva")).toHaveAttribute('max', '2');
  });

  it('marks both W fields invalid when the range is inverted', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(confirmButton());
    const wMin = screen.getByLabelText('W minimo');
    await user.clear(wMin);
    await user.type(wMin, '400');
    expect(screen.getByLabelText('W massimo')).toBeInvalid();
    expect(wMin).toBeInvalid();
    expect(screen.getByRole('alert')).toHaveTextContent('non può essere maggiore');
  });

  it('fixes the hydration when flour and method leave no room', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('radio', { name: /Napoletana contemporanea/ }));
    await user.click(confirmButton());
    const wMin = screen.getByLabelText('W minimo');
    const wMax = screen.getByLabelText('W massimo');
    await user.clear(wMin);
    await user.type(wMin, '150');
    await user.clear(wMax);
    await user.type(wMax, '150');
    expect(screen.getByLabelText('Idratazione')).toBeDisabled();
    expect(screen.getByText(/l’idratazione è fissa/)).toBeInTheDocument();
  });

  it('labels the tabs in full for assistive technology and marks confirmed ones', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(confirmButton());
    expect(
      screen.getByRole('button', { name: '1. Prodotto e strumenti (confermato)' }),
    ).toBeEnabled();
  });
});
