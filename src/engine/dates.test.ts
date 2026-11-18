import { describe, expect, it } from 'vitest';
import {
  addMinutes,
  formatClock,
  formatDuration,
  formatLocalDateTime,
  minutesBetween,
  parseLocalDateTime,
} from './dates';
import { calculate } from './calculate';
import { referenceInput } from './fixtures';

const at = (s: string): number => parseLocalDateTime(s) ?? NaN;

describe('local date handling', () => {
  it('runs in Europe/Rome', () => {
    expect(new Date(2026, 9, 25, 12).getTimezoneOffset()).toBe(-60); // CET
    expect(new Date(2026, 6, 1, 12).getTimezoneOffset()).toBe(-120); // CEST
  });

  it('round-trips datetime-local values', () => {
    expect(formatLocalDateTime(at('2026-11-14T16:00'))).toBe('2026-11-14T16:00');
    expect(parseLocalDateTime('2026-02-30T10:00')).toBeNull();
    expect(parseLocalDateTime('not a date')).toBeNull();
    expect(parseLocalDateTime('')).toBeNull();
  });

  it('formats durations', () => {
    expect(formatDuration(158)).toBe('2 h 38 min');
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(180)).toBe('3 h');
  });

  it('counts the extra hour when clocks go back (last Sunday of October)', () => {
    expect(minutesBetween(at('2026-10-24T16:00'), at('2026-10-25T19:30'))).toBe(28.5 * 60);
  });

  it('loses an hour when clocks go forward (last Sunday of March)', () => {
    expect(minutesBetween(at('2026-03-28T16:00'), at('2026-03-29T19:30'))).toBe(26.5 * 60);
  });

  it('adds real elapsed minutes across the change', () => {
    const midnight = at('2026-10-25T00:00');
    expect(formatClock(addMinutes(midnight, 240))).toBe('03:00');
    const marchMidnight = at('2026-03-29T00:00');
    expect(formatClock(addMinutes(marchMidnight, 240))).toBe('05:00');
  });

  it('plans a schedule across the autumn change with the bake at the chosen time', () => {
    const r = calculate(
      referenceInput({
        startMs: at('2026-10-24T16:00'),
        bakeMs: at('2026-10-25T19:30'),
      }),
    );
    expect(r.valid).toBe(true);
    expect(r.schedule.totalMin).toBe(28.5 * 60);
    const spans = r.schedule.phases.filter((p) => p.kind === 'span');
    expect(spans.reduce((sum, p) => sum + p.durationMin, 0)).toBe(28.5 * 60);
    const bake = r.schedule.phases.at(-1);
    expect(bake && formatClock(bake.startMs)).toBe('19:30');
  });
});
