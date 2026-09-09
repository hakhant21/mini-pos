FROM node:20-bookworm AS assets

WORKDIR /var/www
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM webdevops/php-nginx:8.4

WORKDIR /var/www
ENV WEB_DOCUMENT_ROOT=/var/www/public

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

COPY . .
COPY --from=assets /var/www/public/build /var/www/public/build

RUN mkdir -p storage/framework/cache/data storage/framework/sessions \
    storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80
