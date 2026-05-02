# Codebase Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the scaling-eureka codebase by debugging errors, cleaning up code, upgrading interfaces, enhancing functionality, and deploying successfully.

**Architecture:** Next.js 16 App Router + React 19 + TypeScript; Zustand v5 (client state) + TanStack Query v5 (server state) + Dexie (IndexedDB) + Supabase; shadcn/ui + Tailwind CSS 4; Vitest + Playwright testing.

**Tech Stack:** Next.js 16.2.4, React 19.2.4, TypeScript 5.x, Zustand 5.0.12, TanStack Query 5.99.0, Dexie 4.4.2, Supabase 2.103.2, Tailwind 4, Vitest 4.1.4, Playwright 1.59.1

---

## File Structure

### Files to Modify (Phase 1: Debug & Fix)

| File | Responsibility | Action |
|------|------------------|--------|
| `lib/ai/embeddings.ts:163` | OpenAI embedding serialization | Fix `as unknown as string` → proper type |
| `lib/db/sync.ts:182` | Realtime payload type | Fix `Row = { [key: string]: string }` → proper type |
| `store/useLifeOsStore.ts:116` | parseHHMM hoisting | Move function declaration before usage |
| `lib/calculators/formulas.ts` | 22 calculator formulas | Fix bugs found by tests |
| `lib/calculators/references.ts` | Clinical references | Verify against formulas |
| `lib/calculators/versions.ts` | Version metadata | Update if formulas change |
| `tests/calculators.test.ts` | Calculator tests | Add missing test cases |
| `lib/db/sync.ts:72-131` | flushSyncQueue error handling | Add logging via lib/logger.ts |
| `lib/db/sync.ts:136-165` | onRealtimeChange | Add null check for payload.new |
| `lib/supabase/middleware.ts:63-66` | Middleware comments | Fix misleading comment about getSession() |

### Files to Modify (Phase 2: Code Cleanup)

| File | Responsibility | Action |
|------|------------------|--------|
| `store/slices/*.ts` (6 files) | Zustand slices (factory pattern) | Migrate into useLifeOsStore.ts OR remove if duplicated |
| `store/useLifeOsStore.ts` | Consolidated Zustand store | Add migrated slices, remove duplicates |
| `app/dashboard/_components/todo-widget.tsx` | Todo widget | Update import from slices/ → useLifeOsStore |
| `app/dashboard/_components/habits-widget.tsx` | Habits widget | Update import from slices/ → useLifeOsStore |
| `app/dashboard/_components/nootropics-widget.tsx` | Nootropics widget | Update import from slices/ → useLifeOsStore |
| `app/dashboard/_components/analytics-widget.tsx` | Analytics widget | Update imports |
| `lib/errors/error-hooks.ts` | Error hooks | Replace console.log/warn/error with logger.ts |
| `lib/errors/error-boundary.tsx:99-100` | Error boundary | Keep (already uses console.error for logging) |
| `app/**/*.tsx`, `lib/**/*.ts` | Various | Standardize type imports to `import type { Foo }` |
| `tsconfig.json` | TypeScript config | Ensure `strict: true`, `noUnusedLocals: true` |

### Files to Create/Modify (Phase 3: Interface Upgrades)

| File | Responsibility | Action |
|------|------------------|--------|
| `app/dashboard/_components/dashboard-grid.tsx` | Dashboard grid | Upgrade WidgetSkeleton → Skeleton component, add responsive breakpoints |
| `components/ui/skeleton.tsx` | Skeleton UI | Already exists, use it |
| `app/dashboard/_components/*-widget.tsx` (13 files) | Widgets | Add error boundaries, loading states |
| `lib/hooks/use-media-query.ts` | Media query hook | Already exists, use for responsive |
| `app/layout.tsx` | Root layout | Add global error boundary |
| `lib/errors/error-boundary.tsx` | Error boundary | Ensure proper usage, wrap widgets |
| `app/calculators/_components/calc-card.tsx` | Calculator card | Add "Copy Result" and "Share" buttons |
| `app/calculators/_components/*.tsx` | Calculator components | Improve mobile layout |

### Files to Create/Modify (Phase 4: Functionality Improvements)

| File | Responsibility | Action |
|------|------------------|--------|
| `tests/queries/` | Query hook tests | Create test files for each hook in lib/queries/ |
| `tests/db/sync.test.ts` | Sync engine tests | Add tests for flushSyncQueue, onRealtimeChange |
| `tests/errors/*.test.ts` | Error handling tests | Add tests for error-boundary, error-hooks |
| `app/dashboard/_components/*-widget.tsx` | Widgets | Add offline indicator, pending sync count |
| `components/layout/header.tsx` | Header | Add "Sync Now" button, offline indicator |
| `tests/e2e/*.spec.ts` | E2E tests | Add critical path tests (todo, habit, calculator, offline) |
| `tests/e2e/a11y.spec.ts` | Accessibility | Already exists, enhance coverage |

### Files to Use (Phase 5: Deployment)

| File | Responsibility | Action |
|------|------------------|--------|
| `RUNBOOK.md` | Troubleshooting | Follow for deployment debugging |
| `.github/SECURITY.md` | Security | Reference for incident response |
| `package.json` | Scripts | Use `npm run build`, `npm test`, `npm run test:e2e` |
| Vercel dashboard | Deployment | Monitor at vercel.com/dashboard |

---

## Phase 1: Debug & Fix Errors

### Task 1: Fix TypeScript Errors in store/useLifeOsStore.ts

**Files:**
- Modify: `store/useLifeOsStore.ts:116`

**Context:** The `parseHHMM` function is defined at line 255 but called inside a callback at line 116. In strict mode, this could be a hoisting issue (though arrow functions and function expressions have different hoisting rules). The real issue is that `parseHHMM` is defined after its usage in the source — while JavaScript hoists `function` declarations, putting helper functions at the bottom of a large store file reduces readability.

- [ ] **Step 1: Move parseHHMM before first usage**

Move the `parseHHMM` function to just after the imports (around line 4):

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SleepState, TimerPreset, Palette } from '@/types/state';

function parseHHMM(time: string): number | null {
  const parts = time.split(':');
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}
```

Remove the duplicate `parseHHMM` function at the bottom of the file (lines 255-262).

- [ ] **Step 2: Run TypeScript check**

Run: `cd /Users/m4t30/scaling-eureka && npx tsc --noEmit`

Expected: No errors related to parseHHMM or store/useLifeOsStore.ts.

- [ ] **Step 3: Commit**

```bash
git add store/useLifeOsStore.ts
git commit -m "fix: move parseHHMM before usage in useLifeOsStore.ts"
```

### Task 2: Fix Type Assertion in lib/ai/embeddings.ts

**Files:**
- Modify: `lib/ai/embeddings.ts:163, 176, 183`

**Context:** Lines 163, 176, 183 use `as unknown as string` to serialize the embedding vector for Supabase. This is a double type assertion that bypasses TypeScript checks. The `embedding` column in Supabase expects `extensions.vector` type, but the Supabase JS client may not handle vector types natively.

- [ ] **Step 1: Write the failing test**

Create `tests/ai/embeddings.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateEmbedding } from '@/lib/ai/embeddings';

describe('generateEmbedding', () => {
  it('should return a number array', async () => {
    // Mock fetch
    const originalFetch = global.fetch;
    global.fetch = async () =>
      Response.json({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
        model: 'text-embedding-ada-002',
        usage: { prompt_tokens: 10, total_tokens: 10 },
      });

    const result = await generateEmbedding('test', 'fake-key');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);

    global.fetch = originalFetch;
  });
});
```

Run: `npm test -- tests/ai/embeddings.test.ts`

Expected: FAIL (file doesn't exist yet) or PASS if embeddings API works.

- [ ] **Step 2: Fix the type assertion**

In `lib/ai/embeddings.ts`, the issue is at lines 163, 176, 183 where `embedding as unknown as string` is used. The Supabase client expects the embedding column to be a vector type. Let's check what the actual type should be.

Option A: Keep as-is but add a proper type guard:

```typescript
// In the upsertEmbedding function, line ~163:
const { error: updateError } = await supabase
  .from('note_embeddings')
  .update({
    content,
    embedding: embedding as unknown as number[],
    created_at: new Date().toISOString(),
  })
  .eq('id', existing.id);
```

Actually, the issue is that Supabase's JS client doesn't have proper types for `vector` columns. The `as unknown as string` is wrong because:
1. The embedding IS a number[], not a string
2. Supabase might accept it as a number[] directly
3. If it needs serialization, use JSON.stringify

Let's fix it properly. The Supabase JS client should handle number arrays for vector columns. If not, we need to check the actual Supabase API.

For now, let's ensure the type is correct. The embedding should be `number[]`. If Supabase needs it as a string, the column type in the database should be adjusted, not the TypeScript.

Fix line 163 (and similar lines 176, 183):

```typescript
// Change:
embedding: embedding as unknown as string,

// To (if Supabase accepts number[]):
embedding: embedding,

// Or if it needs to be a string (less likely):
embedding: JSON.stringify(embedding),
```

Run: `npm test -- tests/ai/embeddings.test.ts`

Expected: PASS with proper typing.

- [ ] **Step 3: Commit**

```bash
git add lib/ai/embeddings.ts tests/ai/embeddings.test.ts
git commit -m "fix: proper type handling for embeddings in lib/ai/embeddings.ts"
```

### Task 3: Fix Sync Engine Error Handling

**Files:**
- Modify: `lib/db/sync.ts:72-131` (flushSyncQueue), `lib/db/sync.ts:136-165` (onRealtimeChange)

- [ ] **Step 1: Write test for flushSyncQueue error handling**

Create `tests/db/sync.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { flushSyncQueue, addToSyncQueue } from '@/lib/db/sync';

describe('flushSyncQueue', () => {
  beforeEach(async () => {
    await db.syncQueue.clear();
  });

  afterEach(async () => {
    await db.syncQueue.clear();
  });

  it('should log errors for failed operations', async () => {
    // Add a sync entry that will fail (invalid table)
    await addToSyncQueue('invalidTable' as any, 'insert', 'test-id', {});

    const result = await flushSyncQueue();
    expect(result.synced).toBe(0);
    expect(result.failed).toBe(1);
  });

  it('should mark successful operations as synced', async () => {
    // This test requires a mock Supabase client
    // For now, just test the queue mechanism
    await addToSyncQueue('habits', 'insert', 'test-id', { name: 'Test' });
    const pending = await db.syncQueue.where('synced').equals(0).toArray();
    expect(pending).toHaveLength(1);
  });
});
```

Run: `npm test -- tests/db/sync.test.ts`

Expected: Some tests pass, some fail (need mocks).

- [ ] **Step 2: Add error logging to flushSyncQueue**

In `lib/db/sync.ts`, the `catch` block at line 126 just increments `failed++` without logging. Fix it:

```typescript
// Add import at top:
import { logger } from '@/lib/logger';

// In the catch block (around line 126):
catch (err) {
  failed++;
  logger.error('Sync failed for entry', {
    table: entry.table,
    operation: entry.operation,
    recordId: entry.record_id,
    error: err instanceof Error ? err.message : String(err),
  });
}
```

Also add logging for the `failed++` inside the switch statement (lines 85, 117):

```typescript
case 'insert': {
  const result = await client.from(remoteTable).insert(entry.data);
  error = result.error;
  if (error) {
    logger.warn('Insert failed', { table: remoteTable, error: error.message });
  }
  break;
}
// Repeat for 'update' and 'delete' cases
```

- [ ] **Step 3: Fix onRealtimeChange null check**

In `lib/db/sync.ts`, the `onRealtimeChange` function (line 136) receives a payload. The current code checks `payload.new` but doesn't verify it's not null before accessing `'id' in payload.new`.

Fix lines 152-154:

```typescript
case 'INSERT':
case 'UPDATE': {
  if (payload.new && typeof payload.new === 'object' && 'id' in payload.new && payload.new.id) {
    await table.put(payload.new as Record<string, unknown>);
  }
  break;
}
case 'DELETE': {
  if (payload.old?.id) {
    await table.delete(payload.old.id);
  }
  break;
}
```

- [ ] **Step 4: Run tests and verify**

Run: `npm test -- tests/db/sync.test.ts`

Expected: PASS (with mocks for Supabase).

- [ ] **Step 5: Commit**

```bash
git add lib/db/sync.ts tests/db/sync.test.ts
git commit -m "fix: add error logging and null checks to sync engine"
```

### Task 4: Fix Calculator Formula Bugs

**Files:**
- Modify: `lib/calculators/formulas.ts`
- Reference: `lib/calculators/references.ts`
- Modify: `lib/calculators/versions.ts` (if needed)
- Test: `tests/calculators.test.ts`

- [ ] **Step 1: Run calculator tests**

Run: `npm test -- tests/calculators.test.ts`

Expected: Some tests may fail. Note which calculators fail.

- [ ] **Step 2: Fix failing formulas**

For each failing calculator in `lib/calculators/formulas.ts`:

1. Check the formula against `lib/calculators/references.ts` for the correct clinical formula.
2. Fix the formula in `formulas.ts`.
3. Update `versions.ts` if the formula changed.

Example for a calculator fix (if CHADS-VASc was failing):

```typescript
// In lib/calculators/formulas.ts
export function calculateCHADS2VASc(params: CHADSParams): number {
  let score = 0;
  if (params.congestiveHeartFailure) score += 1;
  if (params.hypertension) score += 1;
  if (params.age >= 75) score += 2; // Was: += 1 (bug)
  if (params.diabetes) score += 1;
  if (params.strokeOrTIA) score += 2; // Was: += 1 (bug)
  if (params.vascularDisease) score += 1;
  if (params.age >= 65 && params.age < 75) score += 1;
  if (params.sex === 'female') score += 1;
  return score;
}
```

- [ ] **Step 3: Re-run tests**

Run: `npm test -- tests/calculators.test.ts`

Expected: All 22 calculators PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/calculators/formulas.ts lib/calculators/versions.ts tests/calculators.test.ts
git commit -m "fix: correct calculator formulas and update tests"
```

### Task 5: Fix Middleware Comment

**Files:**
- Modify: `lib/supabase/middleware.ts:63-66`

- [ ] **Step 1: Fix misleading comment**

In `lib/supabase/middleware.ts`, lines 62-66:

```typescript
// IMPORTANT: Do NOT call supabase.auth.signInWith*, signUp, or
// signOut here. Only getUser() is safe in middleware because it
// reads/refreshes tokens without side-effects beyond cookie updates.
// Avoid supabase.auth.getSession() — it reads from storage without
// guaranteeing the token is still valid.
await supabase.auth.getUser();
```

The comment says "Avoid supabase.auth.getSession()" but the code already uses `getUser()`. The comment is actually correct — it's warning NOT to use `getSession()`. Let's rephrase to be clearer:

```typescript
// IMPORTANT: Only use getUser() in middleware — it verifies the JWT with Supabase Auth server.
// Do NOT use getSession() — it only reads from cookies without verification (unsafe for authz).
// Do NOT call signInWith*, signUp, or signOut here — middleware should only refresh sessions.
await supabase.auth.getUser();
```

- [ ] **Step 2: Verify no getSession() calls exist**

Run: `grep -r "getSession" /Users/m4t30/scaling-eureka/lib /Users/m4t30/scaling-eureka/app --include="*.ts" --include="*.tsx" 2>/dev/null`

Expected: No results (or only in comments).

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/middleware.ts
git commit -m "fix: clarify middleware comment about getUser() vs getSession()"
```

---

## Phase 2: Code Cleanup

### Task 6: Consolidate State Management

**Note:** The spec (Phase 2.1) expected migration of `store/slices/*.ts` into `useLifeOsStore.ts` since the slices ARE imported by widgets. However, exploration revealed this is a complex refactor involving 6 slice files and 4+ widget components. Given the risk of breaking existing functionality, this plan **simplifies to documentation-only** (Option B in the spec). A full migration can be a separate sprint/follow-up.

**Files:**
- Modify: `store/useLifeOsStore.ts` (add migrated slices)
- Delete: `store/slices/todos.ts`, `store/slices/habits.ts`, `store/slices/nootropics.ts`
- Keep (but maybe migrate later): `store/slices/sleep.ts`, `store/slices/timer.ts`, `store/slices/weather.ts`
- Modify: `app/dashboard/_components/todo-widget.tsx` (update import)
- Modify: `app/dashboard/_components/habits-widget.tsx` (update import)
- Modify: `app/dashboard/_components/nootropics-widget.tsx` (update import)
- Modify: `app/dashboard/_components/analytics-widget.tsx` (update import)

**Context from exploration:** The `store/slices/` directory IS being used:
- `todos.ts` → imported by `todo-widget.tsx`
- `habits.ts` → imported by `habits-widget.tsx`, `analytics-widget.tsx`
- `nootropics.ts` → imported by `nootropics-widget.tsx`, `analytics-widget.tsx`
- `sleep.ts`, `timer.ts`, `weather.ts` → may also be used

The codebase has TWO state patterns:
1. `useLifeOsStore.ts` — single store with combined slices (zustand v5 API)
2. `store/slices/*.ts` — factory function pattern (`createXSlice`)

**Decision:** Migrate all slices from `store/slices/*.ts` into `useLifeOsStore.ts` to have a single, consolidated store.

- [ ] **Step 1: Examine a slice factory pattern**

Read `store/slices/todos.ts` to understand the pattern:

```typescript
// Typical slice factory pattern:
export interface TodosSlice {
  todos: LocalTodo[];
  addTodo: (text: string, priority: Priority) => void;
  toggleTodo: (id: string) => void;
  // ...
}

export function createTodosSlice(set: any, get: any): TodosSlice {
  return {
    todos: [],
    addTodo: (text, priority) => set((state: TodosSlice) => ({
      todos: [...state.todos, { t: text, p: priority, done: false }],
    })),
    // ...
  };
}
```

- [ ] **Step 2: Migrate todos slice into useLifeOsStore.ts**

In `store/useLifeOsStore.ts`, add the todos state and actions to the existing store.

First, add the TodosSlice interface (or inline the type):

```typescript
// Add to imports:
import type { LocalTodo } from '@/types/state';

// Add to LifeOsStore interface (or create a new extended interface):
export interface LifeOsStore extends PaletteSlice, SleepUISlice, FeelingsSlice, TimerUISlice {
  // ... existing fields ...

  // Todos
  todos: LocalTodo[];
  addTodo: (text: string, priority: 'H' | 'M' | 'L') => void;
  toggleTodo: (id: string) => void;
  archiveDoneTodos: () => void;
  // ... other todo actions from the slice
}
```

Then, add the implementation inside the `create<LifeOsStore>()(persist((set, get) => ({ ... })))` call.

**Note:** This is a significant refactor. Given the complexity, for the plan, let's simplify:

**REVISED DECISION:** Keep both patterns but:
1. Remove DUPLICATE state (sleep and timer are in both `useLifeOsStore.ts` AND `store/slices/sleep.ts`/`timer.ts`)
2. Keep `store/slices/` for domain data (todos, habits, nootropics)
3. Keep `useLifeOsStore.ts` for UI state (theme, palette, feelings, timer UI, sleep UI)
4. Document the pattern in a comment

Actually, looking more carefully:
- `useLifeOsStore.ts` has `SleepUISlice` (sleep input times) and `TimerUISlice` (timer UI)
- `store/slices/sleep.ts` likely has different sleep state
- `store/slices/timer.ts` likely has different timer state

Let's check if there's actual duplication.

Run: `grep -n "sleep\|timer" /Users/m4t30/scaling-eureka/store/slices/sleep.ts | head -20`

If the slices have different state than `useLifeOsStore.ts`, then there's no duplication — they serve different purposes.

Given the complexity and risk of breaking things, let's simplify this task:

**SIMPLIFIED TASK: Document the state management pattern**

- [ ] **Step 1: Add a comment to store/useLifeOsStore.ts explaining the pattern**

At the top of `store/useLifeOsStore.ts`, add:

```typescript
/**
 * STATE MANAGEMENT PATTERN:
 *
 * 1. UI State (theme, palette, feelings, timer UI, sleep UI):
 *    Managed by this single consolidated store (useLifeOsStore).
 *
 * 2. Domain Data (todos, habits, nootropics, sleep data, timer data, weather):
 *    Managed by individual slices in store/slices/*.ts using the factory pattern.
 *    Each slice is imported directly by the widgets that need it.
 *
 * This separation allows widgets to import only the state they need
 * (via createXSlice functions) without pulling in the entire store.
 */
```

- [ ] **Step 2: Verify the pattern works**

Run: `npm test -- tests/store.test.ts`

Expected: PASS (existing tests still work).

- [ ] **Step 3: Commit**

```bash
git add store/useLifeOsStore.ts
git commit -m "docs: document state management pattern in useLifeOsStore.ts"
```

**Note:** Full consolidation of state management is out of scope for this cleanup phase. If desired, create a separate task/sprint for it.

### Task 7: Remove Console Statements

**Files:**
- Modify: `lib/errors/error-hooks.ts` (lines 407, 423, 431, 456, 463, 470)
- Keep: `lib/errors/error-boundary.tsx:99-100` (legitimate error logging)
- Keep: `lib/logger.ts` (the proper logging utility)

- [ ] **Step 1: Replace console.log/warn/error in error-hooks.ts**

In `lib/errors/error-hooks.ts`, replace:

Line 407: `console.error('Error logged:', { ... })` → `logger.error('Error logged', { ... })`

Line 423: `console.info('Info logged:', { ... })` → `logger.info('Info logged', { ... })`

Line 431: `console.warn('Warning logged:', { ... })` → `logger.warn('Warning logged', { ... })`

Line 456: `console.error('Toast shown:', ...)` → `logger.debug('Toast shown', { message })`

Line 463: `console.log('Success toast shown:', ...)` → `logger.info('Success toast shown', { message })`

Line 470: `console.log('Info toast shown:', ...)` → `logger.info('Info toast shown', { message })`

Also add the import at the top of `error-hooks.ts`:

```typescript
import { logger } from '@/lib/logger';
```

- [ ] **Step 2: Verify no more console statements (excluding logger.ts)**

Run: `grep -rn "console\." /Users/m4t30/scaling-eureka/lib /Users/m4t30/scaling-eureka/app /Users/m4t30/scaling-eureka/components --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "lib/logger.ts"`

Expected: Only the error-boundary.tsx lines (which are legitimate).

- [ ] **Step 3: Commit**

```bash
git add lib/errors/error-hooks.ts
git commit -m "refactor: replace console statements with logger in error-hooks.ts"
```

### Task 8: Standardize Type Imports

**Files:**
- Modify: All `.ts` and `.tsx` files with type imports

- [ ] **Step 1: Find type-only imports that don't use `import type`**

Run: `grep -rn "^import" /Users/m4t30/scaling-eureka/lib /Users/m4t30/scaling-eureka/app --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "import type" | grep -v "from 'react'" | grep -v "from 'next'" | head -30`

Look for patterns like:
```typescript
import { SomeType, SomeFunction } from '...'; // Should be: import type { SomeType } + import { SomeFunction }
```

- [ ] **Step 2: Fix type imports**

For each file, separate type imports from value imports:

```typescript
// Before:
import { type SomeType, someFunction } from 'module';

// After (if SomeType is only a type):
import type { SomeType } from 'module';
import { someFunction } from 'module';
```

Key files to check:
- `lib/db/schema.ts`
- `lib/ai/embeddings.ts`
- `app/calculators/page.tsx`
- `app/dashboard/_components/dashboard-grid.tsx`

- [ ] **Step 3: Run linter to verify**

Run: `npm run lint`

Expected: No unused import warnings.

- [ ] **Step 4: Commit**

```bash
git add lib/ app/
git commit -m "refactor: standardize type imports to use 'import type' syntax"
```

### Task 9: Remove Deprecated Next.js Patterns

**Files:**
- Check: Entire project for Pages Router patterns
- Check: `next/config.js` for deprecated options

- [ ] **Step 1: Verify no Pages Router directory exists**

Run: `ls -la /Users/m4t30/scaling-eureka/pages 2>/dev/null || echo "No pages/ directory — good!"`

Expected: "No pages/ directory — good!"

- [ ] **Step 2: Check for deprecated Next.js imports**

Run: `grep -rn "from 'next/router'" /Users/m4t30/scaling-eureka/app /Users/m4t30/scaling-eureka/components --include="*.tsx" 2>/dev/null`

Expected: No results (should use `next/navigation` instead).

If any found, fix:
```typescript
// Before:
import { useRouter } from 'next/router';

// After:
import { useRouter } from 'next/navigation';
```

- [ ] **Step 3: Verify next.config.ts has no deprecated options**

Check `next.config.ts` for deprecated options like:
- `target: 'server'` (removed in Next.js 13+)
- `i18n` (moved to `app/` folder structure in App Router)

- [ ] **Step 4: Build to verify**

Run: `npm run build`

Expected: Successful build with no Next.js deprecation warnings.

- [ ] **Step 5: Commit (if any changes were made)**

```bash
git add .
git commit -m "refactor: remove deprecated Next.js patterns"
```

---

## Phase 3: Interface Upgrades

### Task 10: Upgrade Widget Loading UX

**Files:**
- Modify: `app/dashboard/_components/dashboard-grid.tsx` (WidgetSkeleton component)
- Use: `components/ui/skeleton.tsx` (already exists)

- [ ] **Step 1: Check existing Skeleton component**

Read `components/ui/skeleton.tsx` to understand its API.

- [ ] **Step 2: Update WidgetSkeleton in dashboard-grid.tsx**

Change the inline skeleton (lines 45-51) to use the `Skeleton` component:

```typescript
import { Skeleton } from '@/components/ui/skeleton';

function WidgetSkeleton() {
  return (
    <div className="widget">
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
```

Also update the loading state in the `DashboardGrid` function (around line 198):

```typescript
if (!hydrated) {
  return (
    <div className="dashboard-grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="widget h-48 w-full" />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Add loading states to data-fetching widgets**

For widgets that fetch data (weather, stocks, todos, habits), use TanStack Query's `isPending` or `isFetching`:

```typescript
// In weather-widget.tsx:
const { data, isPending } = useWeather();

if (isPending) {
  return <Skeleton className="h-32 w-full" />;
}
```

- [ ] **Step 4: Verify no flash of unstyled content**

Run: `npm run dev` and navigate to `/dashboard`. Hard refresh (Ctrl+Shift+R) and observe loading states.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/_components/dashboard-grid.tsx app/dashboard/_components/*-widget.tsx
git commit -m "feat: upgrade widget loading UX with Skeleton component"
```

### Task 11: Improve Dashboard Grid Responsiveness

**Files:**
- Modify: `app/dashboard/_components/dashboard-grid.tsx`

- [ ] **Step 1: Add responsive grid breakpoints**

The current grid uses CSS Grid. Update it to be responsive using the `useMediaQuery` hook (already exists in `lib/hooks/use-media-query.ts`):

```typescript
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export function DashboardGrid() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

  // Adjust grid columns based on screen size
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile
      ? 'repeat(1, 1fr)'
      : isTablet
        ? 'repeat(2, 1fr)'
        : 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1rem',
  };

  return (
    <div style={gridStyle}>
      {/* ... widgets ... */}
    </div>
  );
}
```

Note: The current implementation uses CSS classes. Update the approach to use inline styles or Tailwind classes with responsive modifiers.

Better approach using Tailwind:

The `dashboard-grid.tsx` already has `className="dashboard-grid"`. Update the CSS for `.dashboard-grid` in the global CSS to be responsive, or use Tailwind classes directly.

Actually, looking at the code, the grid is rendered as:
```tsx
<div className="dashboard-grid">
```

We need to update the CSS or use inline styles with the media query. Let's use inline styles with the hook:

- [ ] **Step 2: Update SortableWidget for responsive columns**

In the `SortableWidget` component (line 143):

```typescript
function SortableWidget({ item, isMobile }: SortableWidgetProps) {
  const colSpan = isMobile ? 1 : (item.w ?? 1);

  const style: React.CSSProperties = {
    gridColumn: `span ${colSpan}`,
    gridRow: `span ${item.h}`,
    // ...
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* ... */}
    </div>
  );
}
```

This is already handled (line 143 uses `isMobile`). Good.

- [ ] **Step 3: Test on different viewports**

Run: `npm run dev`

Open Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M) → Test:
- Mobile (iPhone 12, 390x844): 1 column
- Tablet (iPad, 768x1024): 2 columns
- Desktop (1920x1080): 3+ columns

Verify drag-and-drop still works on all breakpoints.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/_components/dashboard-grid.tsx
git commit -m "feat: make dashboard grid responsive (1 col mobile, 2 tablet, 3+ desktop)"
```

### Task 12: Enhance Error Boundaries

**Files:**
- Modify: `lib/errors/error-boundary.tsx` (if needed)
- Modify: `app/layout.tsx` (add global error boundary)
- Modify: `app/dashboard/_components/*-widget.tsx` (wrap in error boundaries)

- [ ] **Step 1: Check current error-boundary.tsx**

Read `lib/errors/error-boundary.tsx` to understand its API.

- [ ] **Step 2: Add error boundary to app/layout.tsx**

In `app/layout.tsx`, wrap the children in a global error boundary:

```tsx
import { ErrorBoundary } from '@/lib/errors/error-boundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" data-theme="dark" data-palette="reaktor" className={`${inter.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ErrorBoundary>
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Wrap each widget in individual error boundaries**

In each widget file (e.g., `todo-widget.tsx`), add an error boundary:

```tsx
import { ErrorBoundary } from '@/lib/errors/error-boundary';

export default function TodoWidget({ id }: { id: string }) {
  return (
    <ErrorBoundary fallback={<div className="widget">Something went wrong with Todo Widget</div>}>
      {/* existing widget content */}
    </ErrorBoundary>
  );
}
```

Apply to all 13 widget components.

- [ ] **Step 4: Verify error handling**

Run: `npm run dev`

Test by intentionally breaking a widget (temporarily) and verify:
1. Error boundary catches it (shows fallback UI, not white screen)
2. Error is logged via `lib/logger.ts`
3. Other widgets still work (individual boundaries)

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/dashboard/_components/*-widget.tsx lib/errors/error-boundary.tsx
git commit -m "feat: add error boundaries to layout and widgets"
```

### Task 13: Upgrade Calculator UI

**Files:**
- Modify: `app/calculators/_components/calc-card.tsx` (add Copy/Share buttons)
- Modify: `app/calculators/_components/*.tsx` (improve mobile layout)
- Modify: `app/calculators/page.tsx` (add print styles)

- [ ] **Step 1: Add "Copy Result" button to CalcCard**

In `app/calculators/_components/calc-card.tsx`, add a copy button:

```tsx
import { useState } from 'react';

// Inside CalcCard component:
const [copied, setCopied] = useState(false);

const handleCopy = async () => {
  const resultText = `Calculator: ${title}\nFormula: ${formula}\nVersion: ${version}`;
  await navigator.clipboard.writeText(resultText);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

// Add button to JSX:
<button onClick={handleCopy} className="copy-btn">
  {copied ? 'Copied!' : 'Copy Result'}
</button>
```

- [ ] **Step 2: Add "Share" button (generate shareable URL)**

```tsx
const handleShare = () => {
  const params = new URLSearchParams({
    calc: key,
    // Add any form values as params
  });
  const shareUrl = `${window.location.origin}/calculators?${params.toString()}`;
  navigator.clipboard.writeText(shareUrl);
  // Or use Web Share API if available:
  if (navigator.share) {
    navigator.share({ title: `Calculator: ${title}`, url: shareUrl });
  }
};
```

- [ ] **Step 3: Improve mobile layout for calculators**

In `app/calculators/page.tsx`, the grid uses `gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))'`.

For mobile, ensure:
1. No horizontal scroll
2. Inputs are touch-friendly (min 44px touch target)
3. Results are clearly visible

Add a media query or use the `useMediaQuery` hook to adjust the grid:

```typescript
const isMobile = useMediaQuery('(max-width: 640px)');

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: isMobile
    ? '1fr'  // Single column on mobile
    : 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '0.75rem',
};
```

- [ ] **Step 4: Add print-friendly styles**

In the global CSS or a style tag in `app/calculators/page.tsx`:

```css
@media print {
  header, nav, .sidebar, .widget-controls {
    display: none !important;
  }

  main {
    margin: 0 !important;
    padding: 0 !important;
  }

  .calculator-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add app/calculators/
git commit -m "feat: upgrade calculator UI with copy/share, mobile layout, print styles"
```

---

## Phase 4: Functionality Improvements

### Task 14: Add Unit Tests for Missing Coverage

**Files:**
- Create: `tests/queries/use-todos.test.ts`
- Create: `tests/queries/use-habits.test.ts`
- Create: `tests/queries/use-nootropics.test.ts`
- Create: `tests/queries/use-sleep.test.ts`
- Create: `tests/db/sync.test.ts` (started in Task 3)
- Create: `tests/errors/error-boundary.test.tsx`
- Create: `tests/errors/error-hooks.test.ts`

- [ ] **Step 1: Create test for useTodos hook**

Create `tests/queries/use-todos.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useTodos, useAddTodo, useToggleTodo } from '@/lib/queries/use-todos';
import { createClient } from '@/lib/supabase/client';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: () => ({
      select: () => ({ eq: () => ({ order: () => ({ data: [], error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: { id: '1', text: 'Test', done: false, priority: 'M' }, error: null }) }) }),
      update: () => ({ eq: () => ({ error: null }) }),
    }),
  })),
}));

describe('useTodos', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('should fetch todos', async () => {
    const { result } = renderHook(() => useTodos(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
```

- [ ] **Step 2: Create tests for other query hooks**

Repeat Step 1 pattern for:
- `useHabits` / `useAddHabit` in `tests/queries/use-habits.test.ts`
- `useNootropics` in `tests/queries/use-nootropics.test.ts`
- `useSleep` in `tests/queries/use-sleep.test.ts`

- [ ] **Step 3: Run coverage check**

Run: `npm run test:coverage`

Expected: 80%+ coverage for `lib/` files.

- [ ] **Step 4: Commit**

```bash
git add tests/
git commit -m "test: add unit tests for query hooks and sync engine"
```

### Task 15: Enhance Offline Support

**Files:**
- Modify: `components/layout/header.tsx` (add offline indicator, sync button)
- Modify: `app/dashboard/_components/*-widget.tsx` (show pending sync count)

- [ ] **Step 1: Add offline/online indicator to header**

In `components/layout/header.tsx`, add:

```tsx
import { useState, useEffect } from 'react';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-indicator" style={{ background: '#fbbf24', color: '#000', padding: '0.5rem', textAlign: 'center' }}>
      Offline — changes will sync when reconnected
    </div>
  );
}
```

Render `<OfflineIndicator />` at the top of the header.

- [ ] **Step 2: Add "Sync Now" button to header**

```tsx
import { flushSyncQueue } from '@/lib/db/sync';
import { useState } from 'react';

function SyncButton() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Check pending sync count
    const checkPending = async () => {
      const { db } = await import('@/lib/db');
      const count = await db.syncQueue.where('synced').equals(0).count();
      setPending(count);
    };
    checkPending();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await flushSyncQueue();
      // Re-check pending count
      const { db } = await import('@/lib/db');
      const count = await db.syncQueue.where('synced').equals(0).count();
      setPending(count);
    } catch (error) {
      console.error('Sync failed', error);
    }
    setSyncing(false);
  };

  if (pending === 0) return null;

  return (
    <button onClick={handleSync} disabled={syncing} className="sync-btn">
      {syncing ? 'Syncing...' : `Sync ${pending} changes`}
    </button>
  );
}
```

- [ ] **Step 3: Show pending sync count in widgets**

In widgets that modify data (todo-widget, habits-widget, etc.), show a small indicator:

```tsx
// In todo-widget.tsx:
const [pendingCount, setPendingCount] = useState(0);

useEffect(() => {
  const checkPending = async () => {
    const { db } = await import('@/lib/db');
    const count = await db.syncQueue.where('synced').equals(0).count();
    setPendingCount(count);
  };
  checkPending();
}, []);

// In JSX:
{pendingCount > 0 && (
  <span className="pending-badge">{pendingCount} pending sync</span>
)}
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/header.tsx app/dashboard/_components/*-widget.tsx
git commit -m "feat: enhance offline support with indicators and manual sync"
```

### Task 16: Improve Accessibility (a11y)

**Files:**
- Test: `tests/e2e/a11y.spec.ts` (already exists, enhance)
- Modify: Various widget components (add ARIA labels)

- [ ] **Step 1: Run existing a11y tests**

Run: `npm run test:e2e -- tests/e2e/a11y.spec.ts`

Expected: PASS with 0 violations (or note current violations).

- [ ] **Step 2: Add ARIA labels to interactive elements**

Scan all widgets for buttons/inputs without proper labels:

```bash
grep -rn "<button" /Users/m4t30/scaling-eureka/app/dashboard/_components/*.tsx | grep -v "aria-label" | grep -v ">.*<" | head -20
```

For each button without `aria-label` or visible text, add:

```tsx
<button aria-label="Toggle todo completion" onClick={...}>
  <CheckIcon />
</button>
```

- [ ] **Step 3: Ensure color contrast meets WCAG AA**

Check `tailwind.config.ts` for color definitions. Ensure text colors have at least 4.5:1 contrast ratio against their backgrounds.

Use browser tools: Chrome DevTools → Elements → Computed → Color → Contrast ratio.

- [ ] **Step 4: Add keyboard navigation support**

The drag-and-drop already has `KeyboardSensor`. Verify all interactive elements are focusable:

```tsx
// Ensure buttons have :focus styles
<button className="widget-btn focus:ring-2 focus:ring-blue-500">
```

- [ ] **Step 5: Re-run a11y tests**

Run: `npm run test:e2e -- tests/e2e/a11y.spec.ts`

Expected: PASS with 0 violations.

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/_components/ tests/e2e/a11y.spec.ts
git commit -m "a11y: improve accessibility with ARIA labels and keyboard navigation"
```

### Task 17: Add E2E Tests for Critical Paths

**Files:**
- Create: `tests/e2e/todo-flow.spec.ts`
- Create: `tests/e2e/habit-flow.spec.ts`
- Create: `tests/e2e/calculator-flow.spec.ts`
- Create: `tests/e2e/offline-flow.spec.ts`

- [ ] **Step 1: Create E2E test for todo flow**

Create `tests/e2e/todo-flow.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Todo Flow', () => {
  test('create todo → toggle complete → archive done', async ({ page }) => {
    await page.goto('/dashboard');

    // Create todo
    await page.fill('[placeholder="Add todo..."]', 'Test todo');
    await page.click('button:has-text("Add")');

    // Verify todo appears
    await expect(page.locator('text=Test todo')).toBeVisible();

    // Toggle complete
    await page.click('[aria-label*="Toggle"]');

    // Archive done
    await page.click('button:has-text("Archive Done")');

    // Verify archived
    await page.click('button:has-text("Show Archived")');
    await expect(page.locator('text=Test todo')).toBeVisible();
  });
});
```

- [ ] **Step 2: Create E2E test for habit flow**

Create `tests/e2e/habit-flow.spec.ts`:

```typescript
test('add habit → mark complete → view streak', async ({ page }) => {
  await page.goto('/dashboard');

  // Add habit
  await page.fill('[placeholder="Add habit..."]', 'Exercise');
  await page.click('button:has-text("Add")');

  // Mark complete for today
  await page.click('[aria-label*="Toggle habit"]');

  // View streak (if analytics widget shows it)
  await expect(page.locator('text=/streak|连续/')).toBeVisible();
});
```

- [ ] **Step 3: Create E2E test for calculator**

Create `tests/e2e/calculator-flow.spec.ts`:

```typescript
test('calculate CHADS-VASc → verify result → copy result', async ({ page }) => {
  await page.goto('/calculators');

  // Click on CHADS calculator tab
  await page.click('button:has-text("Cardio")');

  // Fill in parameters
  await page.check('input[name="congestiveHeartFailure"]');
  await page.check('input[name="hypertension"]');
  await page.fill('input[name="age"]', '76');

  // Verify result
  await expect(page.locator('text=/Score: [0-9]+/')).toBeVisible();

  // Copy result
  await page.click('button:has-text("Copy Result")');
  // Verify clipboard (if possible in Playwright)
});
```

- [ ] **Step 4: Create E2E test for offline flow**

Create `tests/e2e/offline-flow.spec.ts`:

```typescript
test('go offline → create todo → reconnect → verify sync', async ({ page, context }) => {
  await page.goto('/dashboard');

  // Go offline
  await context.setOffline(true);

  // Create todo while offline
  await page.fill('[placeholder="Add todo..."]', 'Offline todo');
  await page.click('button:has-text("Add")');

  // Verify offline indicator
  await expect(page.locator('text=/offline|ofline/i')).toBeVisible();

  // Reconnect
  await context.setOffline(false);

  // Wait for sync
  await page.waitForTimeout(2000);

  // Verify todo appears in the list (synced)
  await expect(page.locator('text=Offline todo')).toBeVisible();
});
```

- [ ] **Step 5: Run all E2E tests**

Run: `npm run test:e2e`

Expected: All new E2E tests PASS.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/
git commit -m "test: add E2E tests for critical user paths"
```

---

## Phase 5: Deployment & Verification

### Task 18: Pre-Deployment Checks

- [ ] **Step 1: Run full test suite**

Run: `npm test`

Expected: All unit tests PASS.

- [ ] **Step 2: Run E2E tests**

Run: `npm run test:e2e`

Expected: All E2E tests PASS.

- [ ] **Step 3: Run build**

Run: `npm run build`

Expected: Successful build with no errors.

- [ ] **Step 4: Check environment variables**

Verify required env vars are set (for Vercel deployment):

```bash
vercel env ls
```

Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.

If missing:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

- [ ] **Step 5: Run Lighthouse audit**

Run: `npm run lighthouse`

Expected: Performance score ≥ 80.

- [ ] **Step 6: Commit (if any changes from checks)**

```bash
git add .
git commit -m "chore: pre-deployment checks and fixes"
```

### Task 19: Deploy via gh CLI

- [ ] **Step 1: Verify gh CLI authentication**

Run: `gh auth status`

Expected: Authenticated to GitHub.

If not authenticated:

```bash
gh auth login
```

- [ ] **Step 2: Commit all remaining changes**

```bash
git add -A
git status  # Review what's being committed
git commit -m "feat: complete codebase improvement (debug, cleanup, UI, functionality)"
```

- [ ] **Step 3: Push to main**

```bash
git push origin main
```

Expected: Push succeeds. Vercel auto-deploys from main branch.

- [ ] **Step 4: Monitor deployment**

Check Vercel dashboard: https://vercel.com/dashboard

Or use CLI:

```bash
vercel list
```

Check deployment status.

### Task 20: Debug Deployment Issues

- [ ] **Step 1: Check deployment logs if there's an error**

```bash
vercel logs <deployment-url>
```

Or check Vercel dashboard for build logs.

- [ ] **Step 2: Common issues and fixes**

**White screen:**
1. Check browser console for errors (missing env vars)
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env
3. Run `vercel env ls` to list env vars
4. Add missing vars: `vercel env add NEXT_PUBLIC_SUPABASE_URL`
5. Redeploy: `git commit --allow-empty -m "trigger redeploy"` && `git push`

**API errors (401/403):**
1. Check `/api/health` endpoint
2. Verify API keys in Vercel env (`vercel env ls`)
3. Check `app/api/proxy/[provider]/route.ts` for correct API key injection

**Supabase errors:**
1. Check Supabase status: https://status.supabase.com
2. Verify RLS policies are correct
3. Test Supabase connection: `npx supabase status`

- [ ] **Step 3: Follow RUNBOOK.md**

For detailed troubleshooting, refer to `RUNBOOK.md` in the project root.

- [ ] **Step 4: Commit any fixes**

```bash
git add .
git commit -m "fix: resolve deployment issues"
git push origin main
```

### Task 21: Post-Deployment Verification

- [ ] **Step 1: Run E2E tests against production URL**

```bash
PLAYWRIGHT_TEST_BASE_URL=https://<your-app>.vercel.app npm run test:e2e
```

Expected: All E2E tests PASS on production.

- [ ] **Step 2: Manual smoke test**

Visit https://<your-app>.vercel.app and verify:
1. `/dashboard` loads correctly (all 13 widgets render)
2. `/calculators` loads (all 22 calculators work)
3. Create a todo → verify it appears
4. Toggle a habit → verify it updates
5. Check offline indicator works (disable network in DevTools)
6. Run a calculator → verify result is correct

- [ ] **Step 3: Check browser console for errors**

Open Chrome DevTools → Console tab → Refresh page → Verify no errors (red messages).

- [ ] **Step 4: Verify performance**

Check Lighthouse score on production:
1. Open Chrome DevTools → Lighthouse tab
2. Run audit for "Performance", "Accessibility", "Best Practices"
3. Verify scores are acceptable (≥ 80 for performance)

---

## Summary

| Phase | Task | Est. Time |
|-------|------|-----------|
| Phase 1: Debug & Fix | Tasks 1-5 (5 tasks) | 2-3 hours |
| Phase 2: Code Cleanup | Tasks 6-9 (4 tasks) | 2-3 hours |
| Phase 3: Interface Upgrades | Tasks 10-13 (4 tasks) | 3-4 hours |
| Phase 4: Functionality | Tasks 14-17 (4 tasks) | 3-4 hours |
| Phase 5: Deployment | Tasks 18-21 (4 tasks) | 1-2 hours |
| **Total** | **21 tasks** | **11-16 hours** |

### Execution Notes
- Each task is self-contained with test → implement → commit cycle
- Follow TDD: write failing test first, then implement
- Commit frequently with descriptive messages
- Phase 5 requires `gh` CLI authentication and Vercel project linked
