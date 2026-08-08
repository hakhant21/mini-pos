#!/bin/sh
set -e

cd /var/www

# Ensure SQLite database exists
mkdir -p /var/www/database
[ -f /var/www/database/database.sqlite ] || touch /var/www/database/database.sqlite

# Ensure storage directories exist and are writable
mkdir -p /var/www/storage/app/public \
    /var/www/storage/framework/cache/data \
    /var/www/storage/framework/sessions \
    /var/www/storage/framework/views \
    /var/www/storage/logs

chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database

# Generate app key if missing
if [ -z "${APP_KEY:-}" ] || [ "$APP_KEY" = "base64:" ]; then
    php artisan key:generate --force
fi

# Public storage symlink (uploads)
php artisan storage:link --force

# Run migrations
php artisan migrate --force

# Seed demo data once (marker lives on the storage volume)
if [ ! -f /var/www/storage/app/.seeded ]; then
    php artisan db:seed --force || echo "Seeding skipped"
    touch /var/www/storage/app/.seeded
fi

exec "$@"
