#!/bin/sh
FLAG="/var/www/.setup_done"

if [ ! -f "$FLAG" ]; then
  git config --global --add safe.directory /var/www
  npm install
  npm run build
  chown -R www-data:www-data /var/www/storage/ /var/www/bootstrap/cache/
  composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs
  php artisan key:generate
  php artisan migrate:fresh --seed
  php artisan storage:link
  php artisan optimize:clear
  touch "$FLAG"
  exit 0
fi

exec php-fpm --nodaemonize
