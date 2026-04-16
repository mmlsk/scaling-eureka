// Formatting utilities
// Ported from vanilla app.js fmtP, fmtPct, fmtVol, fmtTime

/**
 * Format a price value for display.
 *
 * - Returns '--' for null/undefined/NaN.
 * - If `sym` contains '=X' (forex pair), shows 4 decimal places.
 * - Otherwise, shows 2 decimal places with locale thousands separators.
 *
 * Mirrors the vanilla `fmtP(p, sym)`.
 */
export function formatPrice(p: number | null | undefined, sym?: string): string {
  if (p == null || Number.isNaN(p)) return '--';

  if (sym && sym.includes('=X')) {
    return p.toFixed(4);
  }

  return p.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a percentage change for display.
 *
 * - Returns '--' for null/undefined/NaN.
 * - Prefixes positive values with '+'.
 * - Always shows 2 decimal places followed by '%'.
 *
 * Mirrors the vanilla `fmtPct(c)`.
 */
export function formatPercent(c: number | null | undefined): string {
  if (c == null || Number.isNaN(c)) return '--';
  return (c >= 0 ? '+' : '') + c.toFixed(2) + '%';
}

/**
 * Format a volume number for display using K/M/B suffixes.
 *
 * - Returns '--' for falsy or NaN values.
 * - >= 1 billion: "1.2B"
 * - >= 1 million: "1.2M"
 * - otherwise: "123K"
 *
 * Mirrors the vanilla `fmtVol(v)`.
 */
export function formatVolume(v: number | null | undefined): string {
  if (!v || Number.isNaN(v)) return '--';

  if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  return (v / 1e3).toFixed(0) + 'K';
}

/**
 * Format a duration in seconds as "MM:SS".
 *
 * Mirrors the vanilla `fmtTime(sec)`.
 */
export function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}
