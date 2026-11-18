import { describe, expect, it } from 'vitest';
import { PROFILES } from '../data/profiles';
import { calculate } from './calculate';
import { hydrationBounds, oilBounds } from './hydration';
import { buildSchedule } from './schedule';
import { pizzaOvenSuitability, wSuitability } from './suitability';
import { effectiveHours, yeastPct } from './yeast';
import { waterTempC } from './water';
import { referenceInput } from './fixtures';
import { parseLocalDateTime } from './dates';

const at = (s: string): number => parseLocalDateTime(s) ?? NaN;

describe('hydration bounds', () => {
  it('is capped by the profile, method and W', () => {
    expect(hydrationBounds(PROFILES.classica, 'spirale', 370)).toEqual({
      min: 55,
      max: 63,
      recommended: 63,
    });
    // hand cap 65, W cap 50 + 0.06 * 300 = 68 -> 65
    expect(hydrationBounds(PROFILES.contemporanea, 'mano', 300).max).toBe(65);
    // low W cap 59 collapses the range
    expect(hydrationBounds(PROFILES.contemporanea, 'spirale', 150)).toEqual({
      min: 59,
      max: 59,
      recommended: 59,
    });
    expect(hydrationBounds(PROFILES.contemporanea, 'spirale', 400)).toEqual({
      min: 65,
      max: 74,
      recommended: 68,
    });
  });

  it('caps oil per profile', () => {
    expect(oilBounds(PROFILES.classica)).toEqual({ min: 0, max: 1 });
    expect(oilBounds(PROFILES.contemporanea)).toEqual({ min: 0, max: 2 });
    const r = calculate(referenceInput({ oilPct: 2 }));
    expect(r.oilPct).toBe(1);
  });
});

describe('suitability', () => {
  it('rates pizza and oven', () => {
    expect(pizzaOvenSuitability('classica', 'home')).toBe('discouraged');
    expect(pizzaOvenSuitability('contemporanea', 'home')).toBe('evaluate');
    expect(pizzaOvenSuitability('classica', 'wood')).toBe('recommended');
    expect(pizzaOvenSuitability('contemporanea', 'electric')).toBe('recommended');
  });

  it('rates flour strength', () => {
    expect(wSuitability(PROFILES.classica, 300)).toBe('recommended');
    expect(wSuitability(PROFILES.classica, 340)).toBe('evaluate');
    expect(wSuitability(PROFILES.classica, 370)).toBe('discouraged');
    expect(wSuitability(PROFILES.contemporanea, 330)).toBe('recommended');
  });
});

describe('yeast and water temperature', () => {
  it('shrinks with more effective hours and respects clamps', () => {
    expect(yeastPct(24)).toBeLessThan(yeastPct(12));
    expect(yeastPct(10_000)).toBe(0.03);
    expect(yeastPct(0.01)).toBe(1.5);
    expect(effectiveHours(8, 20)).toBe(13);
  });

  it('applies the friction factor and the 5-30 clamp', () => {
    expect(waterTempC(PROFILES.classica, 'spirale', 23, 23)).toBe(10);
    expect(waterTempC(PROFILES.classica, 'spirale', 23, 40)).toBe(5);
    expect(waterTempC(PROFILES.classica, 'mano', 5, 5)).toBe(30);
  });

  it('flags tiny yeast quantities for dilution', () => {
    const r = calculate(
      referenceInput({
        quantity: { mode: 'flour', flourKg: 0.25, ballWeightG: 280, split: 'keep-weight' },
      }),
    );
    expect(r.ingredients.freshYeastG).toBeGreaterThan(0.2);
    expect(r.ingredients.yeastNeedsDilution).toBe(true);
    expect(r.ingredients.dryYeastG).toBeCloseTo(r.ingredients.freshYeastG / 3, 1);
  });
});

describe('quantities', () => {
  it('derives flour from the number of balls', () => {
    const r = calculate(
      referenceInput({ quantity: { mode: 'balls', balls: 6, ballWeightG: 280 } }),
    );
    expect(r.balls).toEqual({ count: 6, weightG: 280, leftoverG: 0 });
    expect(Math.abs(r.ingredients.totalG - 1680)).toBeLessThanOrEqual(2);
  });

  it('adds oil to the total for contemporanea', () => {
    const r = calculate(
      referenceInput({ pizzaId: 'contemporanea', hydrationPct: 68, oilPct: 1.5 }),
    );
    expect(r.ingredients.oilG).toBe(15);
    expect(r.ingredients.totalG).toBe(
      Math.round(
        r.ingredients.flourG +
          r.ingredients.waterG +
          r.ingredients.saltG +
          r.ingredients.oilG +
          r.ingredients.freshYeastG,
      ),
    );
  });
});

describe('schedule', () => {
  const base = {
    startMs: at('2026-11-14T16:00'),
    bakeMs: at('2026-11-15T19:30'),
    ambientTempC: 23,
    mixingMin: 13,
    targetDoughTempC: 25,
  };

  it('phases always add up to the total (fridge route)', () => {
    const s = buildSchedule({ ...base, route: 'fridge' });
    const spans = s.phases.filter((p) => p.kind === 'span');
    expect(spans.reduce((sum, p) => sum + p.durationMin, 0)).toBe(s.totalMin);
  });

  it('shortens the out-of-fridge time after 48 h of cold', () => {
    const normal = buildSchedule({ ...base, route: 'fridge' });
    const long = buildSchedule({
      ...base,
      bakeMs: at('2026-11-17T10:00'),
      route: 'fridge',
    });
    const out = (s: typeof normal) =>
      s.phases.find((p) => p.id === 'outOfFridge')?.durationMin ?? 0;
    expect(long.fridgeMin / 60).toBeGreaterThan(48);
    expect(out(long)).toBeLessThan(out(normal));
  });

  it('skips the fridge phases without the fridge', () => {
    const s = buildSchedule({ ...base, route: 'no-fridge' });
    expect(s.phases.map((p) => p.id)).toEqual([
      'mix',
      'rest',
      'shape',
      'ambientRise',
      'topping',
      'bake',
    ]);
    expect(s.fridgeMin).toBe(0);
    expect(s.phases.find((p) => p.id === 'ambientRise')?.durationMin).toBe(27.5 * 60 - 73);
  });

  it('uses less yeast when the dough has more time', () => {
    const short = buildSchedule({ ...base, route: 'no-fridge', bakeMs: at('2026-11-14T23:00') });
    const long = buildSchedule({ ...base, route: 'no-fridge' });
    expect(long.yeastPct).toBeLessThan(short.yeastPct);
  });

  it('re-plans with the measured dough temperature and keeps the yeast', () => {
    const planned = buildSchedule({ ...base, route: 'fridge' });
    const warm = buildSchedule({
      ...base,
      route: 'fridge',
      doughTempC: 28,
      fixedYeastPct: planned.yeastPct,
    });
    const rise = (s: typeof planned) =>
      s.phases.find((p) => p.id === 'preFridgeRise')?.durationMin ?? 0;
    expect(warm.yeastPct).toBe(planned.yeastPct);
    expect(rise(warm)).toBeLessThan(rise(planned));
    expect(warm.fridgeMin).toBeGreaterThan(planned.fridgeMin);
  });
});

describe('validation', () => {
  const codes = (overrides: Parameters<typeof referenceInput>[0]) =>
    calculate(referenceInput(overrides)).issues.map((i) => i.code);

  it('rejects a bake before the start', () => {
    expect(codes({ bakeMs: at('2026-11-14T10:00') })).toEqual(['bake-before-start']);
  });

  it('requires 6 h plus mixing', () => {
    expect(codes({ bakeMs: at('2026-11-14T22:00'), route: 'no-fridge' })).toContain(
      'total-too-short',
    );
    expect(codes({ bakeMs: at('2026-11-14T22:13'), route: 'no-fridge' })).toEqual([]);
  });

  it('flags a fridge route that does not fit', () => {
    expect(codes({ bakeMs: at('2026-11-14T22:15') })).toContain('fridge-infeasible');
  });

  it('caps the fridge time at 72 h', () => {
    expect(codes({ bakeMs: at('2026-11-20T19:30') })).toContain('fridge-too-long');
  });

  it('validates W and quantities', () => {
    expect(codes({ wMin: 100 })).toContain('w-out-of-range');
    expect(codes({ wMin: 340, wMax: 300 })).toContain('w-min-above-max');
    expect(
      codes({ quantity: { mode: 'flour', flourKg: 11, ballWeightG: 280, split: 'equal' } }),
    ).toContain('flour-out-of-range');
    expect(codes({ quantity: { mode: 'balls', balls: 0, ballWeightG: 280 } })).toContain(
      'balls-out-of-range',
    );
    expect(codes({ quantity: { mode: 'balls', balls: 4, ballWeightG: 500 } })).toContain(
      'ball-weight-out-of-range',
    );
  });
});

describe('procedure', () => {
  it('has 8 phases with the fridge and 6 without', () => {
    expect(calculate(referenceInput()).procedure).toHaveLength(8);
    expect(calculate(referenceInput({ route: 'no-fridge' })).procedure).toHaveLength(6);
  });

  it('stages the water for wet doughs in a machine mixer', () => {
    const wet = calculate(
      referenceInput({ pizzaId: 'contemporanea', hydrationPct: 74, wMin: 400, wMax: 440 }),
    );
    expect(wet.procedure[0]?.steps.join(' ')).toContain('3 riprese');
  });
});
