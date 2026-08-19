FROM php:8.4-fpm

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
