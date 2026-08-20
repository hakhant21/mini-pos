#!/bin/bash

# ဘီးကြဲ POS System - Laravel + Inertia + React Deployment Script
# For Raspberry Pi 4B with PHP 8.4
# Repository: https://github.com/hakhant21/mini-pos.git
# Run as: sudo bash deploy-bee-kyal.sh

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration Variables
GIT_REPO="https://github.com/hakhant21/mini-pos.git"
GIT_BRANCH="pos/bee-kyal"
APP_NAME="bee-kyal"
APP_DISPLAY_NAME="ဘီးကြဲ"
APP_DIR="/var/www/${APP_NAME}"
DB_NAME="bee_kyal_db"
DB_USER="bee_kyal_user"
DB_PASSWORD="$(openssl rand -base64 32)"
SERVER_IP="192.168.100.70"
PHP_VERSION="8.4"

# Log functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] ✗ $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] ⚠ $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] ℹ $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root. Use: sudo bash deploy-bee-kyal.sh"
fi

# Check if app already exists
if [ -d "$APP_DIR" ]; then
    warning "Application directory already exists at ${APP_DIR}"
    read -p "Do you want to remove it and redeploy? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Removing existing application..."
        rm -rf ${APP_DIR}
    else
        error "Deployment cancelled"
    fi
fi

# 1. System Update
log "Updating system packages for Raspberry Pi 4B..."
apt update -y && apt upgrade -y
check_success() {
    if [ $? -ne 0 ]; then
        error "$1"
    fi
}
check_success "Failed to update system"

# 2. Add PHP 8.4 Repository (for Raspberry Pi OS)
log "Adding PHP 8.4 repository..."
if [ ! -f "/etc/apt/sources.list.d/php.list" ]; then
    apt install -y apt-transport-https lsb-release ca-certificates wget
    wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
    echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" | tee /etc/apt/sources.list.d/php.list
    apt update -y
    check_success "Failed to add PHP repository"
else
    info "PHP repository already configured"
fi

# 3. Install Required Packages
log "Installing required packages..."
apt install -y \
    nginx \
    mariadb-server \
    php${PHP_VERSION}-fpm \
    php${PHP_VERSION}-mysql \
    php${PHP_VERSION}-cli \
    php${PHP_VERSION}-common \
    php${PHP_VERSION}-cli
    php${PHP_VERSION}-opcache \
    php${PHP_VERSION}-mbstring \
    php${PHP_VERSION}-xml \
    php${PHP_VERSION}-zip \
    php${PHP_VERSION}-gd \
    php${PHP_VERSION}-curl \
    php${PHP_VERSION}-bcmath \
    php${PHP_VERSION}-intl \
    php${PHP_VERSION}-sqlite3 \
    composer \
    git \
    unzip \
    supervisor
check_success "Failed to install packages"

# 4. Install Node.js 20.x for Raspberry Pi ARM
log "Installing Node.js 20.x for ARM architecture..."
if ! command -v node &> /dev/null; then
    # For Raspberry Pi (ARM architecture)
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    check_success "Failed to install Node.js"
else
    info "Node.js already installed: $(node -v)"
    info "npm version: $(npm -v)"
fi

# Verify Node.js installation
log "Node.js version: $(node --version)"
log "npm version: $(npm --version)"

# 5. Configure MySQL
log "Configuring MySQL..."
systemctl start mysql
systemctl enable mysql

# Create Database and User
log "Creating database ${DB_NAME}..."
mysql --user=root <<_EOF_
  CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
  GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
  FLUSH PRIVILEGES;
_EOF_
check_success "Failed to create database"

# 6. Clone Repository
log "Cloning branch '${GIT_BRANCH}' from ${GIT_REPO}..."
mkdir -p /var/www

# Try to clone the specific branch
if ! git clone --branch ${GIT_BRANCH} --single-branch ${GIT_REPO} ${APP_DIR}; then
    warning "Branch '${GIT_BRANCH}' not found, trying to clone default branch..."
    git clone ${GIT_REPO} ${APP_DIR}
    cd ${APP_DIR}
    # Try to checkout the branch if it exists
    if git branch -a | grep -q "pos/bee-kyal"; then
        git checkout pos/bee-kyal
    else
        warning "Branch 'pos/bee-kyal' not found, using default branch"
        # List available branches for reference
        info "Available branches:"
        git branch -a
    fi
    cd ..
fi
check_success "Failed to clone repository"

cd ${APP_DIR}

# Show current branch
info "Current branch: $(git branch --show-current)"

# 7. Install Composer Dependencies
log "Installing Composer dependencies..."
export COMPOSER_ALLOW_SUPERUSER=1
if [ -f "composer.lock" ]; then
    composer install --no-dev --optimize-autoloader --no-interaction
else
    composer install --no-interaction
fi
check_success "Failed to install Composer dependencies"

# 8. Install NPM Dependencies
log "Installing npm dependencies..."
npm install
check_success "Failed to install npm dependencies"

# 9. Build Assets
log "Building production assets..."
npm run build
check_success "Failed to build assets"

# 10. Configure Environment
log "Configuring environment..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        # Create a basic .env if no example exists
        cat > .env <<'EOF'
APP_NAME="ဘီးကြဲ"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://192.168.100.70

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bee_kyal_db
DB_USERNAME=bee_kyal_user
DB_PASSWORD=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
EOF
    fi
fi

# Update .env file
log "Updating .env configuration..."
sed -i "s/APP_NAME=.*/APP_NAME=\"${APP_DISPLAY_NAME}\"/" .env
sed -i "s/APP_ENV=.*/APP_ENV=production/" .env
sed -i "s/APP_DEBUG=.*/APP_DEBUG=false/" .env
sed -i "s|APP_URL=.*|APP_URL=http://${SERVER_IP}|" .env

# Database configuration
sed -i "s/DB_CONNECTION=.*/DB_CONNECTION=mysql/" .env
sed -i "s/DB_HOST=.*/DB_HOST=127.0.0.1/" .env
sed -i "s/DB_PORT=.*/DB_PORT=3306/" .env
sed -i "s/DB_DATABASE=.*/DB_DATABASE=${DB_NAME}/" .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=${DB_USER}/" .env
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD}|" .env

# Generate application key if not set
if ! grep -q "APP_KEY=base64:" .env; then
    log "Generating application key..."
    php artisan key:generate
    check_success "Failed to generate key"
fi

# 11. Set Permissions
log "Setting permissions..."
chown -R www-data:www-data ${APP_DIR}
chmod -R 775 ${APP_DIR}/storage
chmod -R 775 ${APP_DIR}/bootstrap/cache

# 12. Run Migrations
log "Running database migrations..."
php artisan migrate --force
check_success "Failed to run migrations"

# Run seeders if they exist
if [ -d "database/seeders" ]; then
    log "Running database seeders..."
    php artisan db:seed --force
    info "Seeders completed"
fi

# Create storage link
log "Creating storage link..."
php artisan storage:link

# 13. Optimize
log "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 14. Configure Nginx
log "Configuring Nginx..."
cat > /etc/nginx/sites-available/${APP_NAME} <<EOF
server {
    listen 80;
    server_name ${SERVER_IP};
    root ${APP_DIR}/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php;

    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php\$ {
        fastcgi_pass unix:/var/run/php/php${PHP_VERSION}-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Browser caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
check_success "Nginx configuration test failed"

# 15. Configure PHP 8.4 for Raspberry Pi
log "Configuring PHP 8.4..."
# Optimize for Raspberry Pi 4B (4GB/8GB RAM)
sed -i "s/memory_limit = .*/memory_limit = 256M/" /etc/php/${PHP_VERSION}/fpm/php.ini
sed -i "s/upload_max_filesize = .*/upload_max_filesize = 20M/" /etc/php/${PHP_VERSION}/fpm/php.ini
sed -i "s/post_max_size = .*/post_max_size = 20M/" /etc/php/${PHP_VERSION}/fpm/php.ini
sed -i "s/max_execution_time = .*/max_execution_time = 60/" /etc/php/${PHP_VERSION}/fpm/php.ini

# 16. Configure Supervisor for Queue (if needed)
if [ -d "app/Jobs" ] || grep -q "Queue" routes/*.php 2>/dev/null; then
    log "Configuring Supervisor for queue workers..."
    cat > /etc/supervisor/conf.d/bee-kyal-worker.conf <<EOF
[program:bee-kyal-worker]
process_name=%(program_name)s_%(process_num)02d
command=php ${APP_DIR}/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=${APP_DIR}/storage/logs/worker.log
EOF

    supervisorctl reread
    supervisorctl update
    supervisorctl start bee-kyal-worker:*
fi

# 17. Restart Services
log "Restarting services..."
systemctl restart php${PHP_VERSION}-fpm
systemctl restart nginx

# 18. Configure Firewall
if command -v ufw &> /dev/null; then
    log "Configuring firewall..."
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "y" | ufw enable
fi

# 19. Create Update Script
log "Creating update script..."
cat > /usr/local/bin/update-bee-kyal.sh <<EOF
#!/bin/bash
cd ${APP_DIR}
echo "Pulling latest changes from ${GIT_BRANCH}..."
git pull origin ${GIT_BRANCH}
echo "Installing dependencies..."
composer install --no-dev --optimize-autoloader
npm install
npm run build
echo "Running migrations..."
php artisan migrate --force
echo "Optimizing..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "Restarting services..."
systemctl restart php${PHP_VERSION}-fpm
echo "ဘီးကြဲ update complete!"
EOF

chmod +x /usr/local/bin/update-bee-kyal.sh

# 20. Create Backup Script
log "Creating backup script..."
cat > /usr/local/bin/backup-bee-kyal.sh <<EOF
#!/bin/bash
BACKUP_DIR="/var/backups/${APP_NAME}"
mkdir -p \${BACKUP_DIR}
DATE=\$(date +%Y%m%d_%H%M%S)

# Backup database
mysqldump -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > \${BACKUP_DIR}/db_\${DATE}.sql

# Backup files
tar -czf \${BACKUP_DIR}/files_\${DATE}.tar.gz -C ${APP_DIR} .

# Keep only last 7 backups
ls -t \${BACKUP_DIR}/db_* | tail -n +8 | xargs -r rm
ls -t \${BACKUP_DIR}/files_* | tail -n +8 | xargs -r rm

echo "Backup complete: \${BACKUP_DIR}/db_\${DATE}.sql"
EOF

chmod +x /usr/local/bin/backup-bee-kyal.sh

# Save credentials
log "Saving credentials..."
cat > /root/bee-kyal-credentials.txt <<EOF
===========================================
Application: ${APP_DISPLAY_NAME} (ဘီးကြဲ)
Server IP: ${SERVER_IP}
Database Name: ${DB_NAME}
Database User: ${DB_USER}
Database Password: ${DB_PASSWORD}
Repository: ${GIT_REPO}
Branch: ${GIT_BRANCH}
===========================================
EOF

chmod 600 /root/bee-kyal-credentials.txt

# Final summary
log "==============================================="
log "ဘီးကြဲ Deployment Complete! 🎉"
log "==============================================="
log "Application URL: http://${SERVER_IP}"
log "Database: ${DB_NAME}"
log "Database User: ${DB_USER}"
log "Database Password: ${DB_PASSWORD}"
log "Credentials saved to: /root/bee-kyal-credentials.txt"
log "Update script: update-bee-kyal.sh"
log "Backup script: backup-bee-kyal.sh"
log "==============================================="
log "Next steps:"
log "1. Test the application: curl http://${SERVER_IP}"
log "2. Check logs: tail -f ${APP_DIR}/storage/logs/laravel.log"
log "3. To update: sudo update-bee-kyal.sh"
log "4. To backup: sudo backup-bee-kyal.sh"
log "==============================================="
