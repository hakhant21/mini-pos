FROM node:20-bookworm AS node

FROM webdevops/php-nginx:8.4

WORKDIR /var/www
ENV WEB_DOCUMENT_ROOT=/var/www/public

# Copy Node and npm without installing packages in the Raspberry Pi image.
COPY --from=node /usr/local/bin/ /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules/ /usr/local/lib/node_modules/

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

RUN mkdir -p storage/framework/cache/data storage/framework/sessions \
    storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80
