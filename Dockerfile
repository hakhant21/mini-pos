# syntax=docker/dockerfile:1.7

FROM php:8.4-cli-bookworm AS vendor

WORKDIR /var/www

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        libicu-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libpng-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" bcmath gd intl mbstring pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

FROM node:22-bookworm-slim AS assets

WORKDIR /var/www

RUN corepack enable && corepack install --global pnpm@11.9.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY --from=vendor /var/www/vendor ./vendor
COPY . .
RUN pnpm build

FROM php:8.4-fpm-bookworm AS app

ENV APP_ENV=production \
    APP_DEBUG=false

RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        libicu-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libzip-dev \
        nginx \
        $PHPIZE_DEPS \
        unzip \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" bcmath gd intl mbstring opcache pdo_mysql zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get purge -y --auto-remove $PHPIZE_DEPS \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

COPY --from=vendor /var/www/vendor ./vendor
COPY . .
COPY --from=assets /var/www/public/build ./public/build
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint

RUN chmod +x /usr/local/bin/entrypoint \
    && mkdir -p storage/app/public storage/framework/{cache,data,sessions,testing,views} bootstrap/cache \
    && ln -s storage/app/public public/storage \
    && php artisan package:discover --ansi \
    && chown -R www-data:www-data storage bootstrap/cache

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS http://localhost/up || exit 1

EXPOSE 9000

ENTRYPOINT ["entrypoint"]
CMD ["php-fpm", "-F"]
