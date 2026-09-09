FROM node:20-bookworm AS node

FROM composer:2 AS vendor

WORKDIR /var/www
COPY . .
RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction

FROM webdevops/php-nginx:8.4

WORKDIR /var/www
ENV WEB_DOCUMENT_ROOT=/var/www/public

# Copy Node and npm without installing packages in the Raspberry Pi image.
COPY --from=node /usr/local/bin/ /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules/ /usr/local/lib/node_modules/
COPY . .
COPY --from=vendor /var/www/vendor /var/www/vendor
RUN npm install
RUN npm run build

RUN mkdir -p storage/framework/cache/data storage/framework/sessions \
    storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80
