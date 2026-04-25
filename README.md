# LIFE OS Dashboard

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=mmlsk/scaling-eureka)

Personal medical/productivity dashboard — aplikacja do sledzenia zdrowia, kalkulatorow klinicznych, nawykov, danych finansowych i planowania dnia.

## Dokumentacja

- [RUNBOOK.md](./RUNBOOK.md) — procedury operacyjne
- [SECURITY.md](./.github/SECURITY.md) — polityka bezpieczenstwa
- [ARCHITECTURE.md](./ARCHITECTURE.md) — diagram architektury

## Features

### Medical Calculators (22+)
**Kidney**: eGFR (CKD-EPI 2021), CrCl (Cockcroft-Gault)
**Cardiology**: CHA2DS2-VASc, QTc (Bazett/Fridericia/Framingham)
**Neurology**: GCS (Glasgow Coma Scale)
**Pulmonary**: CURB-65, Wells DVT, Wells PE, PERC Rule
**Pediatrics**: APGAR, Centor/McIsaac
**ICU/OIOM**: SOFA, qSOFA, NEWS2, Henderson-Hasselbalch (ABG), Dosing Calculator (mg/kg, mcg/kg/min)
**Other**: BMI/BSA, Child-Pugh, MAP, Anion Gap, Corrected Calcium, MELD-Na

Wszystkie kalkulatory zawieraja:
- Real-time calculation with validated input ranges
- Color-coded risk badges (ok/warn/crit)
- Reference ranges and clinical interpretation
- Source citations (journal references)
- Algorithm versioning

### Habits & Analytics
- 14-day habit tracker with streaks
- Personal analytics dashboard (trend chart, heatmap, correlations)
- Nootropics/supplement tracking with status

### Productivity
- Pomodoro focus timer (25/5, 50/10, 90/15 presets)
- Interactive calendar with event modal
- To-do list with priority levels (H/M/L)
- Project progress tracking
- Notes section

### Financial
- Stock portfolio tracker (Yahoo Finance via CORS proxy)
- Macro indicators (S&P 500, Nasdaq, VIX, Gold, WTI, EUR/USD, USD/PLN)
- Black-Scholes options calculator with payoff chart
- Market news feed

### Other
- Real-time weather (Open-Meteo API)
- 6 color palettes with dark/light themes
- Sleep quality tracking
- Supplement refill reminders
- Service Worker for offline support

## Tech Stack

- **Next.js 16** — App Router, Server Components
- **React 19** — UI framework
- **TypeScript 5** — type safety
- **Tailwind CSS 4** — styling
- **Supabase** — Auth, Postgres (RLS), pgvector
- **Dexie 4** — IndexedDB offline-first storage
- **Zustand 5** — client state management
- **TanStack Query 5** — server state caching
- **Zod 4** — runtime env validation
- **Cloudflare Workers** — CORS proxy with KV rate limiting

## Deployment (Vercel)

1. Fork / clone repo
2. Import do [Vercel](https://vercel.com)
3. Ustaw Environment Variables (patrz nizej)
4. Deploy — Vercel automatycznie buduje i deployuje przy push do `main`

## Environment Variables

| Zmienna | Wymagana | Opis |
|---------|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Tak | URL projektu Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tak | Publiczny klucz anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Nie | Service role key (server-side only) |
| `NEXT_PUBLIC_FINNHUB_API_KEY` | Nie | Finnhub stock data |
| `ALPHA_VANTAGE_KEY` | Nie | Alpha Vantage stock data (fallback) |
| `POLYGON_KEY` | Nie | Polygon.io stock data |
| `NEXT_PUBLIC_OPENAQ_KEY` | Nie | OpenAQ air quality |
| `NEXT_PUBLIC_OPENUV_KEY` | Nie | OpenUV UV index |
| `NEXT_PUBLIC_GOOGLE_CAL_API_KEY` | Nie | Google Calendar API |
| `GOOGLE_CAL_CALENDAR_ID` | Nie | Google Calendar ID |
| `FINNHUB_NEWS_KEY` | Nie | Finnhub news feed |
| `FRED_API_KEY` | Nie | FRED economic data |
| `EIA_API_KEY` | Nie | EIA energy data |
| `OPENAI_API_KEY` | Nie | OpenAI embeddings (AI assistant) |
| `LATITUDE` | Nie | Szerokosc geograficzna (default: 53.43) |
| `LONGITUDE` | Nie | Dlugosc geograficzna (default: 14.55) |
| `TIMEZONE` | Nie | Strefa czasowa (default: Europe/Warsaw) |
| `CITY_NAME` | Nie | Nazwa miasta (default: Szczecin) |

Skopiuj `.env.example` do `.env.local` i uzupelnij wartosci.

## Local Development

```bash
npm install
cp .env.example .env.local
# uzupelnij .env.local
npm run dev
```

## Testing

```bash
npm test              # uruchom testy
npm run test:coverage # testy z pokryciem kodu
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## License

Open source - free to use and modify
