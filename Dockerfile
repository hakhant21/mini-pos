FROM php:8.4-fpm

# Install dependencies (using default Debian mirrors)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    cron \
    nano \
    bash \
    build-essential \
    pkg-config \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zlib1g-dev \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    mariadb-client \
    unzip \
    zip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

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

# Install and enable Redis extension
RUN pecl install redis \
    && docker-php-ext-enable redis

# Set timezone
ENV TZ='Asia/Yangon'
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create working directory
WORKDIR /var/www/html

# Expose PHP-FPM port
EXPOSE 9000

# Run PHP-FPM in foreground
CMD ["php-fpm", "--nodaemonize"]
