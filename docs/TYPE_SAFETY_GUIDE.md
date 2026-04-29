# Type Safety Enhancement Guide

This guide explains how to use the enhanced type safety system in Scaling Eureka, including validation schemas, type guards, and input sanitization.

## Overview

The type safety enhancement system provides three main layers of protection:

1. **Zod Validation Schemas** - Runtime validation for API responses and database entities
2. **Type Guards** - Runtime type checking for common data structures
3. **Input Validation** - Sanitization and validation of user input

## Quick Start

### 1. Import Validation Utilities

```typescript
import {
  // Zod schemas
  validateWeatherAPI,
  validateTodoData,
  validateHabitData,

  // Type guards
  isString,
  isNumber,
  isDateString,
  isTodoData,
  isHabitData,

  // Input validation
  validateTodoText,
  validateHabitName,
  validatePriority,
  sanitizeHTML,
} from '@/lib/validation';
```

### 2. Validate API Responses

```typescript
import { validateWeatherAPI } from '@/lib/validation';

async function fetchWeatherData() {
  const response = await fetch('https://api.example.com/weather');
  const data = await response.json();

  // Validate the response structure
  const validatedData = validateWeatherAPI(data);

  // Now TypeScript knows the exact structure
  console.log(validatedData.current.temperature_2m);
}
```

### 3. Use Type Guards for Runtime Checks

```typescript
import { isTodoData, isHabitData } from '@/lib/validation';

function processItem(item: unknown) {
  if (isTodoData(item)) {
    // TypeScript knows this is a todo
    console.log(item.text, item.priority);
  } else if (isHabitData(item)) {
    // TypeScript knows this is a habit
    console.log(item.name, item.archived);
  } else {
    throw new Error('Unknown item type');
  }
}
```

### 4. Validate User Input

```typescript
import { validateTodoText, validatePriority } from '@/lib/validation';

function addTodo(text: unknown, priority: unknown) {
  // Validate and sanitize input
  const validatedText = validateTodoText(text);
  const validatedPriority = validatePriority(priority);

  // Safe to use with database
  await db.todos.insert({
    text: validatedText,
    priority: validatedPriority,
    done: false,
  });
}
```

## Validation Schemas

### API Response Schemas

Located in `lib/validation/api-schemas.ts`

#### Weather API

```typescript
import { WeatherExtendedSchema, validateWeatherAPI } from '@/lib/validation';

// Validate weather API response
const weatherData = validateWeatherAPI(apiResponse);

// Access with full type safety
const temperature = weatherData.current.temperature_2m;
const humidity = weatherData.current.relative_humidity_2m;
```

#### Stock API

```typescript
import { QuoteResultSchema, validateQuoteResult } from '@/lib/validation';

// Validate stock quote response
const quoteData = validateQuoteResult(apiResponse);

// Access with full type safety
const price = quoteData.price;
const change = quoteData.chg;
```

### Database Entity Schemas

Located in `lib/validation/database-schemas.ts`

#### Todo Entity

```typescript
import { TodoSchema, validateTodo } from '@/lib/validation';

// Validate todo from database
const todo = validateTodo(dbRecord);

// Access with full type safety
const text = todo.text;
const priority = todo.priority;
```

#### Habit Entity

```typescript
import { HabitSchema, validateHabit } from '@/lib/validation';

// Validate habit from database
const habit = validateHabit(dbRecord);

// Access with full type safety
const name = habit.name;
const archived = habit.archived;
```

## Type Guards

### Generic Type Guards

```typescript
import {
  isString,
  isNumber,
  isBoolean,
  isArray,
  isPlainObject,
  isDateString,
  isEmail,
  isURL,
} from '@/lib/validation';

// Check if value is a string
if (isString(value)) {
  // TypeScript knows value is string
  console.log(value.toUpperCase());
}

// Check if value is a number
if (isNumber(value)) {
  // TypeScript knows value is number
  console.log(value.toFixed(2));
}

// Check if value is a valid date
if (isDateString(value)) {
  // TypeScript knows value is a date string
  const date = new Date(value);
}
```

### Domain-Specific Type Guards

```typescript
import {
  isTodoData,
  isHabitData,
  isSleepEntryData,
  isCalendarEventData,
  isMoodEntryData,
  isTimerSessionData,
} from '@/lib/validation';

// Check if data is a todo
if (isTodoData(data)) {
  // TypeScript knows the structure
  console.log(data.text, data.priority);
}

// Check if data is a habit
if (isHabitData(data)) {
  // TypeScript knows the structure
  console.log(data.name, data.created_at);
}
```

## Input Validation

### Text Input Validation

```typescript
import {
  validateTodoText,
  validateHabitName,
  validateNoteContent,
  sanitizeHTML,
} from '@/lib/validation';

// Validate todo text (max 500 chars, trimmed)
const todoText = validateTodoText(userInput);

// Validate habit name (max 100 chars, trimmed)
const habitName = validateHabitName(userInput);

// Validate and sanitize note content (max 10000 chars, HTML sanitized)
const noteContent = validateNoteContent(userInput);

// Basic HTML sanitization
const safeHTML = sanitizeHTML(userInput);
```

### Numeric Input Validation

```typescript
import {
  validatePriority,
  isNumber,
} from '@/lib/validation';

// Validate priority (0-3)
const priority = validatePriority(userInput);

// Generic number validation
if (isNumber(value)) {
  // Safe to use as number
  console.log(value * 2);
}
```

### Date and Time Validation

```typescript
import {
  validateDateString,
  validateTimeString,
  isDateString,
  isISODateString,
} from '@/lib/validation';

// Validate date string
const date = validateDateString(userInput);

// Validate time string (HH:MM format)
const time = validateTimeString(userInput);

// Check if value is a valid date
if (isDateString(value)) {
  const date = new Date(value);
}

// Check if value is ISO date format
if (isISODateString(value)) {
  const date = new Date(value);
}
```

### Enum Validation

```typescript
import {
  validateSleepQuality,
  validateNootropicStatus,
} from '@/lib/validation';

// Validate sleep quality
const quality = validateSleepQuality(userInput); // 'bad' | 'med' | 'good'

// Validate nootropic status
const status = validateNootropicStatus(userInput); // 'pending' | 'taken' | 'skipped'
```

## Array Validation

### Validate Array Items

```typescript
import {
  validateArray,
  validateHabitEntries,
  validateFeelings,
} from '@/lib/validation';

// Validate array with custom type guard
const validItems = validateArray(items, isTodoData, 'todo');

// Validate habit entries
const habitEntries = validateHabitEntries(entries);

// Validate feelings array
const feelings = validateFeelings(feelingsArray);
```

## Object Validation

### Validate Required Properties

```typescript
import {
  validateRequiredProperties,
  validateWidgetLayoutItem,
  validateWidgetLayout,
} from '@/lib/validation';

// Validate object has required properties
const validObj = validateRequiredProperties(obj, ['id', 'name', 'created_at']);

// Validate widget layout item
const layoutItem = validateWidgetLayoutItem(item);

// Validate entire widget layout
const layout = validateWidgetLayout(layoutArray);
```

## Integration Examples

### React Query Integration

```typescript
import { useQuery } from '@tanstack/react-query';
import { validateTodoData, isTodoData } from '@/lib/validation';

function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await fetch('/api/todos');
      const data = await response.json();

      // Validate and filter invalid items
      return data.filter((item: unknown) => isTodoData(item));
    },
  });
}
```

### Form Validation

```typescript
import { validateTodoText, validatePriority } from '@/lib/validation';

function TodoForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const text = validateTodoText(formData.get('text'));
      const priority = validatePriority(formData.get('priority'));

      // Safe to submit
      onSubmit({ text, priority });
    } catch (error) {
      // Handle validation error
      setError(error.message);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### API Route Validation

```typescript
import { validateTodoText, validatePriority } from '@/lib/validation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const text = validateTodoText(body.text);
    const priority = validatePriority(body.priority);

    // Process validated data
    const todo = await createTodo({ text, priority });

    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

### Database Operations

```typescript
import { validateTodoData, isTodoData } from '@/lib/validation';

async function safeTodoInsert(todo: unknown) {
  // Validate before database operation
  const validated = validateTodoData(todo);

  // Safe database operation
  const result = await db.todos.insert(validated);

  // Validate response
  if (!isTodoData(result)) {
    throw new Error('Invalid data returned from database');
  }

  return result;
}
```

## Error Handling

### Validation Errors

```typescript
import { validateTodoText } from '@/lib/validation';

try {
  const text = validateTodoText(userInput);
  // Use validated text
} catch (error) {
  // Handle validation error
  console.error('Validation failed:', error.message);

  // Show user-friendly error
  showErrorMessage(error.message);
}
```

### Type Guard Fallbacks

```typescript
import { isTodoData, isHabitData } from '@/lib/validation';

function processItem(item: unknown) {
  if (isTodoData(item)) {
    // Process as todo
    return processTodo(item);
  }

  if (isHabitData(item)) {
    // Process as habit
    return processHabit(item);
  }

  // Fallback for unknown types
  throw new Error('Unknown item type');
}
```

## Best Practices

### 1. Always Validate External Data

```typescript
// ❌ Bad - no validation
async function fetchTodos() {
  const response = await fetch('/api/todos');
  return response.json(); // Could be anything
}

// ✅ Good - with validation
async function fetchTodos() {
  const response = await fetch('/api/todos');
  const data = await response.json();
  return data.filter(isTodoData); // Only valid todos
}
```

### 2. Validate User Input

```typescript
// ❌ Bad - no validation
function addTodo(text: string) {
  db.todos.insert({ text }); // Could be malicious
}

// ✅ Good - with validation
function addTodo(text: unknown) {
  const validated = validateTodoText(text);
  db.todos.insert({ text: validated }); // Safe
}
```

### 3. Use Type Guards for Runtime Checks

```typescript
// ❌ Bad - assumes structure
function processItem(item: any) {
  console.log(item.text); // Could crash
}

// ✅ Good - with type guard
function processItem(item: unknown) {
  if (isTodoData(item)) {
    console.log(item.text); // Safe
  }
}
```

### 4. Provide Clear Error Messages

```typescript
// ❌ Bad - generic error
if (!isString(value)) {
  throw new Error('Invalid input');
}

// ✅ Good - specific error
if (!isString(value)) {
  throw new Error('Todo text must be a string');
}
```

## TypeScript Configuration

The project now uses enhanced TypeScript strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Migration Guide

### Step 1: Add Validation to Existing Functions

```typescript
// Before
function addTodo(text: string, priority: number) {
  db.todos.insert({ text, priority });
}

// After
function addTodo(text: unknown, priority: unknown) {
  const validatedText = validateTodoText(text);
  const validatedPriority = validatePriority(priority);
  db.todos.insert({ text: validatedText, priority: validatedPriority });
}
```

### Step 2: Add Type Guards to Conditional Logic

```typescript
// Before
if (item.type === 'todo') {
  console.log(item.text);
}

// After
if (isTodoData(item)) {
  console.log(item.text);
}
```

### Step 3: Add Validation to API Calls

```typescript
// Before
const data = await response.json();
console.log.data.temperature;

// After
const data = await response.json();
const validated = validateWeatherAPI(data);
console.log(validated.current.temperature_2m);
```

## Testing

### Unit Tests for Validation

```typescript
import { describe, it, expect } from 'vitest';
import { validateTodoText, isTodoData } from '@/lib/validation';

describe('Todo Validation', () => {
  it('should validate valid todo text', () => {
    const result = validateTodoText('Buy groceries');
    expect(result).toBe('Buy groceries');
  });

  it('should reject empty todo text', () => {
    expect(() => validateTodoText('')).toThrow();
  });

  it('should identify todo data', () => {
    const todo = {
      id: '123',
      text: 'Test',
      done: false,
      priority: 1,
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(isTodoData(todo)).toBe(true);
  });
});
```

## Performance Considerations

### Validation Caching

```typescript
// Cache validation results for repeated use
const validationCache = new Map<unknown, boolean>();

function isCachedTodoData(data: unknown): data is Todo {
  if (validationCache.has(data)) {
    return validationCache.get(data) as boolean;
  }

  const result = isTodoData(data);
  validationCache.set(data, result);
  return result;
}
```

### Lazy Validation

```typescript
// Only validate when needed
function processLazyData(data: unknown) {
  // Quick check first
  if (!isPlainObject(data)) return null;

  // Full validation only when necessary
  if (isTodoData(data)) {
    return processTodo(data);
  }

  return null;
}
```

## Troubleshooting

### Common Issues

#### Issue: TypeScript errors after validation

```typescript
// Problem: TypeScript doesn't recognize validated type
const data = validateTodoAPI(response);
console.log(data.text); // TypeScript error

// Solution: Use the validated type directly
const data: Todo = validateTodoAPI(response);
console.log(data.text); // Works
```

#### Issue: Validation too strict

```typescript
// Problem: Validation rejects valid data
const text = validateTodoText('  '); // Throws error

// Solution: Handle edge cases appropriately
try {
  const text = validateTodoText(input);
} catch (error) {
  // Provide fallback or user feedback
  return 'Default todo text';
}
```

#### Issue: Performance impact

```typescript
// Problem: Validation slows down app

// Solution: Use selective validation
// Only validate external data, not internal data
function internalFunction(data: Todo) {
  // No validation needed for internal data
  console.log(data.text);
}

function externalHandler(data: unknown) {
  // Validate external data
  const todo = validateTodoData(data);
  internalFunction(todo);
}
```

## Additional Resources

- [Zod Documentation](https://zod.dev/)
- [TypeScript Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Input Validation Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## Support

For questions or issues with the validation system:

1. Check this guide for common patterns
2. Review the validation source code in `lib/validation/`
3. Consult the TypeScript documentation for type guards
4. Open an issue for bugs or feature requests