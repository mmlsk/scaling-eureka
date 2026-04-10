# Multi-stage build for minimal image size
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
# Install dependencies if needed for any preprocessing
RUN apk add --no-cache gzip

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the HTML application
COPY "Tabasco .html" /usr/share/nginx/html/index.html

# Enable gzip compression
RUN echo 'gzip on;' >> /etc/nginx/nginx.conf && \
    echo 'gzip_types text/plain text/css text/xml text/javascript application/x-javascript;' >> /etc/nginx/nginx.conf

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD nginx -t || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
