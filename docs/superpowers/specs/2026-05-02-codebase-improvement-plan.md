# Scaling Eureka — Codebase Improvement Plan

**Date:** 2026-05-02
**Scope:** Debug, cleanup, interface upgrades, functionality improvements, and deployment
**Plan Type:** Phased implementation with documentation-first approach

---

## Phase 0: Documentation Discovery (COMPLETED)

### Allowed APIs — Verified from Documentation

#### Next.js 16 (App Router)
- **Layouts:** `app/layout.tsx` — Root layout with `<html>`, `<body>`, `children: React.ReactNode`
- **Pages:** `app/page.tsx` — Default export, `'use client'` for client components
- **Route Handlers:** `app/api/*/route.ts` — `GET`, `POST`, `PUT`, `DELETE` functions, `NextRequest`, `NextResponse`
- **Middleware:** `middleware.ts` at root — `NextRequest`, `NextResponse`, cookie methods
- **Cache APIs:** `unstable_cache` (legacy), `'use cache'` directive, `cacheTag()`, `cacheLife()` (Next.js 16)
- **Dynamic imports:** `next/dynamic` — `dynamic(() => import(...), { loading, ssr })`
- **Fonts:** `next/font/google` — `Inter({ subsets: ['latin'] })`, `IBM_Plex_Mono`
- **Images:** `next/image` — `<Image src width height alt quality sizes />`
- **Navigation:** `next/navigation` — `useRouter()`, `usePathname()`, `redirect()`

#### Supabase
- **Client v2:** `createClient(url, key, options?)` — `@supabase/supabase-js`
- **SSR:** `createBrowserClient` / `createServerClient` from `@supabase/ssr`
- **Auth:** `getUser()` (verified, server-side), `getSession()` (unverified, cookie-only — DO NOT USE for authz)
- **Database:** `.from('table').select/insert/update/delete`, `.eq()`, `.order()`, `.single()`, `.maybeSingle()`
- **Realtime:** `.channel()`, `.on('postgres_changes', { event, schema, table }, callback)`, `.subscribe()`
- **Storage:** `.storage.from('bucket').upload/download/list/remove/getPublicUrl/createSignedUrl()`
- **pgvector:** `<=>` operator for cosine distance, `match_embeddings` RPC pattern

#### TanStack Query v5
- **useQuery:** `useQuery({ queryKey, queryFn, enabled, staleTime, retry, gcTime, select })`
- **useMutation:** `useMutation({ mutationFn, onSuccess, onError, onSettled })`
- **useQueryClient:** `const queryClient = useQueryClient()` — `invalidateQueries()`, `setQueryData()`, `getQueryData()`
- **QueryClient:** `new QueryClient({ defaultOptions: { queries: { staleTime, retry } } })`
- **QueryClientProvider:** Wraps app, provides client to hooks

### Anti-Patterns to Avoid
1. **DO NOT** use `getSession()` for authorization — use `getUser()` (contradicts current middleware comment in `lib/supabase/middleware.ts:63`)
2. **DO NOT** put `'use client'` in every file — only at Server→Client boundary
3. **DO NOT** invent Supabase methods — verify against Context7 docs (`/supabase/supabase-js` v2.58.0)
4. **DO NOT** skip `enabled: false` for dependent queries in TanStack Query
5. **DO NOT** use `mutate()` when you need a Promise — use `mutateAsync()`
6. **DO NOT** forget query key order matters: `['todos', status, page]` ≠ `['todos', page, status]`

---

## Phase 1: Debug & Fix Errors

### Task 1.1: Fix TypeScript Errors and Bad Patterns

**What to implement:**
- Search for `@ts-ignore`, `@ts-nocheck`, `as any`, and `any` type usages
- Fix type assertions in `lib/ai/embeddings.ts` line 163: `embedding as unknown as string` — should use proper serialization
- Fix `lib/db/sync.ts` line 182: `Row = { [key: string]: string }` — overly broad index signature
- Fix `store/useLifeOsStore.ts` line 116: `parseHHMM` usage — function defined at bottom but used in callback (hoisting issue in strict mode)

**Documentation references:**
- TypeScript strict mode: `tsconfig.json` in project root
- TanStack Query types: Context7 `/tanstack/query` v5.60.5

**Verification checklist:**
- `npm run build` completes without TypeScript errors
- Grep for `@ts-ignore` returns 0 results
- Grep for `as any` in `lib/` and `store/` returns 0 results

**Anti-pattern guards:**
- Do NOT use `// @ts-ignore` as a fix — fix the root cause
- Do NOT use `any` type — use proper TypeScript types from `types/database.ts`

### Task 1.2: Fix Calculator Formula Bugs

**What to implement:**
- Run `npm test -- tests/calculators.test.ts`
- Identify failing calculator formulas
- Fix `lib/calculators/formulas.ts` — verify each formula against clinical references in `lib/calculators/references.ts`
- Check `lib/calculators/versions.ts` — ensure version metadata matches actual implementation

**Documentation references:**
- Clinical references: `lib/calculators/references.ts`
- Formula implementations: `lib/calculators/formulas.ts`

**Verification checklist:**
- `npm test -- tests/calculators.test.ts` passes all 22 calculators
- Each calculator shows correct result for known test cases

**Anti-pattern guards:**
- Do NOT modify test file to make tests pass — fix the implementation
- Do NOT change clinical formulas without updating `references.ts`

### Task 1.3: Fix Sync Engine Error Handling

**What to implement:**
- Review `lib/db/sync.ts` error handling in `flushSyncQueue()` — currently just increments `failed` counter without logging
- Add proper error logging via `lib/logger.ts`
- Fix `onRealtimeChange()` — missing null check on `payload.new` before accessing `'id' in payload.new`
- Ensure sync queue marks entries as `synced: true` ONLY on actual success

**Documentation references:**
- Sync engine: `lib/db/sync.ts` (lines 52-131)
- Logger: `lib/logger.ts`

**Verification checklist:**
- Grep for error handling in sync.ts — each try/catch should log the error
- Test offline→online flow manually or via E2E test
- Verify failed sync entries remain in queue (not marked synced)

**Anti-pattern guards:**
- Do NOT use `console.log` in production code — use `lib/logger.ts`
- Do NOT silently swallow errors (current pattern in `catch { failed++ }`)

### Task 1.4: Fix Supabase Middleware Anti-Pattern

**What to implement:**
- `lib/supabase/middleware.ts` line 63-66: Comments say "Avoid supabase.auth.getSession()" but code uses `getUser()` correctly
- However, the comment is misleading — update comment to say "Using getUser() which verifies with Auth server"
- Verify `lib/supabase/server.ts` uses `cookies()` API correctly (Next.js 16 pattern)

**Documentation references:**
- Supabase Auth: Context7 `/supabase/supabase-js` — getUser vs getSession
- Next.js middleware: Context7 `/vercel/next.js` — cookie methods

**Verification checklist:**
- Middleware comment accurately reflects code behavior
- No `getSession()` calls in codebase (grep verify)

**Anti-pattern guards:**
- Do NOT add `getSession()` calls anywhere
- Do NOT modify middleware to sign in/out — only refresh session

---

## Phase 2: Code Cleanup

### Task 2.1: Remove Duplicate State Management

**What to implement:**
- Current codebase has BOTH `store/slices/` (legacy Zustand slices) AND `store/useLifeOsStore.ts` (consolidated store)
- `useLifeOsStore.ts` lines 50, 146, 157 reference types from `store/slices/` but the slices may be unused
- Check if `store/slices/*.ts` files are actually imported anywhere
- If unused: delete `store/slices/` directory
- If used: migrate remaining slices into `useLifeOsStore.ts` and delete `store/slices/`

**Documentation references:**
- Zustand v5 API: https://github.com/pmndrs/zustand (slice pattern vs single store)
- Current store: `store/useLifeOsStore.ts`

**Verification checklist:**
- Grep for imports from `store/slices/` — 0 results after cleanup
- `store/slices/` directory removed or fully migrated
- App functions identically (all widgets work)

**Anti-pattern guards:**
- Do NOT maintain two parallel state systems — pick one pattern
- Do NOT delete slices that are still imported

### Task 2.2: Remove Console.log Statements

**What to implement:**
- Search entire `lib/` and `app/` for `console.log`, `console.warn`, `console.error` (excluding `lib/logger.ts`)
- Replace with proper logging via `lib/logger.ts`
- Keep only deliberate debug logging (with comment explaining why it's needed)

**Documentation references:**
- Logger: `lib/logger.ts`

**Verification checklist:**
- Grep for `console.log` in `lib/` and `app/` (excluding logger.ts) returns 0 results
- App behavior unchanged

**Anti-pattern guards:**
- Do NOT use `console.log` for production logging — use structured logger
- Do NOT remove console statements in `node_modules/` or `.next/`

### Task 2.3: Standardize Type Imports

**What to implement:**
- Check `types/database.ts` and `types/state.ts` — ensure all types are properly exported
- Check imports across codebase — some files may use `import type` while others don't
- Standardize on `import type { Foo }` for type-only imports (TypeScript best practice)
- Remove unused imports across all files

**Documentation references:**
- TypeScript type imports: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-exports

**Verification checklist:**
- Run `npm run lint` — no unused imports warnings
- All type imports use `import type` syntax

**Anti-pattern guards:**
- Do NOT use `import { Type }` for type-only — use `import type { Type }`
- Do NOT remove runtime imports (functions, components)

### Task 2.4: Remove Deprecated Next.js Patterns

**What to implement:**
- Check for any Pages Router patterns (`pages/` directory, `getServerSideProps`, `getStaticProps`)
- Check for deprecated Next.js API usage (e.g., `next/router` instead of `next/navigation`)
- Verify all Route Handlers use Web Request/Response APIs (not `NextApiRequest`)
- Remove any `next.config.js` deprecated options

**Documentation references:**
- Next.js 16 migration: Context7 `/vercel/next.js`
- App Router vs Pages Router: Context7 `/vercel/next.js`

**Verification checklist:**
- No `pages/` directory exists
- No imports from `next/router` (should be `next/navigation`)
- `npm run build` succeeds

**Anti-pattern guards:**
- Do NOT use Pages Router patterns in App Router project
- Do NOT use `NextApiRequest`/`NextApiResponse` in Route Handlers

---

## Phase 3: Interface Upgrades

### Task 3.1: Upgrade Widget Loading UX

**What to implement:**
- Current: `WidgetSkeleton` in `dashboard-grid.tsx` uses a simple `<div className="skeleton">` with inline styles
- Upgrade to use `components/ui/skeleton.tsx` (shadcn/ui skeleton component) for consistent styling
- Add loading states to each widget that fetches data (weather, stocks, todos, habits)
- Use TanStack Query `isPending`/`isFetching` states to show/hide skeletons

**Documentation references:**
- Skeleton component: `components/ui/skeleton.tsx`
- TanStack Query loading states: Context7 `/tanstack/query` — `isPending`, `isFetching`

**Verification checklist:**
- All data-fetching widgets show skeleton during loading
- No flash of unstyled content (FOUC)
- Skeleton styles match `components/ui/skeleton.tsx`

**Anti-pattern guards:**
- Do NOT use inline skeleton styles — use the shared component
- Do NOT show loading state for instant local state updates

### Task 3.2: Improve Dashboard Grid Responsiveness

**What to implement:**
- Current grid uses `gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))'` in calculators page
- Dashboard grid (`dashboard-grid.tsx`) should also be responsive
- Add breakpoints: mobile (1 col), tablet (2 cols), desktop (3+ cols)
- Use `useMediaQuery` hook (already exists in `lib/hooks/use-media-query.ts`)
- Update `tailwind.config.ts` if needed for custom breakpoints

**Documentation references:**
- CSS Grid: MDN CSS Grid documentation
- useMediaQuery: `lib/hooks/use-media-query.ts`
- Tailwind responsive: https://tailwindcss.com/docs/responsive-design

**Verification checklist:**
- Dashboard grid shows 1 column on mobile (<640px)
- Dashboard grid shows 2 columns on tablet (640-1024px)
- Dashboard grid shows 3+ columns on desktop (>1024px)
- Drag-and-drop still works on all breakpoints

**Anti-pattern guards:**
- Do NOT use inline styles for responsive — use Tailwind classes or CSS Grid with media queries
- Do NOT break drag-and-drop when making responsive

### Task 3.3: Enhance Error Boundaries

**What to implement:**
- Current: `lib/errors/error-boundary.tsx` exists but may not be used everywhere
- Wrap all widget components in error boundaries (individual boundaries per widget)
- Show user-friendly error message with "Retry" button
- Log error details to `lib/logger.ts` (not to user)
- Add global error boundary in `app/layout.tsx` as fallback

**Documentation references:**
- React error boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- Error boundary component: `lib/errors/error-boundary.tsx`

**Verification checklist:**
- Each widget wrapped in individual error boundary
- Widget error shows "Something went wrong" + retry button (not white screen)
- Errors logged via `lib/logger.ts`
- Global fallback in `app/layout.tsx`

**Anti-pattern guards:**
- Do NOT show stack traces to users
- Do NOT use error boundaries for control flow — only for unexpected errors

### Task 3.4: Upgrade Calculator UI

**What to implement:**
- Current calculators use basic `CalcCard` wrapper
- Add "Copy Result" button to each calculator (copy clinical result to clipboard)
- Add "Share" button (generate shareable URL with pre-filled values)
- Improve mobile layout for calculator forms
- Add print-friendly styles: use `@media print` to hide sidebar and header, show only calculator content, remove backgrounds for ink-savings

**Documentation references:**
- Clipboard API: MDN `navigator.clipboard.writeText()`
- Calculator components: `app/calculators/_components/**/*.tsx`
- CalcCard: `app/calculators/_components/calc-card.tsx`

**Verification checklist:**
- Each calculator has "Copy Result" button that copies formatted text
- "Share" button generates URL with query params for pre-fill
- Calculators usable on mobile (no horizontal scroll)
- Print styles hide sidebar and header

**Anti-pattern guards:**
- Do NOT use third-party clipboard libraries — use native Clipboard API
- Do NOT generate shareable URLs that expose patient data (use encoded form values only)

---

## Phase 4: Functionality Improvements

### Task 4.1: Add Unit Tests for Missing Coverage

**What to implement:**
- Current tests: `tests/store.test.ts`, `tests/calculators.test.ts`, `tests/widgets/*.test.tsx`
- Add tests for all TanStack Query hooks in `lib/queries/`
- Add tests for sync engine (`lib/db/sync.ts`)
- Add tests for error handling utilities (`lib/errors/`)
- Target: 80%+ coverage for `lib/` directory

**Documentation references:**
- Vitest: https://vitest.dev/
- Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Current tests: `tests/` directory

**Verification checklist:**
- `npm run test:coverage` shows 80%+ for `lib/` files
- All query hooks have at least 1 test
- Sync engine has tests for happy path and error cases

**Anti-pattern guards:**
- Do NOT test implementation details — test behavior
- Do NOT mock things that don't need mocking (use `fake-indexeddb` for Dexie tests)

### Task 4.2: Enhance Offline Support

**What to implement:**
- Current: Dexie + sync queue, but no explicit offline indicator
- Add offline/online status indicator (top bar or widget header)
- Queue visual feedback: show "X changes pending sync" in relevant widgets
- Auto-retry sync on reconnect (currently relies on `navigator.onLine` event)
- Add manual "Sync Now" button in dashboard header

**Documentation references:**
- Navigator.onLine: MDN Web API
- Sync engine: `lib/db/sync.ts`
- Dexie: https://dexie.org/

**Verification checklist:**
- Offline indicator shows when network disconnected
- Pending sync count visible to user
- "Sync Now" button triggers `flushSyncQueue()`
- Auto-sync on reconnect works

**Anti-pattern guards:**
- Do NOT poll for online status — use `navigator.onLine` event listener
- Do NOT show sync details that reveal sensitive data (just count, not content)

### Task 4.3: Improve Accessibility (a11y)

**What to implement:**
- Run `npm run test:e2e` with a11y spec (already exists: `tests/e2e/a11y.spec.ts`)
- Add ARIA labels to all interactive elements (buttons, inputs, checkboxes)
- Ensure color contrast meets WCAG AA standard (use `tailwind.config.ts` colors)
- Add keyboard navigation support for custom components (drag-and-drop already has KeyboardSensor)
- Add `aria-live` regions for dynamic content updates (todo additions, habit toggles)

**Documentation references:**
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Axe-core: https://github.com/dequelabs/axe-core
- Current a11y test: `tests/e2e/a11y.spec.ts`

**Verification checklist:**
- `npm run test:e2e -- a11y.spec.ts` passes with 0 violations
- All buttons have `aria-label` or visible text
- Color contrast ratio ≥ 4.5:1 for normal text
- Keyboard navigation works for all interactive elements

**Anti-pattern guards:**
- Do NOT add `aria-label` to elements that already have visible text
- Do NOT skip heading levels (h1 → h2 → h3, not h1 → h3)

### Task 4.4: Add E2E Tests for Critical Paths

**What to implement:**
- Current: `tests/e2e/dashboard.smoke.spec.ts` and `a11y.spec.ts`
- Add E2E test: "Create todo → toggle complete → archive done"
- Add E2E test: "Add habit → mark complete → view streak"
- Add E2E test: "Calculate CHADS-VASc → verify result → copy result"
- Add E2E test: "Go offline → create todo → reconnect → verify sync"

**Documentation references:**
- Playwright: https://playwright.dev/
- Current E2E tests: `tests/e2e/` directory

**Verification checklist:**
- `npm run test:e2e` passes all tests
- New E2E tests cover critical user paths
- Offline E2E test uses Playwright's `context.setOffline(true)`

**Anti-pattern guards:**
- Do NOT use E2E tests for things unit tests can cover
- Do NOT add `waitForTimeout()` — use explicit waits (`waitForSelector`, `waitForResponse`)

---

## Phase 5: Deployment & Verification

### Task 5.1: Pre-Deployment Checks

**What to implement:**
- Run full test suite: `npm test && npm run test:e2e`
- Run build: `npm run build`
- Check environment variables: verify all required vars in Vercel
- Run Lighthouse audit: `npm run lighthouse`
- Check bundle size: analyze with `@next/bundle-analyzer`

**Documentation references:**
- Vercel deployment: https://vercel.com/docs/deployments
- Lighthouse CI: `lighthouse-ci` config in project

**Verification checklist:**
- All tests pass
- Build succeeds locally
- No TypeScript errors
- Lighthouse performance score ≥ 80
- Bundle size within acceptable limits

**Anti-pattern guards:**
- Do NOT deploy with failing tests
- Do NOT skip Lighthouse check before deploy

### Task 5.2: Deploy via gh CLI

**What to implement:**
- Verify gh CLI is authenticated: `gh auth status`
- Commit all changes: `git add -A && git commit -m "..."` (let user approve commit message)
- Push to main: `git push origin main`
- Vercel auto-deploys from main branch (verify Vercel project linked via `vercel list` or Vercel dashboard)
- Only use `vercel deploy --prod` for manual overrides; prefer `git push` for auto-deploy

**Documentation references:**
- gh CLI: https://cli.github.com/
- Vercel CLI: https://vercel.com/docs/cli

**Verification checklist:**
- `gh auth status` shows authenticated
- All changes committed to git
- Push to main succeeds
- Vercel deployment starts (check Vercel dashboard or `vercel list`)

**Anti-pattern guards:**
- Do NOT force push to main
- Do NOT deploy without committing changes
- Do NOT use `vercel deploy --prod` when `git push` auto-deploy works

### Task 5.3: Debug Deployment Issues

**What to implement:**
- Monitor deployment at Vercel dashboard or via `vercel list`
- Check deployment logs: `vercel logs <deployment-url>`
- If white screen: check browser console for errors (common: missing env vars)
- If API errors: check `/api/health` endpoint
- If Supabase errors: verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env
- Follow `RUNBOOK.md` troubleshooting steps

**Documentation references:**
- RUNBOOK: `RUNBOOK.md` in project root
- Vercel debugging: https://vercel.com/docs/error-reporting
- Supabase status: https://status.supabase.com

**Verification checklist:**
- `/dashboard` loads without white screen
- All widgets render correctly
- API proxy (`/api/proxy/*`) returns data
- No 401/403 errors in browser console
- Supabase connection works (todos/habits load)

**Anti-pattern guards:**
- Do NOT ignore deployment errors — debug immediately
- Do NOT push multiple fixes without testing each one

### Task 5.4: Post-Deployment Verification

**What to implement:**
- Run E2E tests against production URL: `PLAYWRIGHT_TEST_BASE_URL=https://<prod-url> npm run test:e2e`
- Manual smoke test: visit all pages (dashboard, calculators, each widget)
- Check real user monitoring (if available): Vercel Analytics, Sentry, etc.
- Document any issues in GitHub Issues or project tracker

**Documentation references:**
- Playwright base URL: https://playwright.dev/docs/test-configuration

**Verification checklist:**
- E2E tests pass on production URL
- Manual smoke test passes (all features work)
- No console errors on production
- Performance acceptable (no slow pages)

**Anti-pattern guards:**
- Do NOT assume deployment worked — verify actively
- Do NOT skip E2E tests on production

---

## Summary

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| Phase 0: Documentation Discovery | Completed | 30 min |
| Phase 1: Debug & Fix Errors | 4 tasks | 2-3 hours |
| Phase 2: Code Cleanup | 4 tasks | 2-3 hours |
| Phase 3: Interface Upgrades | 4 tasks | 3-4 hours |
| Phase 4: Functionality Improvements | 4 tasks | 3-4 hours |
| Phase 5: Deployment & Verification | 4 tasks | 1-2 hours |
| **Total** | **20 tasks** | **11-16 hours** |

### Execution Notes
- Each phase can be executed in a new chat context (subagent-friendly)
- Tasks within a phase should be completed sequentially
- Phase 5 requires gh CLI authentication and Vercel project linked
- User should review and approve the plan before execution begins
