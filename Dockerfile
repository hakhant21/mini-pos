# ============================================================
# Assets Build Stage - Using Alpine for reliability
# ============================================================
FROM node:20-alpine AS assets

WORKDIR /var/www

# Alpine has working npm
RUN npm --version && node --version

# Install pnpm using npm (works reliably on Alpine)
RUN npm install -g pnpm@11.9.0

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies with pnpm. Do not fall back to a mutable install: the
# lockfile must be reproducible on the Pi architecture.
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build frontend assets
RUN pnpm run build

# ============================================================
# PHP Dependencies Stage
# ============================================================
FROM php:8.4-cli-bookworm AS vendor

WORKDIR /var/www

# Install system dependencies. Some Raspberry Pi Docker/libseccomp versions
# terminate APT's sandbox with SIGSYS (exit 159), so run APT as root here.
RUN apt-get -o APT::Sandbox::User=root update \
    && apt-get -o APT::Sandbox::User=root install -y --no-install-recommends \
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

# Install system dependencies. See the vendor stage for the APT sandbox note.
RUN apt-get -o APT::Sandbox::User=root update \
    && apt-get -o APT::Sandbox::User=root install -y --no-install-recommends \
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

# Create storage directories
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

# Copy nginx configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy application files (for static assets)
COPY --from=assets /var/www/public /var/www/public

# Copy storage (for symlink)
COPY --from=app /var/www/storage /var/www/storage

WORKDIR /var/www

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
