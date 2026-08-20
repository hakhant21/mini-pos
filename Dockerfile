FROM php:8.4-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl unzip libzip-dev libpng-dev supervisor \
    && docker-php-ext-install pdo_mysql gd zip bcmath \
    && rm -rf /var/lib/apt/lists/*

ENV TZ='Asia/Yangon'
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8000

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
