# ============================================================
# Assets Build Stage - Using pnpm install script directly
# ============================================================
FROM node:22-bookworm-slim AS assets

WORKDIR /var/www

# Skip apt-get entirely - use the node image's built-in tools
# Install pnpm using npm (already available in node image)
RUN npm install -g pnpm@11.9.0 --no-audit --no-fund --loglevel=error || \
    npm install -g pnpm@11.9.0 --registry=https://registry.npmjs.org/ --no-audit --no-fund

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile || \
    pnpm install --no-frozen-lockfile

# Copy the rest of the application
COPY . .

# Build frontend assets
RUN pnpm run build || npm run build

# ============================================================
# PHP Dependencies Stage
# ============================================================
FROM php:8.4-cli-bookworm AS vendor

WORKDIR /var/www

# Use Debian mirrors that work
RUN echo "deb http://deb.debian.org/debian bookworm main contrib non-free" > /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian bookworm-updates main contrib non-free" >> /etc/apt/sources.list && \
    echo "deb http://security.debian.org/debian-security bookworm-security main contrib non-free" >> /etc/apt/sources.list

# Install system dependencies with retry
RUN apt-get update --allow-releaseinfo-change || apt-get update --allow-releaseinfo-change && \
    apt-get install -y --no-install-recommends \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    mbstring \
    zip \
    xml \
    gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy composer files first for better caching
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy the rest of the application
COPY . .

# ============================================================
# PHP Application Stage
# ============================================================
FROM php:8.4-fpm-bookworm AS app

WORKDIR /var/www

# Use Debian mirrors that work
RUN echo "deb http://deb.debian.org/debian bookworm main contrib non-free" > /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian bookworm-updates main contrib non-free" >> /etc/apt/sources.list && \
    echo "deb http://security.debian.org/debian-security bookworm-security main contrib non-free" >> /etc/apt/sources.list

# Install system dependencies with retry
RUN apt-get update --allow-releaseinfo-change || apt-get update --allow-releaseinfo-change && \
    apt-get install -y --no-install-recommends \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    mbstring \
    zip \
    xml \
    gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy vendor from vendor stage
COPY --from=vendor /var/www/vendor /var/www/vendor

# Copy application files
COPY . .

# Copy built assets from assets stage
COPY --from=assets /var/www/public/build /var/www/public/build

# Set proper permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Create storage directories if they don't exist
RUN mkdir -p /var/www/storage/framework/cache/data \
    && mkdir -p /var/www/storage/framework/sessions \
    && mkdir -p /var/www/storage/framework/views \
    && mkdir -p /var/www/storage/logs \
    && chown -R www-data:www-data /var/www/storage

# PHP-FPM configuration
RUN echo "upload_max_filesize = 20M" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 20M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/uploads.ini

EXPOSE 9000

CMD ["php-fpm"]

# ============================================================
# Nginx Stage
# ============================================================
FROM nginx:stable-bookworm AS nginx

# Use Debian mirrors that work
RUN echo "deb http://deb.debian.org/debian bookworm main contrib non-free" > /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian bookworm-updates main contrib non-free" >> /etc/apt/sources.list && \
    echo "deb http://security.debian.org/debian-security bookworm-security main contrib non-free" >> /etc/apt/sources.list

# Install curl for healthcheck with retry
RUN apt-get update --allow-releaseinfo-change || apt-get update --allow-releaseinfo-change && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy nginx configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy application files (for static assets)
COPY --from=assets /var/www/public /var/www/public

# Copy storage (for symlink)
COPY --from=app /var/www/storage /var/www/storage

WORKDIR /var/www

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
