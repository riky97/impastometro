import { describe, expect, it } from 'vitest';
import { PRODUCT_IDS, PROFILES } from '../data/profiles';
import { calculate } from './calculate';
import { parseLocalDateTime } from './dates';
import { referenceInput } from './fixtures';
import type { CalcInput } from './types';

const at = (local: string): number => parseLocalDateTime(local) ?? NaN;

/** A focaccia genovese: one 600 g tray, 66 % hydration, 5 % oil, fridge overnight. */
const genovese = (overrides: Partial<CalcInput> = {}): CalcInput =>
  referenceInput({
    pizzaId: 'genovese',
    ovenId: 'home',
    ovenModelId: null,
    wMin: 280,
    wMax: 320,
    hydrationPct: 66,
    oilPct: 5,
    quantity: { mode: 'balls', balls: 1, ballWeightG: 600 },
    startMs: at('2026-11-14T16:00'),
    bakeMs: at('2026-11-15T12:00'),
    ...overrides,
  });

const pane = (overrides: Partial<CalcInput> = {}): CalcInput =>
  referenceInput({
    pizzaId: 'pane',
    ovenId: 'home',
    ovenModelId: null,
    wMin: 280,
    wMax: 320,
    hydrationPct: 65,
    quantity: { mode: 'balls', balls: 2, ballWeightG: 500 },
    route: 'no-fridge',
    startMs: at('2026-11-14T08:00'),
    bakeMs: at('2026-11-14T13:00'),
    ...overrides,
  });

const recco = (overrides: Partial<CalcInput> = {}): CalcInput =>
  referenceInput({
    pizzaId: 'recco',
    ovenId: 'home',
    ovenModelId: null,
    wMin: 280,
    wMax: 320,
    hydrationPct: 50,
    oilPct: 10,
    quantity: { mode: 'balls', balls: 1, ballWeightG: 300 },
    route: 'no-fridge',
    startMs: at('2026-11-14T16:00'),
    bakeMs: at('2026-11-14T18:00'),
    ...overrides,
  });

const sumOfSpans = (r: ReturnType<typeof calculate>): number =>
  r.schedule.phases.reduce((n, p) => n + p.durationMin, 0);

describe('every product', () => {
  it('has a profile that is consistent with its own limits', () => {
    for (const id of PRODUCT_IDS) {
      const p = PROFILES[id];
      expect(p.hydrationPct.min).toBeLessThanOrEqual(p.hydrationPct.default);
      expect(p.hydrationPct.default).toBeLessThanOrEqual(p.hydrationPct.max);
      expect(p.oil.default).toBeLessThanOrEqual(p.oil.maxPct);
      expect(p.ballG.default).toBeGreaterThanOrEqual(p.unit.limitsG.min);
      expect(p.ballG.default).toBeLessThanOrEqual(p.unit.limitsG.max);
      expect(p.unit.count.default).toBeGreaterThanOrEqual(p.unit.count.min);
      expect(p.routes.length).toBeGreaterThan(0);
    }
  });

  it('keeps the pizza reference case untouched', () => {
    const r = calculate(referenceInput());
    expect(r.ingredients.waterG).toBe(630);
    expect(r.ingredients.freshYeastG).toBe(1);
    expect(r.leavened).toBe(true);
    expect(r.extras).toEqual([]);
  });
});

describe('focaccia genovese', () => {
  it('is valid and plans every minute between start and bake', () => {
    const r = calculate(genovese());
    expect(r.valid).toBe(true);
    expect(Math.round(sumOfSpans(r))).toBe(r.schedule.totalMin);
    expect(r.schedule.phases.map((p) => p.id)).toEqual([
      'mix',
      'rest',
      'shape',
      'preFridgeRise',
      'fridge',
      'outOfFridge',
      'topping',
      'bake',
    ]);
  });

  it('puts oil in the dough and computes brine and pan oil per gram of dough', () => {
    const r = calculate(genovese());
    expect(r.ingredients.oilG).toBeGreaterThan(0);
    const g = Object.fromEntries(r.extras.map((e) => [e.id, e.g]));
    expect(g.brineWater).toBe(120);
    expect(g.brineOil).toBe(60);
    expect(g.brineSalt).toBe(11);
    expect(g.panOil).toBe(24);
  });

  it('uses more yeast than a pizza over the same schedule', () => {
    const asFocaccia = calculate(genovese()).schedule.yeastPct;
    const asPizza = calculate(genovese({ pizzaId: 'contemporanea', hydrationPct: 68, oilPct: 0 }))
      .schedule.yeastPct;
    expect(asFocaccia / asPizza).toBeGreaterThan(1.8);
    expect(asFocaccia / asPizza).toBeLessThan(2.6);
  });

  it('has a direct route that ends with the brine 20 minutes before baking', () => {
    const r = calculate(genovese({ route: 'no-fridge', bakeMs: at('2026-11-14T22:00') }));
    expect(r.valid).toBe(true);
    const brine = r.schedule.phases.find((p) => p.id === 'topping');
    const bake = r.schedule.phases.find((p) => p.id === 'bake');
    expect(((bake?.startMs ?? 0) - (brine?.startMs ?? 0)) / 60_000).toBe(20);
  });
});

describe('pane', () => {
  it('rests for the time left and proofs for a fixed 50 minutes', () => {
    const r = calculate(pane());
    expect(r.valid).toBe(true);
    const rest = r.schedule.phases.find((p) => p.id === 'rest');
    const proof = r.schedule.phases.find((p) => p.id === 'ambientRise');
    expect(proof?.durationMin).toBe(50);
    expect(rest?.durationMin).toBe(300 - 13 - 50);
    expect(Math.round(sumOfSpans(r))).toBe(r.schedule.totalMin);
  });

  it('ignores a fridge route it does not have', () => {
    const r = calculate(pane({ route: 'fridge' }));
    expect(r.route).toBe('no-fridge');
    expect(r.schedule.fridgeMin).toBe(0);
    expect(r.valid).toBe(true);
  });

  it('rejects a time that is too short for a bread', () => {
    const r = calculate(pane({ bakeMs: at('2026-11-14T09:30') }));
    expect(r.issues.map((i) => i.code)).toContain('total-too-short');
  });

  it('uses about one percent of fresh yeast over a few hours', () => {
    const pct = calculate(pane()).schedule.yeastPct;
    expect(pct).toBeGreaterThan(0.4);
    expect(pct).toBeLessThan(1.2);
  });

  it('has no extra ingredients and limits the loaf weight', () => {
    expect(calculate(pane()).extras).toEqual([]);
    const tooLight = calculate(pane({ quantity: { mode: 'balls', balls: 2, ballWeightG: 100 } }));
    expect(tooLight.issues.map((i) => i.code)).toContain('ball-weight-out-of-range');
  });
});

describe('focaccia di Recco', () => {
  it('has no yeast and no fermentation', () => {
    const r = calculate(recco());
    expect(r.valid).toBe(true);
    expect(r.leavened).toBe(false);
    expect(r.schedule.yeastPct).toBe(0);
    expect(r.ingredients.freshYeastG).toBe(0);
    expect(r.ingredients.yeastNeedsDilution).toBe(false);
    expect(r.schedule.phases.map((p) => p.id)).toEqual(['mix', 'rest', 'topping', 'bake']);
    expect(Math.round(sumOfSpans(r))).toBe(r.schedule.totalMin);
  });

  it('weighs the cheese against the dough', () => {
    const r = calculate(recco());
    expect(r.extras).toEqual([{ id: 'cheese', g: 300 }]);
  });

  it('needs at least an hour', () => {
    const r = calculate(recco({ bakeMs: at('2026-11-14T16:40') }));
    expect(r.issues.map((i) => i.code)).toContain('total-too-short');
  });
});
