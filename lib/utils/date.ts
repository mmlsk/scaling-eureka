// Date utilities with Polish day/month names
// Ported from vanilla app.js

/** Full Polish day names (Sunday-first index, matching Date.getDay()). */
const DAYS_PL: readonly string[] = [
  'Niedziela',
  'Poniedzia\u0142ek',
  'Wtorek',
  '\u015Aroda',
  'Czwartek',
  'Pi\u0105tek',
  'Sobota',
] as const;

/** Abbreviated Polish month names (0-indexed, matching Date.getMonth()). */
const MONTHS_SHORT_PL: readonly string[] = [
  'Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze',
  'Lip', 'Sie', 'Wrz', 'Pa\u017A', 'Lis', 'Gru',
] as const;

/** Full Polish month names (0-indexed). */
const MONTHS_PL: readonly string[] = [
  'Stycze\u0144',
  'Luty',
  'Marzec',
  'Kwiecie\u0144',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpie\u0144',
  'Wrzesie\u0144',
  'Pa\u017Adziernik',
  'Listopad',
  'Grudzie\u0144',
] as const;

/**
 * Format a Date as "HH:MM:SS".
 *
 * Mirrors the vanilla `tick()` clock rendering.
 */
export function formatTime(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Format a Date as "Dzie\u0144 tygodnia, DD Mies RRRR".
 *
 * Example: "Poniedzia\u0142ek, 15 Kwi 2025"
 */
export function formatDate(date: Date): string {
  const day = DAYS_PL[date.getDay()];
  const month = MONTHS_SHORT_PL[date.getMonth()];
  return `${day}, ${date.getDate()} ${month} ${date.getFullYear()}`;
}

/**
 * Calculate total sleep duration from "HH:MM" start/stop strings.
 *
 * Handles overnight sleep (stop < start wraps past midnight).
 * Returns a formatted string like "7h 30m", or `null` if inputs are invalid.
 */
export function calcSleepTotal(start: string, stop: string): string | null {
  if (!start || !stop) return null;

  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = stop.split(':').map(Number);

  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null;

  let mins = (eh! * 60 + em!) - (sh! * 60 + sm!);
  if (mins < 0) mins += 24 * 60;

  const h = Math.floor(mins / 60);
  const m = mins % 60;

  return `${h}h ${String(m).padStart(2, '0')}m`;
}

/**
 * Get the full Polish weekday name for a Date.
 */
export function getWeekDay(date: Date): string {
  return DAYS_PL[date.getDay()]!;
}

/**
 * Get the full Polish month name for a 0-indexed month number (0 = January).
 */
export function getMonthName(month: number): string {
  return MONTHS_PL[month] ?? '';
}

/**
 * Get the abbreviated Polish month name for a 0-indexed month number.
 */
export function getMonthShortName(month: number): string {
  return MONTHS_SHORT_PL[month] ?? '';
}
