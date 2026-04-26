# Polityka bezpieczenstwa — Scaling Eureka (Life OS v5.0)

## Inwentarz kluczy API

| Provider | Env Var | Zakres | Rotacja |
|----------|---------|--------|---------|
| Supabase | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY | Auth + DB (RLS) | Co 90 dni |
| Polygon | POLYGON_KEY | Stocks REST | Co 180 dni |
| Alpha Vantage | ALPHA_VANTAGE_KEY | Fallback stocks | Co 180 dni |
| Finnhub | FINNHUB_NEWS_KEY | Stocks news | Co 180 dni |
| OpenAQ | NEXT_PUBLIC_OPENAQ_KEY | Air quality (header auth) | Co 180 dni |
| OpenUV | NEXT_PUBLIC_OPENUV_KEY | UV index (header auth) | Co 180 dni |
| FRED | FRED_API_KEY | Macro econ | Co 180 dni |
| EIA | EIA_API_KEY | Energy data | Co 180 dni |
| Google Calendar | GOOGLE_CAL_API_KEY | Calendar events | Co 180 dni |

## Procedura rotacji klucza

1. Zaloguj sie do dashboardu providera
2. Wygeneruj nowy klucz, ustaw wygaszenie starego za 24h
3. Zaktualizuj GitHub Secrets:
   ```
   gh secret set POLYGON_KEY --body "NEW_KEY_HERE"
   ```
4. Trigger redeploy: push do main lub `gh workflow run static.yml`
5. Po 24h: usun stary klucz w dashboardzie providera

## Incident response

Jesli klucz wycieknie:
- [ ] Natychmiast revoke w dashboardzie providera
- [ ] Wygeneruj nowy
- [ ] `gh secret set` z nowym
- [ ] Force-push purge z git history (`git filter-repo --path .env.local --invert-paths`)
- [ ] Audyt logow dostepu (Supabase: Auth -> Audit Log)

## Reporting

Email: domagalski.mat@gmail.com (issues w prywatnym repo lub `Security` tab w GitHubie).
