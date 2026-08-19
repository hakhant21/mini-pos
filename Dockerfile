FROM php:8.4-fpm-alpine

# Only essential dependencies
RUN apk add --no-cache curl git unzip libzip-dev libpng-dev nodejs npm \
    && docker-php-ext-install pdo_mysql gd zip bcmath

# pnpm via corepack
RUN corepack enable pnpm

# Set timezone
ENV TZ='Asia/Yangon'
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm", "--nodaemonize"]
