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
    && pnpm approve-builds --all \
    && pnpm run build

#################
# Runtime
#################
FROM php:8.4-fpm-alpine

# Fast prebuilt extension install (no slow from-source compilation)
RUN apk add --no-cache curl git unzip \
    && curl -sSL -o /usr/local/bin/install-php-extensions \
    https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions \
    && chmod +x /usr/local/bin/install-php-extensions \
    && install-php-extensions pdo_sqlite mbstring intl zip gd bcmath opcache \
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
