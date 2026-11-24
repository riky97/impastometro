/**
 * The only date utility module. Instants are epoch milliseconds; datetime-local strings
 * ("YYYY-MM-DDTHH:mm") are interpreted and produced in the machine's LOCAL time.
 * Durations are minutes of real elapsed time, so a DST change moves wall-clock times, not durations.
 */
export const MS_PER_MIN = 60_000;

export function addMinutes(ms: number, minutes: number): number {
  return ms + minutes * MS_PER_MIN;
}

export function minutesBetween(fromMs: number, toMs: number): number {
  return (toMs - fromMs) / MS_PER_MIN;
}

const LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** Parses a datetime-local value as local time. Returns null for malformed or impossible dates. */
export function parseLocalDateTime(value: string): number | null {
  const m = LOCAL_RE.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number) as [number, number, number, number, number];
  const date = new Date(y, mo - 1, d, h, mi);
  const roundTrips =
    date.getFullYear() === y &&
    date.getMonth() === mo - 1 &&
    date.getDate() === d &&
    date.getHours() === h &&
    date.getMinutes() === mi;
  return roundTrips ? date.getTime() : null;
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** Formats an instant as a datetime-local value (local time). */
export function formatLocalDateTime(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "HH:mm" in local time. */
export function formatClock(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Italian short day label, e.g. "sab 14 nov". */
export function formatDay(ms: number): string {
  return new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
    .format(new Date(ms))
    .replace(/\./g, '');
}

/** Italian long day label, e.g. "martedì 24 novembre". */
export function formatDayLong(ms: number): string {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(ms));
}

/** "2 h 38 min", "45 min", "3 h". */
export function formatDuration(totalMinutes: number): string {
  const total = Math.round(totalMinutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
