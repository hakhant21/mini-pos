# ============================================================
# Assets Build Stage - Using pnpm install script directly
# ============================================================
FROM node:22-bookworm-slim AS assets

WORKDIR /var/www

# Install curl and other dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install pnpm using the official install script (bypasses npm)
RUN curl -fsSL https://get.pnpm.io/install.sh | sh - && \
    export PNPM_HOME="/root/.local/share/pnpm" && \
    export PATH="$PNPM_HOME:$PATH"

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm (which was installed via curl)
RUN /root/.local/share/pnpm/pnpm install --frozen-lockfile || \
    /root/.local/share/pnpm/pnpm install --no-frozen-lockfile

# Copy the rest of the application
COPY . .

# Build frontend assets
RUN /root/.local/share/pnpm/pnpm run build || \
    /root/.local/share/pnpm/pnpm build || \
    npm run build

# ============================================================
# PHP Dependencies Stage
# ============================================================
FROM php:8.4-cli-bookworm AS vendor

WORKDIR /var/www

# Install system dependencies
RUN apt-get update && apt-get install -y \
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

# Install system dependencies
RUN apt-get update && apt-get install -y \
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

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy nginx configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy application files (for static assets)
COPY --from=assets /var/www/public /var/www/public

# Copy storage (for symlink)
COPY --from=app /var/www/storage /var/www/storage

WORKDIR /var/www

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
