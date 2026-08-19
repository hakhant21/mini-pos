#!/bin/sh
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
FLAG="/var/www/.setup_done"

if [ ! -f "$FLAG" ]; then
  git config --global --add safe.directory /var/www
  info "Installing npm..."
  npm install
  info "Building assets..."
  npm run build
  info "Setting up permissions to storage folder..."
  chown -R www-data:www-data /var/www/storage/ /var/www/bootstrap/cache/
  info "Installing composer packages..."
  composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs
  info "Running migrations..."
  php artisan migrate
  info "Running storage link..."
  php artisan storage:link
  info "Optimizing cache and cleaning cache..."
  php artisan optimize:clear
  info "Creating setup done flag..."
  touch "$FLAG"
  exit 0
fi

exec php-fpm --nodaemonize
