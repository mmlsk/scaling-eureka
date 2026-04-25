# RUNBOOK — Scaling Eureka (Life OS v5.0)

Procedury operacyjne dla typowych incydentow.

## Bialy ekran po deployu

**Symptom:** `/dashboard` laduje sie, ale renderuje pusty kontener.

1. Otworz DevTools -> Console
2. Sprawdz bledy hydration: `Hydration failed because the server rendered HTML didn't match the client`
3. Najczesciej: brak env vars w Vercel
   - `vercel env ls`
   - Dodaj brakujace przez `vercel env add`
   - Re-deploy: `vercel --prod`
4. Jesli blad Service Workera: hard reload (Ctrl+Shift+R) lub `Application -> Service Workers -> Unregister`

## Wygasl klucz API (provider X)

**Symptom:** widget pokazuje blad 401/403 lub timeout.

1. Zidentyfikuj ktory provider (Console -> Network -> szukaj 401)
2. Zaloguj sie do dashboardu providera
3. Wygeneruj nowy klucz
4. Zaktualizuj GitHub Secret:
   ```bash
   gh secret set NEXT_PUBLIC_<PROVIDER>_KEY --body "NEW_KEY"
   ```
5. Trigger redeploy: `gh workflow run static.yml` lub push do main
6. Po 5 min — sprawdz `/api/health`

## Supabase down

**Symptom:** `/api/health` zwraca `{ supabase: false }`.

1. Sprawdz [status.supabase.com](https://status.supabase.com)
2. Jesli incident — czekaj na resolution
3. Tymczasowo: aplikacja dziala offline-first przez Dexie (IndexedDB). Zapisy buforuja sie w `sync_queue` i synchronizuja po przywroceniu.
4. Po przywroceniu: sprawdz `lib/db/sync.ts` logs — czy queue sie oproznia

## Manual backup bazy

```bash
# 1. Zaloguj sie do supabase CLI
npx supabase login

# 2. Link do projektu
npx supabase link --project-ref <PROJECT_REF>

# 3. Dump
npx supabase db dump -f backup-$(date +%Y%m%d).sql

# 4. Tylko dane
npx supabase db dump --data-only -f data-$(date +%Y%m%d).sql
```

Zalecenie: cron weekly via GitHub Actions (TODO Sprint 4).

## Incident: leak klucza API

Patrz: [`.github/SECURITY.md`](.github/SECURITY.md) sekcja "Incident response".

## Manual rollback

```bash
git log --oneline -10              # znajdz commit do ktorego wracamy
git revert <BAD_COMMIT_SHA>        # bezpieczniej niz reset
git push origin main               # Vercel auto-deployuje
```

LUB w Vercel Dashboard -> Deployments -> wybierz poprzedni -> "Promote to Production".
