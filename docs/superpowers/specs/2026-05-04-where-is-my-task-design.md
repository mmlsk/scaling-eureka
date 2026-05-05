# Design Spec: "Where is my task" Widget

**Data:** 2026-05-04
**Status:** Zatwierdzony (4/4 sekcje)
**Project:** Scaling Eureka (Life OS v5.0)
**Approach:** Supabase + TanStack Query + Dexie (Opcja A)

---

## 1. Przegląd

Widget "Where is my task" to osobna zakładka w dashboardzie, która wizualizuje zadania na planie mieszkania. Zamiast klasycznej listy, użytkownik widzi pokój jako prostokąty na siatce, a zadania jako piny w pokojach. Każdy pin ma checklistę podzadań z checkboxami.

**MVP funkcjonalne:**
- Dodaj pokój (name, color, x, y, w, h)
- Przesuń/resize pokój (drag & resize)
- Zmień nazwę/kolor pokoju
- Dodaj pin-zadanie na planie
- Przesuń pin
- Dodaj/usuń elementy checklisty
- Oznać podzadania jako wykonane
- Filtruj zadania: Wszystkie / Aktywne / Ukończone
- Zapisz wszystko w Supabase (RLS) + Dexie (offline queue)

---

## 2. Architektura i Model Danych

### 2.1 Integracja ze stosem projektu

```
+-----------------------------------------------------------------+
|                    Next.js 16 App Router                        |
|  +----------------+  +---------------+  +--------------------+  |
|  | /dashboard     |  | /calculators  |  | /where-is-my-task |  |
|  | (DnD grid      |  | (24 forms)    |  | (NEW floor plan)  |  |
|  |  13 widgets)   |  |               |  |  full-page view    |  |
|  +-------+--------+  +-------+-------+  +--------+-----------+  |
|          |                    |                    |                  |
|  +-------v--------------------v-----------+                     |
|  |        Zustand Store (slices)          |                     |
|  |  UI: theme | timer | layout | feelings |                     |
|  +-------+--------------------+-----------+                     |
|          |                    |                                  |
|  +-------v-----------+  +----v-----------------+                |
|  | TanStack Query    |  | Dexie (IndexedDB)    |                |
|  |  (cache dla      |  |  rooms, pins,        |                |
|  |   rooms/pins)    |  |  checklist_items     |                |
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
|   Auth | Postgres (RLS)                                       |
|   Tables: rooms, pins, checklist_items, sync_queue             |
+-----------------------------------------------------------------+
```

### 2.2 Model danych — Supabase (Source of Truth)

#### Tabela: `rooms`
| Kolumna | Typ | Opis |
|---------|-----|------|
| `id` | uuid | PRIMARY KEY |
| `user_id` | uuid | REFERENCES auth.users |
| `name` | text | NOT NULL — nazwa pokoju |
| `x` | real | NOT NULL (0.0-1.0, relative to floor plan) |
| `y` | real | NOT NULL (0.0-1.0) |
| `width` | real | NOT NULL (0.0-1.0) |
| `height` | real | NOT NULL (0.0-1.0) |
| `color` | text | Kolor pokoju (hex) |
| `order` | integer | Kolejność wyświetlania |
| `deleted_at` | timestamptz | Soft delete (NULL = aktywny) |
| `created_at` | timestamptz | DEFAULT now() |
| `updated_at` | timestamptz | DEFAULT now() |

**RLS:** `user_id = auth.uid()`

#### Tabela: `pins`
| Kolumna | Typ | Opis |
|---------|-----|------|
| `id` | uuid | PRIMARY KEY |
| `user_id` | uuid | REFERENCES auth.users |
| `room_id` | uuid | REFERENCES rooms(id) |
| `title` | text | NOT NULL — tytuł zadania |
| `x` | real | NOT NULL (0.0-1.0, relative to room) |
| `y` | real | NOT NULL (0.0-1.0) |
| `status` | text | 'active' | 'done' |
| `deleted_at` | timestamptz | Soft delete |
| `created_at` | timestamptz | DEFAULT now() |
| `updated_at` | timestamptz | DEFAULT now() |

**RLS:** `user_id = auth.uid()`

#### Tabela: `checklist_items`
| Kolumna | Typ | Opis |
|---------|-----|------|
| `id` | uuid | PRIMARY KEY |
| `user_id` | uuid | REFERENCES auth.users |
| `pin_id` | uuid | REFERENCES pins(id) |
| `text` | text | NOT NULL — treść podzadania |
| `completed` | boolean | DEFAULT false |
| `order` | integer | Kolejność |
| `deleted_at` | timestamptz | Soft delete |
| `created_at` | timestamptz | DEFAULT now() |
| `updated_at` | timestamptz | DEFAULT now() |

**RLS:** `user_id = auth.uid()`

#### Tabela: `sync_queue` (istniejąca, rozszerzona)
| Kolumna | Typ | Opis |
|---------|-----|------|
| `id` | uuid | PRIMARY KEY |
| `user_id` | uuid | REFERENCES auth.users |
| `table_name` | text | 'rooms' \| 'pins' \| 'checklist_items' |
| `action` | text | 'create' \| 'update' \| 'delete' |
| `record_id` | uuid | ID rekordu |
| `data` | jsonb | Payload |
| `retry_count` | integer | DEFAULT 0 (max 5) |
| `last_error` | text | Ostatni błąd |
| `created_at` | timestamptz | DEFAULT now() |

### 2.3 Dexie Schema (Offline)

```typescript
// lib/db/floor-plan.ts
export const floorPlanDb = new Dexie('FloorPlanDB') as Dexie & {
  rooms: EntityTable<Room, 'id'>;
  pins: EntityTable<Pin, 'id'>;
  checklistItems: EntityTable<ChecklistItem, 'id'>;
  syncQueue: EntityTable<SyncQueueItem, 'id'>;
};

floorPlanDb.version(1).stores({
  rooms: 'id, user_id, name, x, y, width, height, color, order, deleted_at, created_at, updated_at',
  pins: 'id, user_id, room_id, title, x, y, status, deleted_at, created_at, updated_at',
  checklistItems: 'id, user_id, pin_id, text, completed, order, deleted_at, created_at, updated_at',
  syncQueue: 'id, user_id, table_name, action, record_id, retry_count, last_error, created_at',
});
```

### 2.4 TypeScript Typy

```typescript
// lib/types/floor-plan.ts
export type Room = {
  id: string;
  user_id: string;
  name: string;
  x: number;  // 0.0-1.0
  y: number;
  width: number;
  height: number;
  color: string;
  order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Pin = {
  id: string;
  room_id: string;
  title: string;
  x: number;  // 0.0-1.0 relative to room
  y: number;
  status: 'active' | 'done';
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  items: ChecklistItem[];
};

export type ChecklistItem = {
  id: string;
  pin_id: string;
  text: string;
  completed: boolean;
  order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PartialRoom = Partial<Omit<Room, 'id' | 'user_id'>> & { id: string };
export type PartialPin = Partial<Omit<Pin, 'id' | 'user_id'>> & { id: string };
```

---

## 3. Komponenty i Interakcje

### 3.1 Struktura plików

```
app/where-is-my-task/
  └── page.tsx                 ← Osobna zakładka (full-page)

components/floor-plan/
  ├── FloorPlanShell.tsx       ← Page wrapper + 3-panel layout (NOT WidgetShell)
  ├── FloorPlanGrid.tsx         ← Główny plan (canvas z pokojami)
  ├── RoomRect.tsx             ← Pojedynczy pokój (drag/resize)
  ├── PinMarker.tsx           ← Pin na planie (drag, click)
  ├── TaskSidebar.tsx         ← Lista zadań + filtry
  ├── TaskListItem.tsx        ← Pojedynczy task w sidebarze
  ├── DetailPanel.tsx         ← Panel szczegółów (pin/room)
  ├── ChecklistEditor.tsx      ← Edycja checklisty w pinie
  ├── RoomEditModal.tsx       ← Edycja nazwy/koloru pokoju
  └── AddRoomButton.tsx       ← Przycisk dodawania pokoju

lib/queries/
  ├── use-rooms.ts               ← CRUD rooms (Supabase + Dexie)
  ├── use-pins.ts                ← CRUD pins + checklist items
  └── use-floor-plan-sync.ts    ← Sync engine triggers

lib/db/
  └── floor-plan.ts              ← Dexie schema

lib/types/
  └── floor-plan.ts             ← Room, Pin, ChecklistItem types
```

### 3.2 Integracja: osobna zakładka

Widget ma własną stronę `app/where-is-my-task/page.tsx` (jak calculators), a nie jako widget w dashboard grid — zgodnie z planem "osobna zakładka".

### 3.3 Kluczowe interakcje

**1. Dodawanie pokoju:**
- Klik "Dodaj pokój" → `AddRoomButton`
- Pojawia się prostokąt na planie (domyślny)
- Drag corner → resize (w `RoomRect`)
- Drag body → przesuwanie
- Double-click → `RoomEditModal` (nazwa, kolor)

**2. Dodawanie pina (zadania):**
- Klik w pokój lub plan → `PinMarker` tworzy się
- Wpisz tytuł w `DetailPanel`
- Przeciągnij pin → zmiana pozycji (real 0-1)
- Klik w pin → otwiera `DetailPanel`
- Dodaj checklist items w panelu

**3. Checklista i postęp:**
- `ChecklistEditor` w `DetailPanel`
- Dodaj item → "Wymienić żarówkę"
- Checkbox → toggle `completed`
- Progres widoczny na pinie (np. 3/5)
- Status pinu → 'done' gdy 100%

**4. Filtrowanie i sidebar:**
- `TaskSidebar` → filtry: Wszystkie/Aktywne/Ukończone
- Klik task → centruje widok na pinie
- Pasek postępu: 5/12 (42%)
- Sortowanie: po nazwie, statusie, pokoju

### 3.4 Drag & Resize

**Biblioteka:** `react-rnd` (Zalecane)
- Lekka biblioteka do drag & resize
- Wspiera ograniczenia (bounds na parent)
- Zachowuje pozycję jako {x, y, w, h} w px
- Konwersja px → real (0-1) w hooku przed savem do Supabase

---

## 4. Stan i Sync Engine

### 4.1 Podział odpowiedzialności — State Management

| Warstwa | Co przechowuje | Gdzie |
|---------|-------------------|------|
| **TanStack Query** | Server state (rooms, pins, items) | Cache + Supabase |
| **Zustand** | UI state (selectedRoom, selectedPin, filter) | localStorage (persist) |
| **Dexie** | Offline data + sync_queue | IndexedDB |

**TanStack Query hooks:**
- `useRooms()` — pobiera pokoje
- `usePins(roomId?)` — pobiera piny (opcjonalnie filtrowane po pokoju)
- `usePinWithItems(pinId)` — pin z checklistą
- `useCreateRoom()` — mutacja
- `useUpdatePin()` — mutacja

**Zustand slice: `floorPlanUIStore`**
```typescript
interface FloorPlanUIState {
  selectedRoomId: string | null;
  selectedPinId: string | null;
  filter: 'all' | 'active' | 'done';
  showAddRoomModal: boolean;
  showRoomEditModal: boolean;
  viewportWidth: number; // do konwersji real → px
}
```

### 4.2 Przepływ danych: Zapis zadania (Optimistic UI)

1. **Użytkownik** klika checkbox w `ChecklistEditor`
2. **useUpdateChecklistItem()** → **Optimistic Update**:
   - TanStack Query: `setQueryData()` (natychmiast UI)
   - Dexie: `checklist_items.put()`
   - Dexie: `sync_queue.add({ action:'update', table:'checklist_items' })`
3. **Sync Engine** (background, nasłuchuje sync_queue):
   - Pobiera rekord z `sync_queue` (retry_count < 5)
   - Wysyła do Supabase via API route
   - **SUKCES:** kasuje z sync_queue, invaliduje TanStack Query
   - **BŁĄD:** increment retry_count, last_error, exponential backoff
4. **Po sukcesie:** TanStack Query refetch → świeże dane z serwera
5. **Po reconnect:** Sync Engine flushuje całą kolejkę

### 4.3 Sync Engine — `lib/db/sync-floor-plan.ts`

1. **Trigger:** 'online' event LUB mutacja w Dexie sync_queue
2. **Loop:** pobierz rekordy z sync_queue (retry_count < 5, order by created_at)
3. **API call:** POST `/api/floor-plan/sync` → { table, action, record_id, data }
4. **Sukces:** delete z sync_queue → invalidateQueries(['rooms'], ['pins'])
5. **Błąd:** update sync_queue SET retry_count+1, last_error=msg
6. **Exponential backoff:** 1s → 2s → 4s → 8s → 16s (max 5 prób)
7. **Conflict:** last-write-wins (updated_at timestamp)

---

## 5. Bezpieczeństwo, Błędy i Testy

### 5.1 Bezpieczeństwo — RLS (Row Level Security)

```sql
-- Supabase RLS policies dla rooms
CREATE POLICY "Users can view own rooms"
  ON rooms FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can modify own rooms"
  ON rooms FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- To samo dla pins i checklist_items (z user_id w tabelach)
CREATE POLICY ... ON pins FOR ALL
  USING (user_id = auth.uid());
```

Każda tabela ma `user_id` — filtracja na poziomie bazy. Service role key tylko dla API routes.

### 5.2 Obsługa błędów

| Typ błędu | Obsługa |
|-----------|---------|
| **React Error** | `FloorPlanErrorBoundary` otacza `FloorPlanGrid`, fallback z "Spróbuj ponownie" |
| **API Errors** | `onError` w useQuery, retry 3x, toast notification |
| **Offline** | Detekcja `navigator.onLine`, UI: "Offline — zmiany zostaną zachowane", Dexie queue |
| **Sync Failures** | `retry_count` → max 5, po 5 próbach: "Sync failed" warning, manual retry button |

### 5.3 Strategia testów

**Unit Tests (Jest):**
- Utils: koordynaty px↔real
- Types: type guards
- Store: `floorPlanUIStore`
- Hooks: `useRooms`, `usePins` (mock)
- Pliki: `lib/utils/floor-plan.test.ts`, `store/slices/floor-plan-ui.test.ts`

**Integration (TanStack):**
- Query hooks + Dexie (mocked)
- Sync engine → Supabase (MSW)
- Optimistic updates flow
- Error handling paths
- Pliki: `lib/queries/use-rooms.test.ts`, `lib/db/sync-floor-plan.test.ts`

**E2E (Playwright):**
- Dodaj pokój → pojawia się na planie
- Drag & resize pokoju
- Dodaj pin → checklista działa
- Filtrowanie w sidebarze
- Plik: `e2e/where-is-my-task.spec.ts`

### 5.4 Accessibility (a11y)

- **Keyboard navigation:** Tab przez pokoje/piny, Enter/Space to select
- **Aria labels:** RoomRect = "Pokój: Salon, pozycja X,Y", PinMarker = "Zadanie: Wymienić żarówki"
- **Focus visible:** outline na aktywnym pokoju/pinie
- **Screen reader:** status pinu ("3 z 5 zadań ukończonych")
- **Color contrast:** statusy (active=#f59e0b, done=#22c55e) mają >4.5:1
- **Checklist:** checkboksy z labelami, nie tylko puste inputy

---

## 6. Podsumowanie MVP

- [x] Dodaj pokój (name, color, x, y, w, h) → Supabase + Dexie
- [x] Przesuń/resize pokój (react-rnd) → relatywne koordynaty (0-1)
- [x] Zmień nazwę/kolor pokoju (modal) → optimistic update
- [x] Dodaj pin-zadanie na planie → tytuł + checklista
- [x] Przesuń pin → update x,y w pokoju
- [x] Dodaj/usuń elementy checklisty → realtime update
- [x] Oznacz podzadania jako wykonane → status pinu = 'done' gdy 100%
- [x] Filtruj zadania: Wszystkie / Aktywne / Ukończone
- [x] Zapisuj wszystko w Supabase (RLS) + Dexie (offline queue)
- [x] Sync engine → background sync po reconnect
