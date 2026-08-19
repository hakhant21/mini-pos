#!/bin/sh
git config --global --add safe.directory /var/www

npm install

npm run build

chown -R www-data:www-data /var/www/storage/ /var/www/bootstrap/cache/

composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs

php artisan key:generate

php artisan migrate:fresh --seed

php artisan storage:link

php artisan optimize:clear

exec "$@"
