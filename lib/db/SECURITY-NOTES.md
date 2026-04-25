# Notatki bezpieczenstwa — Dexie (IndexedDB)

## Podsumowanie

Wszystkie tabele IndexedDB sa przechowywane jako plaintext w przegladarce.
Brak encryption-at-rest — dane sa dostepne dla kazdego procesu z dostepem do
profilu przegladarki.

## Klasyfikacja tabel

| Tabela | Sensitivity | Uzasadnienie |
|--------|-------------|--------------|
| `habits` | MEDIUM | Nazwy nawykov ujawniaja osobiste cele/rutyny |
| `habitEntries` | MEDIUM | Historia wypelniania ujawnia wzorce behawioralne |
| `todos` | LOW | Ogolny tekst zadan |
| `nootropicStack` | HIGH | Stack suplementow ujawnia rezymy zdrowotne |
| `nootropicLog` | HIGH | Logi przyjmowania ujawniaja wzorce uzywania substancji |
| `sleepLog` | HIGH | Osobiste dane medyczne (wzorce snu, jakosc) |
| `calendarEvents` | MEDIUM | Zdarzenia kalendarza moga zawierac osobiste spotkania |
| `notes` | MEDIUM | Dowolny tekst moze zawierac wrazliwe informacje |
| `moodEntries` | HIGH | Dane nastroju/uczuc — osobiste informacje medyczne |
| `timerSessions` | LOW | Metadane sesji timera (czasy trwania) |
| `eventStore` | MEDIUM | Ogolne payloady zdarzen, zawartosc rozna |
| `syncQueue` | LOW | Metadane synchronizacji (nazwy tabel, operacje) |

## Retention policy

- Dane uzytkownika: usuwane przy wylogowaniu via `clearAllTables()`
- `syncQueue`: wpisy transient — usuwane po udanej synchronizacji z Supabase
- Brak automatycznego TTL — dane pozostaja do momentu jawnego wyczyszczenia

## Rekomendacje

1. **Encryption-at-rest**: Rozwazyc wrapper szyfrujacy (np. `dexie-encrypted`) dla tabel HIGH sensitivity
2. **Auto-purge**: Dodac TTL dla starych wpisow (np. `sleepLog` > 90 dni)
3. **Logout cleanup**: Upewnic sie ze `clearAllTables()` jest wywolywane przy kazdym wylogowaniu
4. **Shared devices**: Ostrzezenie uzytkownika o ryzyku na wspoldzielonych urzadzeniach
