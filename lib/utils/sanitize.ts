// Input sanitization & validation module
// Ported from vanilla app.js — no DOM dependencies (server-safe)

/** Default maximum lengths matching the vanilla app CONFIG */
const DEFAULT_MAX_TODO_LENGTH = 500;
const DEFAULT_MAX_NOTE_LENGTH = 5000;
const DEFAULT_MAX_TEXT_LENGTH = 500;
const DEFAULT_MAX_ATTR_LENGTH = 100;
const DEFAULT_MAX_ALPHANUM_LENGTH = 100;

/**
 * Map of HTML special characters to their entity equivalents.
 * Used instead of DOM-based escaping so this module works in Node / Edge runtime.
 */
const HTML_ESCAPE_MAP: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

const HTML_ESCAPE_RE = /[&<>"'/`]/g;

/**
 * Escape HTML special characters in a string.
 * Replaces the vanilla `sanitize.html` which used `document.createElement('div')`.
 */
export function sanitizeHtml(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str.replace(HTML_ESCAPE_RE, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

/**
 * Trim a string and enforce a maximum length.
 * Replaces the vanilla `sanitize.text`.
 */
export function sanitizeText(str: unknown, maxLen: number = DEFAULT_MAX_TEXT_LENGTH): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

/**
 * Strip characters that are unsafe in HTML attribute values.
 * Only allows alphanumeric, dashes, underscores, colons, and spaces.
 */
export function sanitizeAttribute(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[^a-zA-Z0-9\-_:\s]/g, '').slice(0, DEFAULT_MAX_ATTR_LENGTH);
}

/**
 * Trim a string and limit to `maxLen` characters.
 * Replaces the vanilla `sanitize.trim`.
 */
export function sanitizeTrim(str: unknown, maxLen: number = DEFAULT_MAX_TODO_LENGTH): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

/**
 * Keep only alphanumeric characters, spaces, dashes, and underscores.
 * Replaces the vanilla `sanitize.alphanumeric`.
 */
export function sanitizeAlphanumeric(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[^a-zA-Z0-9\s\-_]/g, '').slice(0, DEFAULT_MAX_ALPHANUM_LENGTH);
}

/**
 * Sanitize a freeform note — trim and enforce max length.
 * Replaces the vanilla `sanitize.note`.
 */
export function sanitizeNote(str: unknown, maxLen: number = DEFAULT_MAX_NOTE_LENGTH): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

/**
 * Validate and parse a medical/clinical numeric input.
 *
 * Throws a descriptive error (in Polish) if the value is not a number or
 * falls outside the clinical range `[min, max]`.
 *
 * Replaces the vanilla `sanitize.medicalInput`.
 */
export function validateMedicalInput(
  val: unknown,
  min: number,
  max: number,
  fieldName: string,
): number {
  const raw = typeof val === 'number' ? val : parseFloat(String(val));

  if (Number.isNaN(raw)) {
    throw new Error(`${fieldName} musi by\u0107 liczb\u0105`);
  }

  if (raw < min || raw > max) {
    throw new Error(
      `${fieldName} poza zakresem klinicznym (${min}\u2013${max})`,
    );
  }

  return raw;
}
