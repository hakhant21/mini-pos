FROM --platform=$BUILDPLATFORM composer:2 AS wayfinder

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-progress --no-scripts --optimize-autoloader

COPY . .
RUN php artisan wayfinder:generate --with-form

FROM --platform=$BUILDPLATFORM node:22-bookworm-slim AS frontend

ENV DOCKER_BUILD=1 \
    WAYFINDER_COMMAND=true

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY --from=wayfinder /app/resources/js/actions ./resources/js/actions
COPY --from=wayfinder /app/resources/js/routes ./resources/js/routes
COPY --from=wayfinder /app/resources/js/wayfinder ./resources/js/wayfinder
RUN npm run build

FROM composer:2 AS composer

FROM php:8.4-fpm-bookworm AS app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libicu-dev \
        libonig-dev \
        libzip-dev \
        curl \
        supervisor \
        unzip \
    && docker-php-ext-install -j"$(nproc)" bcmath intl mbstring opcache pdo_sqlite zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --no-scripts --optimize-autoloader

COPY . .
COPY --from=frontend /app/public/build ./public/build
COPY docker/entrypoint.sh /usr/local/bin/pos-entrypoint
COPY docker/supervisord.conf /etc/supervisor/conf.d/pos.conf

RUN chmod +x /usr/local/bin/pos-entrypoint \
    && mkdir -p database storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data database storage bootstrap/cache

ENTRYPOINT ["pos-entrypoint"]
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]

FROM nginx:alpine AS nginx

WORKDIR /var/www/html

COPY public ./public
COPY --from=frontend /app/public/build ./public/build
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
