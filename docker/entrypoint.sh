#!/bin/sh

set -eu

cd /var/www/html

if [ ! -f .env ]; then
    cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force --no-interaction
fi

database_path="${DB_DATABASE:-database/database.sqlite}"
if [ "${database_path#/}" = "$database_path" ]; then
    database_path="/var/www/html/$database_path"
fi

mkdir -p "$(dirname "$database_path")"
touch "$database_path"

php artisan migrate --force --no-interaction

seed_marker="storage/framework/.database-seeded"
if [ ! -f "$seed_marker" ]; then
    php artisan db:seed --force --no-interaction
    touch "$seed_marker"
fi

php artisan storage:link

php artisan config:cache --no-interaction

exec "$@"
