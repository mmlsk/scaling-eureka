# Scaling Eureka — Architecture Overview

**Project:** Life OS v5.0
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Supabase · Dexie · Zustand · TanStack Query
**Purpose:** Personal medical/productivity dashboard with 13 interactive widgets, 22 medical calculators, and AI-powered note search.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Next.js 16 App Router                       │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐   │
│  │ /dashboard   │  │ /calculators  │  │ /api/proxy/*     │   │
│  │ (13 widgets) │  │ (22 calculators)│  │ (data proxy)     │   │
│  └──────┬───────┘  └───────┬───────┘  └────────┬─────────┘   │
│         │                    │                    │             │
│  ┌──────▼──────────────────▼────────────────────▼─────────┐   │
│  │              Zustand Store (UI State)                  │   │
│  │  theme · timer · sleep · feelings · layout           │   │
│  └──────┬──────────────────────────────────────────────┘   │
│         │                                                     │
│  ┌──────▼──────────────┐  ┌──────────────────────────┐    │
│  │  TanStack Query     │  │  Dexie (IndexedDB)       │    │
│  │  (server state)     │  │  offline queue + notes    │    │
│  └──────┬──────────────┘  └───────────┬──────────────┘    │
│         │                              │                     │
└─────────│──────────────────────────────│─────────────────────┘
          │                              │
          │  ┌──────────────────────────▼──────────────┐
          │  │         Sync Engine (push/pull)          │
          │  │    habits · todos · sleep · nootropics   │
          │  └──────────────────┬──────────────────────┘
          │                     │
┌─────────▼─────────────────────▼─────────────────────────────┐
│                       Supabase                              │
│   Auth (RLS) · Postgres · pgvector (embeddings)           │
│   Realtime subscriptions · Storage                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
scaling-eureka/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── health/route.ts      # Health check endpoint
│   │   └── proxy/[provider]/   # Multi-provider data proxy
│   ├── calculators/             # 22 medical calculators (22 forms)
│   │   └── _components/       # Per-calculator components by category
│   │       ├── cardio/         # CHADS₂, QTc, MAP, Wells PE/DVT, PERC
│   │       ├── neuro/          # GCS, NIHSS, ABCD²
│   │       ├── pulm/           # CURB-65, NEWS2
│   │       ├── oiom/           # SOFA, qSOFA, Henderson-Hasselbalch, AG, Ca, Dose
│   │       ├── ped/            # APGAR, Centor
│   │       └── inne/           # eGFR, Cockcroft-Gault, BMI, Child-Pugh, MELD-Na
│   ├── dashboard/              # Main dashboard with DnD grid
│   │   └── _components/       # 13 widget components
│   ├── layout.tsx             # Root layout (fonts, providers)
│   └── page.tsx               # Root page → redirects to /dashboard
│
├── components/                  # Shared UI components
│   ├── layout/                # Header, Sidebar, WidgetControls
│   ├── ui/                    # shadcn/ui-based primitives (23 components)
│   ├── providers/              # ThemeProvider, QueryProvider
│   └── widget-parts/          # Reusable widget sub-components
│
├── store/                      # Zustand state management
│   ├── useLifeOsStore.ts      # Main store (theme, timer, sleep, feelings)
│   ├── useDashboardLayout.ts  # Dashboard layout persistence
│   └── slices/                # Zustand slices (legacy)
│
├── lib/                        # Core business logic
│   ├── ai/                    # AI features (embeddings, assistant)
│   ├── calculators/            # Pure TS formulas + clinical references
│   ├── db/                    # Dexie schema, sync engine, operations
│   │   ├── schemas/           # Dashboard layout schema
│   │   └── sync.ts           # Bidirectional sync with Supabase
│   ├── env.ts                 # Zod-validated environment variables
│   ├── errors/                # Error classes, boundaries, retry logic
│   ├── hooks/                 # Custom React hooks
│   ├── providers/             # External data fetchers (weather, stocks, finance)
│   ├── queries/               # TanStack Query hooks (10 query files)
│   ├── supabase/              # Supabase client/server/middleware
│   ├── utils/                 # Date, format, sanitize utilities
│   └── validation/            # Zod schemas, type guards
│
├── types/                      # TypeScript type definitions
│   ├── database.ts            # Supabase table types + DashboardData
│   └── state.ts              # UI state types (local storage shapes)
│
├── tests/                      # Test suite
│   ├── calculators.test.ts     # Calculator formula tests
│   ├── e2e/                  # Playwright E2E tests
│   ├── layout/                # Widget controls tests
│   ├── store/                 # Zustand store tests
│   ├── widgets/               # Widget component tests
│   └── supabase-rls.test.ts # RLS policy tests
│
├── public/                     # Static assets
│   └── sw.js                 # Service worker (same-origin only)
└── docs/                      # Additional documentation
```

---

## Layer-by-Layer Breakdown

### 1. UI Layer (`app/`, `components/`)

**Framework:** Next.js 16 App Router with React 19 Server/Client Components.

- **Root layout** (`app/layout.tsx`): Wraps the app in `QueryProvider` and `ThemeProvider`. Loads Inter and IBM Plex Mono fonts. Sets viewport meta and PWA metadata.

- **Dashboard** (`app/dashboard/page.tsx`): Client-only page rendering a flex layout with `Header`, `Sidebar`, `WidgetControls`, and `DashboardGrid`.

- **Dashboard Grid** (`app/dashboard/_components/dashboard-grid.tsx`): The core of the dashboard experience. Uses `@dnd-kit` for drag-and-drop reordering. All 13 widgets are **lazily loaded** via `React.lazy()` + `Suspense`. The grid is a CSS Grid with `SortableContext`. Widget visibility and order are managed by `useDashboardLayout` store.

- **Widgets** (13 total): Each widget is a client component with lazy loading:
  - `clock-widget` — Current time
  - `sleep-widget` — Sleep tracking
  - `habits-widget` — Habit tracking
  - `nootropics-widget` — Nootropic supplement stack
  - `todo-widget` — Todo list
  - `calendar-widget` — Calendar events
  - `timer-widget` — Pomodoro/Deep Work/Ultra timer
  - `weather-widget` — Weather + forecast
  - `stocks-widget` — Stock ticker
  - `notepad-widget` — Markdown notepad
  - `analytics-widget` — Data analytics
  - `finance-widgets` — Financial data
  - `air-quality` / `fred` / `eia` — Environmental/economic data

- **Calculators** (`app/calculators/`): 22 medical calculators organized into 6 tabs (Cardio, Neuro, Pulm, OIOM, Ped, Inne). Each calculator is a dynamically imported client component. Metadata (version, formula) comes from `lib/calculators/versions.ts`.

- **UI Primitives** (`components/ui/`): 23 shadcn/ui-style components built with `@base-ui/react`, `class-variance-authority`, and `tailwind-merge`. Includes `widget-shell.tsx` as a consistent widget wrapper.

### 2. State Management

**Two-tier state architecture:**

#### Zustand — UI State (`store/`)

`useLifeOsStore.ts` is the main Zustand store (v5 API) with `persist` middleware storing to `localStorage`. It combines 4 slices:

| Slice | Purpose | Persistence |
|-------|---------|--------------|
| `PaletteSlice` | Theme palette selection (6 palettes) | ✅ localStorage |
| `SleepUISlice` | Sleep time input, sleep log | ✅ localStorage |
| `FeelingsSlice` | Mood/mood tracking (10 options) | ✅ localStorage |
| `TimerUISlice` | Pomodoro timer (3 presets: 25/50/90 min) | ✅ localStorage (running=false) |

`useDashboardLayout.ts` is a separate Zustand store managing widget registry (visible widgets, order) with persistence to both `localStorage` and Dexie (`dashboardLayout` table).

#### TanStack Query — Server State (`lib/queries/`)

Five query hooks manage data fetching from Supabase with caching:

| Hook | Query Key | Purpose |
|------|-----------|---------|
| `useTodos()` | `['todos']` | Active todos (archived=false) |
| `useArchivedTodos()` | `['todos', 'archived']` | Archived todos |
| `useHabits()` | `['habits']` | Habits with entries |
| `useNootropics()` | `['nootropics']` | Nootropic stack |
| `useSleep()` | `['sleep']` | Sleep entries |
| `useCalendar()` | `['calendar']` | Calendar events |
| `useWeather()` | `['weather']` | Weather data |
| `useStocks()` | `['stocks']` | Stock prices |
| `useAirQuality()` | `['air-quality']` | Air quality data |
| `useFRED()` | `['fred']` | Federal Reserve economic data |

Each hook validates API responses using type guards from `lib/validation/type-guards.ts`.

### 3. Local Database — Dexie/IndexedDB (`lib/db/`)

**`LifeOSDB`** extends Dexie with 12 tables, each annotated with sensitivity level and retention policy:

| Table | Sensitivity | Content |
|-------|-------------|---------|
| `habits` | Medium | Habit definitions |
| `habitEntries` | Medium | Completion history |
| `todos` | Low | Generic task text |
| `nootropicStack` | High | Supplement regimen |
| `nootropicLog` | High | Intake logs |
| `sleepLog` | High | Sleep patterns (medical data) |
| `calendarEvents` | Medium | Personal appointments |
| `notes` | Medium | Freeform text |
| `moodEntries` | High | Mood/feelings (medical) |
| `timerSessions` | Low | Timer session metadata |
| `eventStore` | Medium | Generic event payloads |
| `syncQueue` | Low | Pending sync operations (transient) |
| `dashboardLayout` | Medium | Widget visibility/order |

**Security note:** All IndexedDB data is plaintext. The project documents this in `lib/db/SECURITY-NOTES.md`. Sensitive tables (sleep, mood, nootropics) are cleared on logout via `clearAllTables()`.

### 4. Sync Engine (`lib/db/sync.ts`)

Bidirectional synchronization between Dexie (local) and Supabase (remote):

**Push (local → remote):**
- `addToSyncQueue()` — queues insert/update/delete operations
- `flushSyncQueue()` — processes queue in FIFO order, marks synced on success
- Failed entries remain in queue for retry

**Pull (remote → local):**
- `subscribeToTable()` — Supabase Realtime subscription for INSERT/UPDATE/DELETE
- `onRealtimeChange()` — applies remote changes to local Dexie tables

**Conflict resolution:** Last-write-wins (timestamp-based).

**Offline support:** Queue persists in IndexedDB. Reconnect triggers `navigator.onLine` event.

**Table mapping:** CamelCase local tables map to `snake_case` remote tables:
```
habits → habits
habitEntries → habit_entries
todos → todos
nootropicStack → nootropics
nootropicLog → nootropic_log
sleepLog → sleep_entries
calendarEvents → calendar_events
notes → notes
moodEntries → mood_entries
timerSessions → timer_sessions
eventStore → event_store
```

### 5. Remote Database — Supabase

**Client-side** (`lib/supabase/client.ts`): `createBrowserClient` from `@supabase/ssr` for use in Client Components.

**Server-side** (`lib/supabase/server.ts`): `createServerClient` with Next.js `cookies()` API for Server Components, Route Handlers, and Server Actions. Handles token refresh via cookie get/set.

**Middleware** (`lib/supabase/middleware.ts`): Refreshes auth session on every request. Uses `getUser()` (safe) rather than `getSession()` (unsafe). Matcher excludes static assets.

**Security:**
- All user-data tables use **Row Level Security (RLS)** filtering by `auth.uid()`
- Service role key is **never** exposed to client code (only in `app/api/*` and server components)
- Environment variables validated with Zod schema in `lib/env.ts`

### 6. API Routes (`app/api/`)

#### `/api/health/route.ts`
Simple health check endpoint returning `{ status: 'ok' }`.

#### `/api/proxy/[provider]/route.ts`
Generic data proxy with:
- **In-memory cache** (60s) via `next/cache` `unstable_cache`
- **Host whitelist** — only allows predefined hosts (Yahoo Finance, FRED, EIA, Finnhub, Polygon, Alpha Vantage, OpenUV, OpenAQ, Google)
- **API key injection** — automatically adds API keys from environment variables as query params or headers based on provider configuration
- **Supported providers:** `yahoo` (no auth), `polygon`, `finnhub`, `alphavantage`, `fred`, `eia`, `openaq`, `openuv`, `googlecal`

### 7. AI Features (`lib/ai/`)

#### Embeddings (`embeddings.ts`)
- Uses OpenAI's `text-embedding-ada-002` model
- `generateEmbedding()` — creates vector embeddings (truncated to 8000 chars)
- `searchSimilar()` — cosine similarity search via Supabase pgvector (`match_embeddings` RPC or manual fallback)
- `upsertEmbedding()` — stores/updates embeddings in `note_embeddings` table

#### Assistant (`assistant.ts`)
Contextual AI assistant (implementation details in `lib/ai/assistant.ts`).

### 8. Medical Calculators (`lib/calculators/`)

Pure TypeScript formula functions with clinical references:

- **`formulas.ts`** — 22 calculator functions (each in a dedicated widget component)
- **`references.ts`** — Clinical reference ranges and validation rules
- **`versions.ts`** — Version metadata for each calculator

Calculators are organized by medical specialty:
- **Cardio** (5): CHADS₂-VASc, QTc (Bazett/Fridericia), MAP, Wells PE/DVT, PERC
- **Neuro** (3): GCS, NIHSS, ABCD²
- **Pulm** (2): CURB-65, NEWS2
- **OIOM** (6): SOFA, qSOFA, Henderson-Hasselbalch, Anion Gap, Corrected Calcium, Dose
- **Ped** (2): APGAR, Centor/McIsaac
- **Inne** (4): eGFR (CKD-EPI 2021), Cockcroft-Gault, BMI/BSA, Child-Pugh, MELD-Na

### 9. External Data Providers (`lib/providers/`)

- **`weather.ts`** — Open-Meteo API (free, no key needed)
- **`stocks.ts`** — Yahoo Finance (via proxy)
- **`finance.ts`** — Additional financial data sources

### 10. Error Handling (`lib/errors/`)

Comprehensive error management system:
- **`custom-errors.ts`** — Domain-specific error classes
- **`error-boundary.tsx`** — React error boundary component
- **`error-hooks.ts`** — Error reporting hooks
- **`retry-logic.ts`** — Exponential backoff retry for failed operations
- **`error-recovery.ts`** — Recovery strategies

### 11. Validation (`lib/validation/`)

Three-layer validation:
- **`api-schemas.ts`** — Zod schemas for API request/response validation
- **`database-schemas.ts`** — Zod schemas for database records
- **`type-guards.ts`** — Runtime type guards (e.g., `isTodoData()`, `isString()`, `isBoolean()`)
- **`index.ts`** — Barrel export

### 12. Environment Configuration (`lib/env.ts`)

Zod-validated environment variables with fail-fast behavior:

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `NEXT_PUBLIC_OPENAQ_KEY` | No | OpenAQ API key |
| `NEXT_PUBLIC_OPENUV_KEY` | No | OpenUV API key |
| `POLYGON_KEY` | No | Polygon.io API key |
| `FINNHUB_NEWS_KEY` | No | Finnhub API key |
| `ALPHA_VANTAGE_KEY` | No | Alpha Vantage API key |
| `FRED_API_KEY` | No | FRED API key |
| `EIA_API_KEY` | No | EIA API key |
| `GOOGLE_CAL_API_KEY` | No | Google Calendar API key |
| `OPENAI_API_KEY` | No | OpenAI API key (for embeddings) |

---

## Data Flow Examples

### Saving a Habit Completion

1. User clicks checkbox in `habits-widget`
2. Widget calls TanStack Query `useToggleHabit()` mutation
3. Mutation sends `UPDATE` to Supabase via `supabase.from('habits...')`
4. On success, TanStack Query invalidates `['habits']` query key
5. Fresh data flows from Supabase → TanStack cache → Component re-render
6. Simultaneously, `subscribeToTable('habit_entries')` receives Realtime event
7. Realtime handler applies change to local Dexie `habitEntries` table

### Offline Todo Creation

1. User adds todo in `todo-widget`
2. `useAddTodo()` mutation attempts Supabase insert → **fails (offline)**
3. Mutation falls back to `addToSyncQueue('todos', 'insert', id, data)`
4. Todo is stored in Dexie `todos` table for local visibility
5. `syncQueue` entry persists in IndexedDB
6. On reconnect: `navigator.onLine` triggers `flushSyncQueue()`
7. Queued operation is sent to Supabase, marked as `synced=true`

### Calculator Usage

1. User navigates to `/calculators`
2. Tab bar shows 6 categories (Cardio, Neuro, Pulm, OIOM, Ped, Inne)
3. Each tab filters the 22 calculators
4. Calculator components are dynamically imported (`next/dynamic`)
5. User inputs values → formula function called from `lib/calculators/formulas.ts`
6. Result displayed with clinical reference from `lib/calculators/references.ts`
7. Version metadata shown from `lib/calculators/versions.ts`

---

## Authentication & Security

### Auth Flow
1. Supabase Auth handles signup/signin (JWT-based)
2. Middleware (`lib/supabase/middleware.ts`) refreshes session on each request
3. Cookies are HTTP-only, managed by `@supabase/ssr` cookie handlers
4. `getUser()` is used in middleware (safe), not `getSession()` (unsafe)

### Row Level Security (RLS)
All user-data tables enforce RLS:
```sql
CREATE POLICY "Users can only access their own data"
  ON <table> FOR ALL
  USING (auth.uid() = user_id);
```

### Service Role Key Protection
- Never bundled to client: only exists in server-side environments
- Used only in `app/api/*` route handlers and server components
- Validated at startup by `lib/env.ts` Zod schema

### Content Security
- Service Worker (`public/sw.js`): same-origin requests only, no third-party
- IndexedDB: plaintext storage (documented; sensitive tables cleared on logout)
- API Proxy: host whitelist prevents SSRF attacks

---

## Testing Strategy

### Unit Tests (Vitest + @testing-library/react)
- **Calculator formulas** (`tests/calculators.test.ts`): All 22 calculator functions
- **Store logic** (`tests/store.test.ts`, `tests/store/`): Zustand store behavior
- **Widget components** (`tests/widgets/`): Individual widget rendering and interaction
- **Layout** (`tests/layout/`): Widget controls, dashboard layout persistence

### E2E Tests (Playwright)
- **Smoke test** (`tests/e2e/dashboard.smoke.spec.ts`): Dashboard loads correctly
- **Accessibility** (`tests/e2e/a11y.spec.ts`): Axe-core accessibility audit

### Integration Tests
- **Supabase RLS** (`tests/supabase-rls.test.ts`): Row Level Security policy verification

### Coverage
- `npm test` — Run tests
- `npm run test:coverage` — Coverage report
- `npm run test:watch` — Watch mode

---

## Build & Deploy

### Development
```bash
npm run dev          # Next.js dev server with Turbopack
```

### Production
```bash
npm run build        # Next.js production build
npm start            # Start production server
```

### Code Quality
```bash
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
npm run format:check # Prettier check
```

### E2E & Performance
```bash
npm run test:e2e     # Playwright E2E tests
npm run lighthouse   # Lighthouse CI audit
```

### Git Hooks (Husky)
- Pre-commit: lint and format checks via Husky

---

## Key Design Decisions

1. **Offline-first with Dexie**: The app prioritizes offline capability. All domain data (todos, habits, sleep, etc.) is available offline via IndexedDB, with background sync to Supabase.

2. **Two-tier state**: Zustand for UI state (theme, timer, layout) and TanStack Query for server state (domain data). This separation avoids the anti-pattern of using Zustand as a server state cache.

3. **Lazy-loaded widgets**: All 13 dashboard widgets use `React.lazy()` + `Suspense` for code splitting. The dashboard grid renders skeleton loaders while widgets load.

4. **Drag-and-drop dashboard**: Built with `@dnd-kit` (modern successor to react-beautiful-dnd). Supports mouse, touch, and keyboard sensors. Widget order persists to both localStorage and Dexie.

5. **API proxy pattern**: Instead of exposing API keys to the client, the `/api/proxy/[provider]` route handler injects keys server-side. Supports multiple providers with different auth methods (query param vs header).

6. **Medical calculator architecture**: Each calculator is a standalone client component with its own formula function in `lib/calculators/formulas.ts`. Version tracking via `versions.ts` enables auditing.

7. **AI embeddings**: OpenAI embeddings + pgvector enable semantic search across notes, todos, habits, and mood entries. Falls back to manual cosine similarity if the `match_embeddings` RPC is not configured.

8. **Security-first Supabase usage**: RLS on all tables, service role key never on client, `getUser()` in middleware (not `getSession()`), Zod-validated environment variables with fail-fast.

---

## Technologies at a Glance

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 16.2.4 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS 4 + shadcn/ui | 4 + 4.5.0 |
| State (UI) | Zustand | 5.0.12 |
| State (Server) | TanStack Query | 5.99.0 |
| Local DB | Dexie (IndexedDB) | 4.4.2 |
| Remote DB | Supabase (Postgres + RLS) | 2.103.2 |
| DnD | @dnd-kit | 6.3.1 |
| Validation | Zod | 4.3.6 |
| AI | OpenAI embeddings + pgvector | — |
| Testing (unit) | Vitest + @testing-library | 4.1.4 |
| Testing (e2e) | Playwright + Axe-core | 1.59.1 |
| Fonts | Inter + IBM Plex Mono | — |
| Build | Next.js (Turbopack) | — |
| Git Hooks | Husky | 9.1.7 |
| Linting | ESLint + Prettier | 9 + 3.8.3 |
