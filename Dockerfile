FROM php:8.4-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl unzip libzip-dev libpng-dev supervisor nodejs npm \
    && docker-php-ext-install pdo_mysql gd zip bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

ENV TZ='Asia/Yangon'
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8000

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
