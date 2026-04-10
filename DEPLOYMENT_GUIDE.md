# LIFE OS - Deployment Guide

This guide covers deploying LIFE OS to various platforms.

## Prerequisites

- Git repository with updated code
- Domain name (optional for local/testing)
- Basic command line skills
- Server access (for traditional hosting)

---

## 1. Vercel (Recommended - Easiest)

### Steps
1. Create account at vercel.com
2. Clone repository: `git clone <your-repo>`
3. Visit vercel.com/new and connect GitHub
4. Select your repository
5. Vercel auto-detects static site, click Deploy
6. Access your app at `your-project.vercel.app`

### Custom Domain
1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Verify and enable

### Advantages
- ✅ Zero configuration
- ✅ Automatic HTTPS with Let's Encrypt
- ✅ Global CDN included
- ✅ Free tier available
- ✅ Preview deployments

---

## 2. Netlify (Alternative)

### Steps
1. Create account at netlify.com
2. Connect GitHub repository
3. Select repository
4. Default settings work fine
5. Click "Deploy site"
6. Custom domain via Settings

### Advantages
- ✅ Similar to Vercel
- ✅ Free tier with good specs
- ✅ Built-in form handling (future use)
- ✅ Analytics included

---

## 3. GitHub Pages (Free + GitHub Included)

### Steps
```bash
# In your repository
git mv "Tabasco .html" index.html
git commit -m "Rename to index.html for GitHub Pages"
git push
```

In GitHub Settings:
1. Go to Settings → Pages
2. Select "Deploy from a branch"
3. Select branch (main/master)
4. If custom domain: add in "Custom domain" field
5. Wait for deployment (~5 minutes)

### Access
- Default: `username.github.io/repository-name`
- Custom: your-domain.com (after DNS setup)

### Limitations
- No server-side processing
- Static files only (✓ we have this)
- No backend (not needed for this app)

---

## 4. Docker Deployment

### Prerequisites
- Docker installed locally
- Docker Hub account (for storing image)
- Server with Docker

### Local Testing
```bash
# Build image
docker build -t life-os:latest .

# Run container
docker run -d -p 80:80 --name life-os life-os:latest

# Test
curl http://localhost
docker logs life-os

# Stop
docker stop life-os
docker rm life-os
```

### Deploy to Docker Hub (Push Image)
```bash
# Login to Docker Hub
docker login

# Tag for Docker Hub
docker tag life-os:latest username/life-os:latest

# Push (store on Docker Hub)
docker push username/life-os:latest
```

### Deploy to Server
```bash
# On your server
docker pull username/life-os:latest

# Run with volume for easy updates
docker run -d \
  -p 80:80 \
  -p 443:443 \
  -v /var/www/html:/usr/share/nginx/html \
  --restart unless-stopped \
  username/life-os:latest
```

### Docker Compose (All-in-One)
```bash
# Update docker-compose.yml with your settings
docker-compose up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f

# Update
docker-compose pull
docker-compose up -d
```

---

## 5. Traditional Linux Server (Apache)

### Prerequisites
- SSH access to server
- Apache2 installed
- mod_rewrite enabled: `sudo a2enmod rewrite`

### Steps
```bash
# SSH into server
ssh user@server.com

# Navigate to web root
cd /var/www/html

# Upload file (from local machine)
# Using SCP:
scp "Tabasco .html" user@server.com:/var/www/html/

# Or via Git:
git clone <your-repo> .
```

### Setup
```bash
# Copy .htaccess
cp .htaccess /var/www/html/

# Set permissions
chmod 644 /var/www/html/Tabasco\ .html
chmod 644 /var/www/html/.htaccess
chmod 755 /var/www/html

# Restart Apache
sudo systemctl restart apache2

# Check status
sudo systemctl status apache2
```

### Enable HTTPS with Let's Encrypt
```bash
# Install certbot
sudo apt install certbot python3-certbot-apache

# Get certificate
sudo certbot --apache -d your-domain.com

# Auto-renew (installed by default)
sudo systemctl enable certbot.timer
```

### Verify
- Visit `https://your-domain.com/Tabasco%20.html`
- Check browser console (F12) for errors
- Verify HTTPS padlock appears

---

## 6. Traditional Linux Server (Nginx)

### Prerequisites
- SSH access to server
- Nginx installed
- Root or sudo access

### Steps
```bash
# SSH into server
ssh user@server.com

# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/life-os

# Create symlink
sudo ln -s /etc/nginx/sites-available/life-os /etc/nginx/sites-enabled/

# Upload HTML file
scp "Tabasco .html" user@server.com:/var/www/life-os/

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Enable HTTPS
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Update nginx.conf with cert paths
# Edit: /etc/nginx/sites-available/life-os
# Update lines:
#   ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
#   ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

# Reload nginx
sudo nginx -s reload
```

### Verify
```bash
# Check nginx is running
sudo systemctl status nginx

# Check logs
sudo tail -f /var/log/nginx/life-os-error.log
sudo tail -f /var/log/nginx/life-os-access.log

# Test configuration
sudo nginx -t
```

---

## 7. Cloud Platforms

### AWS S3 + CloudFront

```bash
# Create S3 bucket
aws s3 mb s3://life-os-bucket --region us-east-1

# Upload file
aws s3 cp "Tabasco .html" s3://life-os-bucket/index.html

# Create CloudFront distribution (via AWS Console)
# Origin: S3 bucket
# Default root object: index.html

# Update DNS to CloudFront domain
```

### Google Cloud (Cloud Storage + CDN)
```bash
# Create bucket
gsutil mb gs://life-os-bucket

# Upload file
gsutil cp "Tabasco .html" gs://life-os-bucket/index.html

# Enable CDN via console
# Set default object: index.html
```

### DigitalOcean App Platform
1. Connect GitHub account
2. Select repository
3. Configure as "Static Site"
4. Set source: `Tabasco .html`
5. Deploy
6. See generated URL

### Heroku (Legacy - uses Docker Manifest)
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku apps:create life-os

# Deploy
git push heroku main

# Open
heroku open
```

---

## 8. Post-Deployment Verification

### Health Checks
```bash
# Check page loads
curl -I https://your-domain.com

# Verify headers
curl -I https://your-domain.com | grep -E "X-Frame|CSP|HSTS"

# Test in different countries
# Use https://www.webpagetest.org

# Mobile test
# Open in mobile phone browser
# Check responsive design, font loading
```

### Monitoring Setup

#### Uptime Monitoring
- Uptime Robot (free): Create HTTP(S) check to your URL
- Pingdom: Similar service, paid plan available
- Better: Your cloud provider's built-in monitoring

#### Error Tracking
- Sentry: Add error tracking (requires code change)
- LogRocket: Session replay (requires code change)
- Browser DevTools remote debugging

#### Performance Monitoring
- Google PageSpeed Insights
- Lighthouse CI
- WebPageTest

### SSL Certificate Auto-Renewal
```bash
# Certbot handles auto-renewal automatically
# Verify
sudo systemctl status certbot.timer

# Manual renewal (optional)
sudo certbot renew --dry-run
```

---

## 9. Troubleshooting

### 404 Errors
- Verify file is in correct directory
- Check path matches configuration
- .htaccess rewrite rules may need adjustment
- nginx.conf try_files path must match filename

### Files Don't Load (Fonts, Weather Data)
- Check browser console for CORS errors
- Verify external APIs are accessible from your server
- Check firewall isn't blocking outbound connections
- Verify CDN URLs in HTML (should be HTTPS)

### HTTPS Not Working
- Verify certificate files exist
- Check certificate expiration: `openssl x509 -enddate -noout -in /path/to/cert.pem`
- Verify port 443 is open
- Check for port conflicts

### Performance Issues
- Enable gzip compression
- Check browser cache headers are set
- Use CDN for global distribution
- Monitor API response times (weather)
- Enable lazy loading if applicable

### Data Not Persisting
- localStorage has ~5MB limit per domain
- Check browser's storage settings
- Verify "Allow cookies" is enabled
- Clear browser cache and try again

---

## 10. Maintenance

### Regular Tasks
- [ ] Monitor application error logs (daily)
- [ ] Check SSL certificate expiration (monthly)
- [ ] Review access logs for suspicious activity (weekly)
- [ ] Update server packages (monthly)
- [ ] Test backup restore procedures (quarterly)

### Security Updates
- Keep OS packages updated
- Monitor security advisories for dependencies
- Review and test security headers
- Audit file permissions regularly

### Scalability
- For millions of requests: use CDN (Cloudflare, AWS CloudFront)
- Consider moving to managed hosting if traffic grows
- Current single-file approach handles 1000+ req/s easily
- No database = easy to scale (just replicate files)

---

## 11. Advanced: Custom Domain + Email

### Domain Setup (Using Namecheap as example)

```
A Record:        @  → Your server IP (get from hosting provider)
CNAME Record:    www → Your domain or server address
TXT Record:      (MX records if using email)

# Let's Encrypt ACME Challenge
TXT Record:      _acme-challenge → Let's Encrypt will provide during setup
```

### Update Nginx for New Domain
```bash
sudo nano /etc/nginx/sites-available/life-os
# Change: server_name your-domain.com www.your-domain.com;
# To: server_name yournewdomain.com www.yournewdomain.com;

sudo nginx -t
sudo systemctl reload nginx
```

---

## Quick Reference: Zero-Downtime Deployment

```bash
# 1. Test locally
docker build -t life-os:new .
docker run -p 8080:80 life-os:new
# → Test in browser

# 2. Tag and push
docker tag life-os:new yourname/life-os:latest
docker push yourname/life-os:latest

# 3. Update production (docker-compose)
docker-compose pull
docker-compose up -d --no-deps --build life-os
docker-compose restart life-os

# 4. Verify
docker-compose ps
curl https://your-domain.com
```

---

## Support

For platform-specific help:
- Vercel: vercel.com/docs
- Netlify: docs.netlify.com
- Docker: docs.docker.com
- Nginx: nginx.org/en/docs/
- Apache: httpd.apache.org/docs/
- Digital Ocean: docs.digitalocean.com
