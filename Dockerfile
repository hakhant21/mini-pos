FROM node:20-bookworm AS node

FROM webdevops/php-nginx:8.4

WORKDIR /var/www
ENV WEB_DOCUMENT_ROOT=/var/www/public

# Copy Node and npm without installing packages in the Raspberry Pi image.
COPY --from=node /usr/local/bin/ /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules/ /usr/local/lib/node_modules/
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction
RUN npm install
RUN npm run build

RUN mkdir -p storage/framework/cache/data storage/framework/sessions \
    storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80
