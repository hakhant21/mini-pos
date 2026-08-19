FROM php:8.4-fpm-alpine

# Install dependencies
RUN apk add --no-cache \
    git \
    curl \
    cron \
    nano \
    bash \
    build-base \
    autoconf \
    pkgconfig \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zlib-dev \
    libzip-dev \
    oniguruma-dev \
    libxml2-dev \
    mariadb-client \
    nodejs \
    npm \
    zip \
    unzip

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    gd \
    pdo \
    pdo_mysql \
    pcntl \
    zip \
    bcmath \
    exif \
    intl

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Set timezone
ENV TZ='Asia/Yangon'
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
EXPOSE 9000
CMD ["php-fpm", "--nodaemonize"]
