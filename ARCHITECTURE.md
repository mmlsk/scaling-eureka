# Architecture — Scaling Eureka (Life OS v5.0)

## Stack overview

```
+-----------------------------------------------------------------+
|                    Next.js 16 App Router                        |
|  +----------------+  +---------------+  +--------------------+  |
|  | /dashboard     |  | /calculators  |  | /api/health        |  |
|  | (DnD grid      |  | (24 forms)    |  | (server)           |  |
|  |  13 widgets)   |  |               |  |                    |  |
|  +-------+--------+  +-------+-------+  +--------------------+  |
|          |                    |                                  |
|  +-------v--------------------v-----------+                     |
|  |        Zustand Store (slices)          |                     |
|  |  UI: theme | timer | layout | feelings |                     |
|  |  (offline fallback: todos/habits/etc.) |                     |
|  +-------+--------------------+-----------+                     |
|          |                    |                                  |
|  +-------v-----------+  +----v-----------------+                |
|  | TanStack Query    |  | Dexie (IndexedDB)    |                |
|  |  (source of truth |  |  offline queue        |                |
|  |   for domain data)|  |  + notepad             |                |
|  +-------+-----------+  +----+-----------------+                |
|          |                    |                                  |
+----------+--------------------+---------------------------------+
           |                    |
           | +------------------v--------------+
           | |      Sync Engine                |
           | |  (push/pull queue -> Supabase)  |
           | +-----------------+---------------+
           |                   |
+----------v-------------------v----------------------------------+
|                       Supabase                                  |
|   Auth | Postgres (RLS) | pgvector (embeddings)                 |
+-----------------------------------------------------------------+
           |
+----------v------------------------------------------------------+
|            Cloudflare Worker (proxy)                             |
|  Rate limit (KV) -> Polygon, Finnhub, Alpha Vantage, etc.      |
+-----------------------------------------------------------------+
```

## Source of truth

| Domena | Source of truth | Cache | Offline |
|--------|----------------|-------|---------|
| Theme, timer, layout, UI flags | **Zustand** (z persist) | — | localStorage |
| Todos, habits, nootropics, sleep_log | **Supabase** (przez TanStack Query) | TanStack cache | Background sync z Dexie queue |
| Notepad markdown | **Dexie** (offline-first) | — | Push do Supabase async |

TanStack Query hooki: `lib/queries/use-todos.ts`, `use-habits.ts`, `use-nootropics.ts`, `use-sleep.ts`.
Zustand slices (`store/slices/`) pozostaja jako offline fallback, ale **nie sa** kanoniczne dla domain data.

## Module boundaries

| Layer | Path | Odpowiedzialnosc |
|-------|------|------------------|
| UI | `app/`, `components/` | Server + Client components, prezentacja |
| State | `store/` | Zustand slices, persist middleware |
| Cache | TanStack Query (in components) | Cachowanie stanu serwera |
| Local DB | `lib/db/` | Tabele Dexie, sync queue |
| Remote DB | `lib/supabase/` | Klienty client/server/middleware |
| Domain | `lib/calculators/` | Czyste formuly TS + referencje kliniczne |
| Providers | `lib/providers/` | Multi-provider data fetch (weather/stocks) |
| AI | `lib/ai/` | Embeddingi, kontekstowy asystent |
| Utils | `lib/utils/` | Date, format, sanitize |
| Env | `lib/env.ts` | Walidacja Zod zmiennych srodowiskowych |
| Logger | `lib/logger.ts` | Strukturalny JSON logger |

## Data flow: zapis nawyku

1. Uzytkownik klika checkbox -> komponent dispatches Zustand action
2. Zustand aktualizuje state -> triggers persist middleware -> IndexedDB (Dexie)
3. Sync engine kolejkuje mutacje -> background flush do Supabase
4. Po sukcesie: TanStack Query invaliduje -> swiezy stan serwera
5. Po bledzie: queue zachowuje, retry z exponential backoff

## Sync engine (`lib/db/sync.ts`)

- **Kierunek:** bidirectional
- **Conflict resolution:** last-write-wins (timestamp-based)
- **Offline:** queue persystuje w IndexedDB
- **Reconnect:** triggerowany przez `navigator.onLine` event
- **Tabele:** habits, habitEntries, todos, nootropicStack, nootropicLog, sleepLog, calendarEvents, notes, moodEntries, timerSessions, eventStore

## Security boundaries

- Service role key: NIGDY w kodzie klienta (tylko `app/api/*`, server components)
- RLS: wszystkie tabele user-data filtruja po `auth.uid()`
- Service worker: same-origin only, brak third-party requests
- IndexedDB: plaintext — patrz `lib/db/SECURITY-NOTES.md` dla klasyfikacji wrazliwosci
- Env validation: Zod schema w `lib/env.ts` — fail-fast przy brakujacych wymaganych zmiennych
