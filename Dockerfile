FROM php:8.4-fpm


# Update package lists and install dependencies
RUN apt-get update -o Acquire::Retries=5 && apt-get install -y --no-install-recommends \
    curl \
    git \
    unzip \
    zip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zlib1g-dev \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    mariadb-client \
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

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Set timezone
ENV TZ='Asia/Yangon'
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
EXPOSE 9000
CMD ["php-fpm", "--nodaemonize"]
