FROM php:8.3-fpm-alpine

# Only essential dependencies
RUN apk add --no-cache curl git unzip libzip-dev libpng-dev \
    && docker-php-ext-install pdo_mysql gd zip bcmath

# Redis (optional - remove if not using)
RUN pecl install redis && docker-php-ext-enable redis

# Set timezone
ENV TZ='Asia/Yangon'
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 9000

CMD ["php-fpm", "--nodaemonize"]
