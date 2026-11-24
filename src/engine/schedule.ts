import { BENCH_RISE, OUT_OF_FRIDGE_REDUCTION, OUT_OF_FRIDGE_TABLE } from '../data/fermentation';
import { PROFILES, type Timing } from '../data/profiles';
import { MS_PER_MIN, addMinutes } from './dates';
import type { Phase, Route, Schedule } from './types';
import { effectiveHours, yeastPct } from './yeast';

export interface ScheduleInput {
  startMs: number;
  bakeMs: number;
  route: Route;
  ambientTempC: number;
  mixingMin: number;
  /** Target dough temperature (profile midpoint), for the measured-dough-temperature correction. */
  targetDoughTempC: number;
  /** Measured dough temperature after mixing. Speeds up or slows down the bench rise. */
  doughTempC?: number | null;
  /** Yeast already weighed: keep it fixed instead of recomputing it from the schedule. */
  fixedYeastPct?: number;
  /** The product's timing; defaults to the pizza one. */
  timing?: Timing;
  /** Multiplier on the yeast model (1 for pizza). */
  yeastFactor?: number;
  /** False for Recco: no yeast, no fermentation, just mix, rest, roll and bake. */
  leavened?: boolean;
}

const PIZZA_TIMING = PROFILES.classica.timing;

const MAX_ITERATIONS = 100;
const EPSILON = 1e-9;

/** Bench rise (minutes) until the balls grow ~30%. Faster with more yeast and warmer rooms. */
export function benchRiseMin(yeast: number, ambientTempC: number): number {
  const yeastFactor = Math.pow(BENCH_RISE.refYeastPct / yeast, BENCH_RISE.yeastExponent);
  const tempFactor = Math.pow(BENCH_RISE.q10, (BENCH_RISE.refTempC - ambientTempC) / 10);
  return BENCH_RISE.refMin * yeastFactor * tempFactor;
}

/** Minutes out of the fridge before baking, linearly interpolated by ambient °C. */
export function outOfFridgeBaseMin(
  ambientTempC: number,
  table: Timing['outOfFridge'] = OUT_OF_FRIDGE_TABLE,
): number {
  const first = table[0];
  const last = table[table.length - 1];
  if (!first || !last) throw new Error('OUT_OF_FRIDGE_TABLE is empty');
  if (ambientTempC <= first.tempC) return first.minutes;
  if (ambientTempC >= last.tempC) return last.minutes;
  for (let i = 1; i < table.length; i++) {
    const hi = table[i];
    const lo = table[i - 1];
    if (hi && lo && ambientTempC <= hi.tempC) {
      const t = (ambientTempC - lo.tempC) / (hi.tempC - lo.tempC);
      return lo.minutes + t * (hi.minutes - lo.minutes);
    }
  }
  return last.minutes;
}

export function outOfFridgeMin(
  ambientTempC: number,
  fridgeHours: number,
  table: Timing['outOfFridge'] = OUT_OF_FRIDGE_TABLE,
): number {
  const reduction = OUT_OF_FRIDGE_REDUCTION.find((r) => fridgeHours > r.afterHours);
  return outOfFridgeBaseMin(ambientTempC, table) * (reduction?.factor ?? 1);
}

const span = (id: Phase['id'], startMs: number, durationMin: number): Phase => ({
  id,
  startMs,
  durationMin,
  kind: 'span',
});
const milestone = (id: Phase['id'], startMs: number): Phase => ({
  id,
  startMs,
  durationMin: 0,
  kind: 'milestone',
});

/**
 * Plans every phase between start and bake. With the fridge, the yeast depends on the schedule and the
 * schedule depends on the yeast (through the bench rise), so we iterate to a fixed point.
 */
export function buildSchedule(input: ScheduleInput): Schedule {
  const totalMin = (input.bakeMs - input.startMs) / MS_PER_MIN;
  const { mixingMin } = input;
  const timing = input.timing ?? PIZZA_TIMING;
  const factor = input.yeastFactor ?? 1;
  const unleavened = input.leavened === false;
  const direct = unleavened || input.route === 'no-fridge';
  // A fixed final proof (bread) pushes the slack into the bulk rest; Recco rests for all the time left
  // except the hands-on time of rolling and filling (`toppingLeadMin`).
  const restMin = unleavened
    ? Math.max(0, totalMin - mixingMin - timing.toppingLeadMin)
    : direct && timing.proofMin !== undefined
      ? Math.max(0, totalMin - mixingMin - timing.proofMin)
      : timing.restMin;
  const afterRestMs = addMinutes(input.startMs, mixingMin + restMin);
  const head = (): Phase[] => [
    span('mix', input.startMs, mixingMin),
    span('rest', addMinutes(input.startMs, mixingMin), restMin),
    milestone('shape', afterRestMs),
  ];
  const tail = (): Phase[] => [
    milestone('topping', addMinutes(input.bakeMs, -timing.toppingLeadMin)),
    milestone('bake', input.bakeMs),
  ];

  if (unleavened) {
    return {
      phases: [
        span('mix', input.startMs, mixingMin),
        span('rest', addMinutes(input.startMs, mixingMin), restMin),
        span('topping', afterRestMs, timing.toppingLeadMin),
        milestone('bake', input.bakeMs),
      ],
      yeastPct: 0,
      effectiveHours: 0,
      totalMin,
      fridgeMin: 0,
      feasible: restMin > 0,
    };
  }

  if (direct) {
    const pct = input.fixedYeastPct ?? yeastPct(totalMin / 60, factor);
    const riseMin = timing.proofMin ?? Math.max(0, totalMin - mixingMin - restMin);
    return {
      phases: [...head(), span('ambientRise', afterRestMs, riseMin), ...tail()],
      yeastPct: pct,
      effectiveHours: totalMin / 60,
      totalMin,
      fridgeMin: 0,
      feasible: timing.proofMin === undefined ? riseMin > 0 : restMin > 0,
    };
  }

  const doughFactor =
    input.doughTempC == null
      ? 1
      : Math.pow(BENCH_RISE.q10, (input.targetDoughTempC - input.doughTempC) / 10);

  let pct = input.fixedYeastPct ?? BENCH_RISE.refYeastPct;
  let fridgeH = 0;
  let eff = 0.5;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const rise = benchRiseMin(pct, input.ambientTempC) * doughFactor;
    const out = outOfFridgeMin(input.ambientTempC, fridgeH, timing.outOfFridge);
    const fridgeMin = Math.max(0, totalMin - mixingMin - restMin - rise - out);
    const nextFridgeH = fridgeMin / 60;
    eff = effectiveHours((totalMin - fridgeMin) / 60, nextFridgeH);
    const nextPct = input.fixedYeastPct ?? yeastPct(eff, factor);
    const done = Math.abs(nextPct - pct) < EPSILON && Math.abs(nextFridgeH - fridgeH) < EPSILON;
    pct = nextPct;
    fridgeH = nextFridgeH;
    if (done) break;
  }

  // Whole-minute phases; the fridge absorbs the rounding so the phases always sum to the total.
  const riseMin = Math.round(benchRiseMin(pct, input.ambientTempC) * doughFactor);
  const outMin = Math.round(outOfFridgeMin(input.ambientTempC, fridgeH, timing.outOfFridge));
  const rawFridge = totalMin - mixingMin - restMin - riseMin - outMin;
  const fridgeMin = Math.max(0, rawFridge);
  const riseStart = afterRestMs;
  const fridgeStart = addMinutes(riseStart, riseMin);
  const outStart = addMinutes(fridgeStart, fridgeMin);

  return {
    phases: [
      ...head(),
      span('preFridgeRise', riseStart, riseMin),
      span('fridge', fridgeStart, fridgeMin),
      span('outOfFridge', outStart, outMin),
      ...tail(),
    ],
    yeastPct: pct,
    effectiveHours: eff,
    totalMin,
    fridgeMin,
    feasible: rawFridge >= 0,
  };
}
