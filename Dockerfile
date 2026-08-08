# syntax=docker/dockerfile:1

#################
# PHP dependencies
#################
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction --prefer-dist

#################
# Frontend assets
#################
FROM php:8.4-cli-alpine AS assets
RUN apk add --no-cache nodejs npm
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY --from=vendor /app/vendor ./vendor
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .
RUN composer dump-autoload --optimize --no-interaction \
    && cp .env.example .env \
    && php artisan key:generate --force \
    && touch database/database.sqlite \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache \
    && npm install -g pnpm@11 \
    && pnpm install --frozen-lockfile --ignore-scripts=false \
    && pnpm run build

#################
# Runtime
#################
FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
        curl git unzip \
        icu-dev libzip-dev oniguruma-dev sqlite-dev \
        freetype-dev libpng-dev libjpeg-turbo-dev libwebp-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_sqlite \
        mbstring \
        intl \
        zip \
        gd \
        bcmath \
        opcache \
    && docker-php-ext-enable opcache \
    && rm -rf /var/cache/apk/*

WORKDIR /var/www

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build

COPY --chown=www-data:www-data . .
COPY --chown=www-data:www-data docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN composer dump-autoload --optimize --no-interaction \
    && chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p /var/www/storage/framework/cache/data \
        /var/www/storage/framework/sessions \
        /var/www/storage/framework/views \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
