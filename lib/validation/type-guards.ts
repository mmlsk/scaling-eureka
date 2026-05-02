// Type guards and validation utilities for common data structures

// ── Generic Type Guards ──

/**
 * Type guard to check if a value is a plain object (not null, not array, not function)
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Function);
}

/**
 * Type guard to check if a value is a non-null string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard to check if a value is a number (not NaN)
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is a valid date string
 */
export function isDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Type guard to check if a value is a valid ISO date string
 */
export function isISODateString(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value);
}

/**
 * Type guard to check if a value is a valid email address
 */
export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Type guard to check if a value is a valid URL
 */
export function isURL(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// ── Domain-Specific Type Guards ──

/**
 * Type guard for habit data structure
 */
export function isHabitData(value: unknown): value is {
  id: string;
  name: string;
  created_at: string;
  archived: boolean;
} {
  if (!isPlainObject(value)) return false;
  return (
    isString(value.id) &&
    isString(value.name) &&
    isDateString(value.created_at) &&
    isBoolean(value.archived)
  );
}

/**
 * Type guard for todo data structure
 */
export function isTodoData(value: unknown): value is {
  id: string;
  text: string;
  done: boolean;
  priority: number;
  created_at: string;
} {
  if (!isPlainObject(value)) return false;
  return (
    isString(value.id) &&
    isString(value.text) &&
    isBoolean(value.done) &&
    isNumber(value.priority) &&
    isDateString(value.created_at)
  );
}

/**
 * Type guard for sleep entry data structure
 */
export function isSleepEntryData(value: unknown): value is {
  id: string;
  date: string;
  sleep_start: string | null;
  sleep_stop: string | null;
  total_minutes: number | null;
  quality: 'bad' | 'med' | 'good' | null;
} {
  if (!isPlainObject(value)) return false;
  return (
    isString(value.id) &&
    isDateString(value.date) &&
    (value.sleep_start === null || isString(value.sleep_start)) &&
    (value.sleep_stop === null || isString(value.sleep_stop)) &&
    (value.total_minutes === null || isNumber(value.total_minutes)) &&
    (value.quality === null || (typeof value.quality === 'string' && ['bad', 'med', 'good'].includes(value.quality)))
  );
}

/**
 * Type guard for calendar event data structure
 */
export function isCalendarEventData(value: unknown): value is {
  id: string;
  title: string;
  date: string;
  time: string | null;
  description: string | null;
  source: string;
} {
  if (!isPlainObject(value)) return false;
  return (
    isString(value.id) &&
    isString(value.title) &&
    isDateString(value.date) &&
    (value.time === null || isString(value.time)) &&
    (value.description === null || isString(value.description)) &&
    isString(value.source)
  );
}

/**
 * Type guard for mood entry data structure
 */
export function isMoodEntryData(value: unknown): value is {
  id: string;
  date: string;
  feelings: string[];
} {
  if (!isPlainObject(value)) return false;
  return (
    isString(value.id) &&
    isDateString(value.date) &&
    isArray(value.feelings) &&
    value.feelings.every(isString)
  );
}

/**
 * Type guard for timer session data structure
 */
export function isTimerSessionData(value: unknown): value is {
  id: string;
  date: string;
  work_minutes: number;
  break_minutes: number;
  linked_todo_id: string | null;
  started_at: string;
} {
  if (!isPlainObject(value)) return false;
  return (
    isString(value.id) &&
    isDateString(value.date) &&
    isNumber(value.work_minutes) &&
    isNumber(value.break_minutes) &&
    (value.linked_todo_id === null || isString(value.linked_todo_id)) &&
    isDateString(value.started_at)
  );
}

// ── Input Validation Utilities ──

/**
 * Sanitize and validate user input for habit names
 */
export function validateHabitName(input: unknown): string {
  if (!isString(input)) {
    throw new Error('Habit name must be a string');
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error('Habit name cannot be empty');
  }
  if (trimmed.length > 100) {
    throw new Error('Habit name cannot exceed 100 characters');
  }
  return trimmed;
}

/**
 * Sanitize and validate user input for todo text
 */
export function validateTodoText(input: unknown): string {
  if (!isString(input)) {
    throw new Error('Todo text must be a string');
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error('Todo text cannot be empty');
  }
  if (trimmed.length > 500) {
    throw new Error('Todo text cannot exceed 500 characters');
  }
  return trimmed;
}

/**
 * Validate priority level
 */
export function validatePriority(input: unknown): number {
  if (!isNumber(input)) {
    throw new Error('Priority must be a number');
  }
  if (input < 0 || input > 3) {
    throw new Error('Priority must be between 0 and 3');
  }
  return input;
}

/**
 * Validate time string (HH:MM format)
 */
export function validateTimeString(input: unknown): string {
  if (!isString(input)) {
    throw new Error('Time must be a string');
  }
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(input)) {
    throw new Error('Time must be in HH:MM format');
  }
  return input;
}

/**
 * Validate date string
 */
export function validateDateString(input: unknown): string {
  if (!isDateString(input)) {
    throw new Error('Invalid date string');
  }
  return input as string;
}

/**
 * Validate sleep quality
 */
export function validateSleepQuality(input: unknown): 'bad' | 'med' | 'good' {
  if (!isString(input) || !['bad', 'med', 'good'].includes(input)) {
    throw new Error('Sleep quality must be one of: bad, med, good');
  }
  return input as 'bad' | 'med' | 'good';
}

/**
 * Validate nootropic status
 */
export function validateNootropicStatus(input: unknown): 'pending' | 'taken' | 'skipped' {
  if (!isString(input) || !['pending', 'taken', 'skipped'].includes(input)) {
    throw new Error('Nootropic status must be one of: pending, taken, skipped');
  }
  return input as 'pending' | 'taken' | 'skipped';
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(input: unknown): string {
  if (!isString(input)) {
    return '';
  }
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .trim();
}

/**
 * Validate and sanitize note content
 */
export function validateNoteContent(input: unknown): string {
  if (!isString(input)) {
    throw new Error('Note content must be a string');
  }
  const sanitized = sanitizeHTML(input);
  if (sanitized.length > 10000) {
    throw new Error('Note content cannot exceed 10000 characters');
  }
  return sanitized;
}

// ── Array Validation Utilities ──

/**
 * Validate that all items in an array match a type guard
 */
export function validateArray<T>(
  items: unknown,
  itemGuard: (item: unknown) => item is T,
  itemName = 'item'
): T[] {
  if (!isArray(items)) {
    throw new Error(`Expected an array of ${itemName}s`);
  }
  const validatedItems: T[] = [];
  for (const item of items) {
    if (!itemGuard(item)) {
      throw new Error(`Invalid ${itemName} in array`);
    }
    validatedItems.push(item);
  }
  return validatedItems;
}

/**
 * Validate habit entries array
 */
export function validateHabitEntries(items: unknown): Array<{
  date: string;
  completed: boolean;
}> {
  return validateArray(items, (item): item is { date: string; completed: boolean } => {
    if (!isPlainObject(item)) return false;
    return isDateString(item.date) && isBoolean(item.completed);
  }, 'habit entry');
}

/**
 * Validate feelings array
 */
export function validateFeelings(items: unknown): string[] {
  if (!isArray(items)) {
    throw new Error('Feelings must be an array');
  }
  return items.map((feeling, index) => {
    if (!isString(feeling)) {
      throw new Error(`Feeling at index ${index} must be a string`);
    }
    if (feeling.length > 50) {
      throw new Error(`Feeling at index ${index} cannot exceed 50 characters`);
    }
    return feeling;
  });
}

// ── Object Validation Utilities ──

/**
 * Validate that an object has required properties
 */
export function validateRequiredProperties<T extends Record<string, unknown>>(
  obj: unknown,
  requiredProperties: (keyof T)[]
): T {
  if (!isPlainObject(obj)) {
    throw new Error('Expected a plain object');
  }
  for (const prop of requiredProperties) {
    const key = prop as string;
    if (!(key in obj) || obj[key] === undefined) {
      throw new Error(`Missing required property: ${String(prop)}`);
    }
  }
  return obj as T;
}

/**
 * Validate widget layout item
 */
export function validateWidgetLayoutItem(item: unknown): {
  id: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
} {
  if (!isPlainObject(item)) {
    throw new Error('Widget layout item must be an object');
  }
  if (!isString(item.id)) {
    throw new Error('Widget layout item must have an id');
  }
  if (!isNumber(item.w) || item.w <= 0) {
    throw new Error('Widget layout item must have a positive width');
  }
  if (!isNumber(item.h) || item.h <= 0) {
    throw new Error('Widget layout item must have a positive height');
  }
  if (item.x !== undefined && (!isNumber(item.x) || item.x < 0)) {
    throw new Error('Widget layout item x position must be a non-negative number');
  }
  if (item.y !== undefined && (!isNumber(item.y) || item.y < 0)) {
    throw new Error('Widget layout item y position must be a non-negative number');
  }
  const result: { id: string; w: number; h: number; x?: number; y?: number } = {
    id: item.id,
    w: item.w,
    h: item.h,
  };
  if (item.x !== undefined) result.x = item.x;
  if (item.y !== undefined) result.y = item.y;
  return result;
}

/**
 * Validate widget layout array
 */
export function validateWidgetLayout(items: unknown): Array<{
  id: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
}> {
  if (!isArray(items)) {
    throw new Error('Widget layout must be an array');
  }
  return items.map(validateWidgetLayoutItem);
}