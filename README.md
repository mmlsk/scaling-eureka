# LIFE OS Dashboard

Personal medical/productivity dashboard — a single-page application for health tracking, clinical calculators, habit monitoring, financial data, and daily planning.

## Features

### Medical Calculators (22+)
**Kidney**: eGFR (CKD-EPI 2021), CrCl (Cockcroft-Gault)
**Cardiology**: CHA2DS2-VASc, QTc (Bazett/Fridericia/Framingham)
**Neurology**: GCS (Glasgow Coma Scale)
**Pulmonary**: CURB-65, Wells DVT, Wells PE, PERC Rule
**Pediatrics**: APGAR, Centor/McIsaac
**ICU/OIOM**: SOFA, qSOFA, NEWS2, Henderson-Hasselbalch (ABG), Dosing Calculator (mg/kg, mcg/kg/min)
**Other**: BMI/BSA, Child-Pugh, MAP, Anion Gap, Corrected Calcium, MELD-Na

All calculators include:
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

## Architecture

```
index.html          — SPA shell (~2500 lines, all HTML + CSS)
app.js              — Application logic (~2500 lines, minified style)
sw.js               — Service Worker (cache-first static, SWR weather)
proxy-worker.js     — Cloudflare Worker CORS proxy
wrangler.toml       — Cloudflare Worker deployment config
tests/calc-tests.js — Medical calculator regression tests
```

## Tech Stack

- **Vanilla JS** — no frameworks, no build step
- **CSS Custom Properties** — theming via `--az`, `--c2`, `--tx`, etc.
- **localStorage** — persistence via StorageManager with debounced saves and versioning
- **Service Worker API** — offline support, font caching
- **Cloudflare Workers** — CORS proxy with KV-backed rate limiting
- **Inline SVG** — sparklines, charts, analytics visualizations

## Deployment

### GitHub Pages
1. Push to GitHub
2. Enable Pages in Settings (source: main branch)
3. Access at `https://<user>.github.io/<repo>/`

### Docker
```bash
docker build -t life-os .
docker run -p 80:80 life-os
```

### Cloudflare Worker (CORS Proxy)
```bash
# 1. Install wrangler
npm install -g wrangler

# 2. Login
wrangler login

# 3. Create KV namespace for rate limiting
wrangler kv:namespace create RATE_LIMIT_KV
# Copy the namespace ID from the output

# 4. Update wrangler.toml with your KV namespace ID
# Replace <YOUR_KV_NAMESPACE_ID> in wrangler.toml

# 5. Deploy
wrangler deploy

# 6. Update CSP connect-src in index.html with your worker URL
```

### Local Development
```bash
python -m http.server 8080
# or
npx http-server -p 8080
```

## Configuration

### Location / Timezone
Edit `CONFIG.WEATHER_API` in `app.js`:
```js
LATITUDE: 53.4285,   // Your latitude
LONGITUDE: 14.5528,  // Your longitude
TIMEZONE: 'Europe/Berlin'
```

### Theme
```html
<html data-theme="dark" data-palette="reaktor">
```
Palettes: `reaktor`, `strefa`, `zimna`, `niebieski`, `nocny`, `biala`

### API Keys
Market news APIs are configured in `CONFIG.MARKET_NEWS`:
- Finnhub (stock news)
- FRED (economic data)
- EIA (energy data)

## Testing

Run medical calculator regression tests:
```bash
# Node.js
node tests/calc-tests.js

# Browser: paste contents of tests/calc-tests.js into console
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## License

Open source - free to use and modify
