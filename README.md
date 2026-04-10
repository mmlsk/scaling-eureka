# LIFE OS - Life Dashboard Application

A responsive, single-page life management dashboard with dark/light themes, real-time weather data, timer functionality, habit tracking, and more.

## Features

- **Dashboard Overview**: Calendar, weather, timers, sleep tracking, habits, todos, and news
- **Multiple Themes**: 6 color palettes with dark/light variants (Reaktor, Strefa, Zimna Wojna, Niebieski, Nocny Pościg, Biała Noc)
- **Local Storage**: Persistent data saved in browser
- **Real-time Data**: Weather updates from Open-Meteo API
- **No Dependencies**: Pure HTML/CSS/JavaScript

## Deployment

### Quick Deploy (Static File Server)

This is a single `.html` file with all CSS and JavaScript embedded. Simply serve the file from any HTTP server.

#### Apache
```bash
cp "Tabasco .html" /var/www/html/index.html
```

Ensure `.htaccess` is in place for proper headers and HTTPS redirects.

#### Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline'; connect-src 'self' api.open-meteo.com api.fontshare.com fonts.googleapis.com;" always;
}
```

#### Docker
```bash
docker build -t life-os .
docker run -p 80:80 life-os
```

### Hosting Services

#### Vercel / Netlify
1. Push this repository to GitHub
2. Connect and deploy - no build step needed
3. Set this file as the index

#### GitHub Pages
```bash
git add "Tabasco .html"
git mv "Tabasco .html" index.html
git commit -m "Rename for GitHub Pages"
git push
```

Enable GitHub Pages in repository settings.

## Configuration

### Timezone
Edit the timezone in the weather fetch URL (line with `53.4285&longitude=14.5528`):
```javascript
// Current: Szczecin, Poland coordinates
// Change to your location
```

### External APIs
The application uses:
- **Weather**: Open-Meteo (https://open-meteo.com/) - Free, no API key required
- **Fonts**: Fontshare & Google Fonts - CDN hosted

Both services should be accessible from your deployment environment.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

Uses modern CSS (CSS Grid, CSS Variables) - no IE11 support.

## Performance

- Single file: ~200KB (with all CSS/JS embedded)
- No build process required
- Loads in <1s on 4G connections
- All data stored locally (no external database)

## Development

### Local Testing
```bash
python -m http.server 8000
# or
npx http-server
```

Then visit `http://localhost:8000/Tabasco%20.html`

### Customization

#### Rename the File
```bash
mv "Tabasco .html" "LifeOS.html"
```

#### Change Default Theme
Edit line 1:
```html
<html lang="pl" data-theme="dark" data-palette="reaktor">
```

Options: `data-theme="dark"` or `data-theme="light"`
Palettes: `reaktor`, `strefa`, `zimna`, `niebieski`, `nocny`, `biala`

#### Add Analytics
Before `</body>`, add:
```html
<script async src="https://cdn.example.com/analytics.js"></script>
```

## Security Considerations

✅ XSS Protection: All dynamic content uses `textContent` (not `innerHTML` where possible)
✅ CORS Safe: No external API calls requiring credentials
✅ HTTPS Ready: All external resources use HTTPS
✅ No Server Storage: All data is client-side only (localStorage)

**Recommendations for Production:**
- Use HTTPS/TLS everywhere
- Implement security headers (.htaccess / nginx config included)
- Consider adding Content-Security-Policy header
- Validate localStorage data before use

## Troubleshooting

### Weather not updating
- Check browser console (F12)
- Verify Open-Meteo API is accessible
- Check CORS policy in browser Network tab

### Data not persisting
- Check localStorage is enabled in browser
- Clear localStorage if corrupted: `localStorage.clear()` in console
- Check "Storage" or "Application" tab in DevTools

### Fonts not loading
- CDN URLs: Fontshare and Google Fonts
- Check network requests in browser DevTools
- Fallback fonts are system fonts (Courier New, monospace)

## Browser Storage

The app uses localStorage with ~1-5MB limit depending on browser:
- `lifeos_palette`: Theme and palette selection
- `lifeos_theme`: Dark/light mode
- `lifeos_todos`: Todo list data
- `lifeos_feelings`: Selected feelings
- `lifeos_timer`: Timer state

## License

Open source - free to use and modify

## Support

For issues or feature requests, check console for errors (F12 → Console)
