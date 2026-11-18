import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDefaultState } from './defaults';
import { MemoryStorage } from './memory-storage';
import { SAVE_DEBOUNCE_MS, STORAGE_KEY, createPersistence, parsePayload } from './persistence';
import { SCHEMA_VERSION, type WizardState } from './schema';
import { createStore } from './store';

const NOW = new Date(2026, 10, 14, 16, 0).getTime();

function setup(storage: MemoryStorage | null = new MemoryStorage()) {
  const store = createStore<WizardState>(createDefaultState(NOW));
  const persistence = createPersistence(store, storage, { now: () => NOW });
  return { store, persistence, storage };
}

const edited = (state: WizardState): WizardState => ({
  ...state,
  pizzaId: 'contemporanea',
  ovenId: 'wood',
  balls: 8,
  confirmed: [true, true, false, false],
  step: 3,
});

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('saving', () => {
  it('waits for the debounce and saves only the latest state', () => {
    const { store, storage } = setup();
    store.setState((s) => ({ ...s, balls: 3 }));
    store.setState((s) => ({ ...s, balls: 4 }));
    store.setState((s) => ({ ...s, balls: 5 }));
    vi.advanceTimersByTime(SAVE_DEBOUNCE_MS - 1);
    expect(storage?.getItem(STORAGE_KEY)).toBeNull();
    vi.advanceTimersByTime(1);
    expect(JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({ balls: 5 });
  });

  it('flush writes immediately, and only when something is pending', () => {
    const { store, persistence, storage } = setup();
    persistence.flush();
    expect(storage?.getItem(STORAGE_KEY)).toBeNull();
    store.setState((s) => ({ ...s, balls: 9 }));
    persistence.flush();
    expect(JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({ balls: 9 });
  });

  it('stops saving after dispose', () => {
    const { store, persistence, storage } = setup();
    persistence.dispose();
    store.setState((s) => ({ ...s, balls: 2 }));
    vi.advanceTimersByTime(1000);
    expect(storage?.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('restoring', () => {
  it('returns defaults when nothing is saved', () => {
    const { persistence } = setup();
    const result = persistence.restore();
    expect(result.status).toBe('empty');
    expect(result.state).toEqual(createDefaultState(NOW));
    expect(result.datesInPast).toBe(false);
  });

  it('restores exactly what was saved', () => {
    const storage = new MemoryStorage();
    const first = setup(storage);
    const saved = edited(first.store.getState());
    first.store.setState(() => saved);
    vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);

    const second = setup(storage);
    const result = second.persistence.restore();
    expect(result.status).toBe('restored');
    expect(result.state).toEqual(saved);
  });

  it.each([
    ['broken JSON', '{not json'],
    ['null', 'null'],
    ['an array', '[]'],
    ['a string', '"hello"'],
    ['an empty object', '{}'],
    ['another schema version', JSON.stringify({ ...createDefaultState(NOW), version: 2 })],
    ['a wrong field type', JSON.stringify({ ...createDefaultState(NOW), balls: 'many' })],
    ['an unknown enum value', JSON.stringify({ ...createDefaultState(NOW), ovenId: 'microwave' })],
    ['a bad confirmed tuple', JSON.stringify({ ...createDefaultState(NOW), confirmed: [true] })],
    ['a step out of range', JSON.stringify({ ...createDefaultState(NOW), step: 7 })],
  ])('discards %s and falls back to defaults', (_name, payload) => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, payload);
    const { persistence } = setup(storage);
    const result = persistence.restore();
    expect(result.status).toBe('discarded');
    expect(result.state).toEqual(createDefaultState(NOW));
  });

  it('puts the user back on a reachable step', () => {
    const impossible = { ...createDefaultState(NOW), step: 3, showResult: true };
    const state = parsePayload(JSON.stringify(impossible));
    expect(state).toMatchObject({ step: 1, showResult: false });
  });

  it('keeps a valid result view', () => {
    const done = {
      ...createDefaultState(NOW),
      step: 4,
      showResult: true,
      confirmed: [true, true, true, true],
    };
    expect(parsePayload(JSON.stringify(done))).toMatchObject({ step: 4, showResult: true });
  });

  it('carries the schema version', () => {
    expect(createDefaultState(NOW).version).toBe(SCHEMA_VERSION);
    expect(STORAGE_KEY).toBe('impastometro:state:v1');
  });
});

describe('dates in the past', () => {
  it('keeps every other value and flags the stale bake time', () => {
    const storage = new MemoryStorage();
    const stale = { ...edited(createDefaultState(NOW)), bakeLocal: '2026-11-10T19:30' };
    storage.setItem(STORAGE_KEY, JSON.stringify(stale));
    const result = setup(storage).persistence.restore();
    expect(result.status).toBe('restored');
    expect(result.datesInPast).toBe(true);
    expect(result.state).toEqual(stale);
  });

  it('does not flag a plan that is still running', () => {
    const storage = new MemoryStorage();
    const running = { ...createDefaultState(NOW), startLocal: '2026-11-14T10:00' };
    storage.setItem(STORAGE_KEY, JSON.stringify(running));
    expect(setup(storage).persistence.restore().datesInPast).toBe(false);
  });
});

describe('reset', () => {
  it('clears storage, restores defaults and does not save them back', () => {
    const { store, persistence, storage } = setup();
    store.setState(edited);
    persistence.flush();
    expect(storage?.getItem(STORAGE_KEY)).not.toBeNull();

    persistence.reset();
    expect(store.getState()).toEqual(createDefaultState(NOW));
    vi.advanceTimersByTime(1000);
    expect(storage?.getItem(STORAGE_KEY)).toBeNull();
  });

  it('cancels a pending save', () => {
    const { store, persistence, storage } = setup();
    store.setState(edited);
    persistence.reset();
    vi.advanceTimersByTime(1000);
    expect(storage?.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('unavailable storage', () => {
  const broken = (): Storage => {
    const fail = () => {
      throw new DOMException('denied', 'SecurityError');
    };
    return { getItem: fail, setItem: fail, removeItem: fail } as unknown as Storage;
  };

  it('never throws when storage fails', () => {
    const store = createStore<WizardState>(createDefaultState(NOW));
    const persistence = createPersistence(store, broken(), { now: () => NOW });
    expect(persistence.restore().status).toBe('empty');
    store.setState((s) => ({ ...s, balls: 3 }));
    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
    expect(() => persistence.flush()).not.toThrow();
    expect(() => persistence.reset()).not.toThrow();
  });

  it('works without any storage object', () => {
    const { store, persistence } = setup(null);
    expect(persistence.restore().status).toBe('empty');
    store.setState((s) => ({ ...s, balls: 3 }));
    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
  });
});
