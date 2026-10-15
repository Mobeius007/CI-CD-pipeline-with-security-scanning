# Multi-stage hardened Dockerfile for PHP / Laravel (e.g. FixHR)
# Stage 1: Dependency builder
FROM composer:2.7 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

# Stage 2: Hardened Production Runtime
FROM php:8.3-fpm-alpine

# Install minimal system dependencies & PHP extensions
RUN apk add --no-cache \
    nginx \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring zip bcmath opcache

# Security: Dedicated unprivileged user (UID/GID 10001)
RUN addgroup -g 10001 appgroup && \
    adduser -u 10001 -G appgroup -s /sbin/nologin -D appuser

WORKDIR /var/www/html

COPY --chown=appuser:appgroup . .
COPY --from=vendor --chown=appuser:appgroup /app/vendor ./vendor

# Ensure storage and bootstrap/cache permissions
RUN chmod -R 775 storage bootstrap/cache

USER appuser:appgroup

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
