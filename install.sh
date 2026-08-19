#!/usr/bin/env bash
set -euo pipefail

# mini-pos LAN deployment setup for Linux (Nginx + PHP-FPM + MySQL/MariaDB)
#  - detects the machine's LAN IP
#  - installs Nginx, PHP-FPM, MySQL, Composer if missing
#  - configures nginx vhost, creates database, runs Laravel setup
#  - reachable at http://<LAN_IP>:<APP_PORT>
#
# Extra modes:
#   ./install.sh --build      - pull latest code, install deps, rebuild assets
#   ./install.sh update-ip    - detect the LAN IP; if it changed, update .env
#                               and reload nginx (used by the cron job)
#   sudo ./install.sh setup-cron - install a cron job (default daily at 09:00) that
#                                  runs "update-ip" to follow a dynamic LAN IP
#
# Usage:
#   ./install.sh                 # default port 80
#   APP_PORT=8080 ./install.sh   # custom port
#   APP_IP=192.168.1.50 ./install.sh  # skip detection, use a fixed IP
#   DB_PASSWORD=mysecret ./install.sh  # custom MySQL password

APP_NAME="${APP_NAME:-mini-pos}"
APP_PORT="${APP_PORT:-80}"
APP_IP="${APP_IP:-}"
APP_PROTOCOL="http"

# Database configuration
DB_DATABASE="${DB_DATABASE:-minipos}"
DB_USERNAME="${DB_USERNAME:-minipos}"
DB_PASSWORD="${DB_PASSWORD:-secret}"
DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD:-rootsecret}"

# Detect PHP version (check what's installed, fallback to 8.3)
detect_php_version() {
    # Try to find an installed php-fpm binary
    local ver
    ver=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || true)
    if [ -n "$ver" ]; then
        echo "$ver"
        return 0
    fi
    # Check available php*-fpm packages
    local available
    available=$(apt-cache search 'php[0-9]' 2>/dev/null | grep -oP 'php\K[0-9]+\.[0-9]+' | sort -V | tail -1 || true)
    if [ -n "$available" ]; then
        echo "$available"
        return 0
    fi
    echo "8.3"
}

detect_mysql_package() {
    # Fallback to generic mariadb-server
    if apt-cache show "mariadb-server" >/dev/null 2>&1; then
        echo "mariadb-server"
        return 0
    fi
    # Last resort: MySQL
    for pkg in default-mysql-server mysql-server-8.0 mysql-server; do
        if apt-cache show "$pkg" >/dev/null 2>&1; then
            echo "$pkg"
            return 0
        fi
    done
    echo "mariadb-server"
}

PHP_VERSION="8.3"
MYSQL_PACKAGE="mariadb-server"

C_RED=$'\033[31m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'
C_CYAN=$'\033[36m'; C_RESET=$'\033[0m'

info() { printf "[INFO] %s\n" "$*"; }
ok()   { printf "[%sOK%s] %s\n" "$C_GREEN" "$C_RESET" "$*"; }
warn() { printf "[%sWARN%s] %s\n" "$C_YELLOW" "$C_RESET" "$*"; }
die()  { printf "[%sERROR%s] %s\n" "$C_RED" "$C_RESET" "$*" >&2; exit 1; }

# Linux-only check
if [ "$(uname -s)" != "Linux" ]; then
    die "This script is for Linux only. Current OS: $(uname -s)"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE="$SCRIPT_DIR/.env"

detect_lan_ip() {
    [ -n "$APP_IP" ] && { echo "$APP_IP"; return 0; }

    local ip=""
    local iface
    iface=$(ip route show default 2>/dev/null | awk '/^default/ {print $5; exit}')
    if [ -n "$iface" ]; then
        ip=$(ip -4 -o addr show dev "$iface" 2>/dev/null | awk '{print $4; exit}' | cut -d/ -f1)
    fi
    if [ -z "$ip" ] && command -v hostname >/dev/null 2>&1; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    echo "$ip"
}

update_env() {
    local ip="$1"
    local protocol="$APP_PROTOCOL"

    [ ! -f "$ENV_FILE" ] && touch "$ENV_FILE"

    cat > "$ENV_FILE" <<EOF
# Application
APP_NAME=${APP_NAME}
APP_URL=${protocol}://${ip}:${APP_PORT}
APP_ENV=local
APP_DEBUG=false

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"

IS_MOBILE_APP=false
EOF

    ok "Updated $ENV_FILE"
}

install_packages() {
    info "Updating package lists..."
    sudo apt-get update -qq

    # Detect versions now that apt cache is populated
    PHP_VERSION="$(detect_php_version)"
    MYSQL_PACKAGE="$(detect_mysql_package)"
    export PHP_VERSION MYSQL_PACKAGE

    # Check if PHP FPM package exists for our detected version
    if ! apt-cache show "php${PHP_VERSION}-fpm" >/dev/null 2>&1; then
        info "PHP ${PHP_VERSION} not in default repos. Adding ondrej/php PPA..."
        sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq software-properties-common
        sudo add-apt-repository -y ppa:ondrej/php
        sudo apt-get update -qq
    fi

    info "Installing Nginx, PHP ${PHP_VERSION}-FPM, MySQL/MariaDB, and dependencies..."
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
        nginx \
        dnsmasq \
        "${MYSQL_PACKAGE}" \
        "php${PHP_VERSION}-fpm" \
        "php${PHP_VERSION}-mysql" \
        "php${PHP_VERSION}-mbstring" \
        "php${PHP_VERSION}-xml" \
        "php${PHP_VERSION}-curl" \
        "php${PHP_VERSION}-gd" \
        "php${PHP_VERSION}-zip" \
        "php${PHP_VERSION}-bcmath" \
        "php${PHP_VERSION}-intl" \
        unzip \
        curl

    # exif may be bundled in core for newer PHP versions
    sudo apt-get install -y -qq "php${PHP_VERSION}-exif" 2>/dev/null || true

    ok "Packages installed (PHP ${PHP_VERSION}, ${MYSQL_PACKAGE})."
}

install_composer() {
    if command -v composer >/dev/null 2>&1; then
        info "Composer found: $(composer --version 2>/dev/null || true)"
        return 0
    fi

    info "Installing Composer from getcomposer.org..."
    local tmp
    tmp="$(mktemp)"
    curl -sS https://getcomposer.org/installer -o "$tmp"
    sudo php "$tmp" --install-dir=/usr/local/bin --filename=composer
    rm -f "$tmp"
    ok "Composer installed."
}

ensure_php_extensions() {
    info "Checking PHP extensions..."
    local required=(pdo_mysql mbstring exif bcmath gd zip xml curl intl)
    local missing=()

    for ext in "${required[@]}"; do
        if ! php -m 2>/dev/null | grep -qi "^${ext}$"; then
            missing+=("$ext")
        fi
    done

    if [ ${#missing[@]} -gt 0 ]; then
        warn "Missing PHP extensions: ${missing[*]}"
        warn "They should have been installed with php${PHP_VERSION}-* packages."
    else
        ok "All required PHP extensions are loaded."
    fi
}

configure_dnsmasq() {
    local lan_ip="$1"
    info "Configuring dnsmasq for bee-kyal.lan -> ${lan_ip}..."

    sudo tee /etc/dnsmasq.d/bee-kyal.conf >/dev/null <<EOF
# Resolve bee-kyal.lan to the local server
address=/bee-kyal.lan/${lan_ip}
EOF

    sudo systemctl enable --now dnsmasq 2>/dev/null || sudo systemctl restart dnsmasq
    ok "dnsmasq configured: bee-kyal.lan -> ${lan_ip}"
}

configure_nginx() {
    local lan_ip="$1"
    info "Configuring Nginx..."
    local vhost="/etc/nginx/sites-available/${APP_NAME}"
    local enabled="/etc/nginx/sites-enabled/${APP_NAME}"

    sudo tee "$vhost" >/dev/null <<EOF
server {
    listen ${APP_PORT};
    server_name _ bee-kyal.lan ${lan_ip};
    root ${SCRIPT_DIR}/public;
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
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

    sudo ln -sf "$vhost" "$enabled"

    # Remove default site if it exists
    sudo rm -f /etc/nginx/sites-enabled/default

    # Test nginx config
    if sudo nginx -t 2>/dev/null; then
        ok "Nginx configured."
    else
        die "Nginx configuration test failed."
    fi
}

setup_database() {
    info "Setting up MySQL/MariaDB database..."

    # Start MySQL/MariaDB if not running (try both service names)
    if sudo systemctl is-active --quiet mysql 2>/dev/null; then
        : # already running
    elif sudo systemctl is-active --quiet mariadb 2>/dev/null; then
        : # already running
    elif sudo systemctl start mysql 2>/dev/null; then
        : # started as mysql
    else
        sudo systemctl start mariadb 2>/dev/null || true
    fi

    # Configure root user with full privileges and password
    info "Configuring MySQL root user..."
    sudo mysql -e "
        ALTER USER 'root'@'localhost' IDENTIFIED BY 'asdffdsa';
        GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
        FLUSH PRIVILEGES;
    " 2>/dev/null || warn "Root user may already be configured."

    # Create database and application user
    sudo mysql -e "
        CREATE DATABASE IF NOT EXISTS \`${DB_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE USER IF NOT EXISTS '${DB_USERNAME}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
        CREATE USER IF NOT EXISTS '${DB_USERNAME}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
        GRANT ALL PRIVILEGES ON \`${DB_DATABASE}\`.* TO '${DB_USERNAME}'@'127.0.0.1';
        GRANT ALL PRIVILEGES ON \`${DB_DATABASE}\`.* TO '${DB_USERNAME}'@'localhost';
        FLUSH PRIVILEGES;
    " 2>/dev/null || warn "Database/user may already exist."

    ok "Database '${DB_DATABASE}' ready. Root user has full privileges."
    info "Connect as root: sudo mysql"
}

wait_for_db() {
    info "Waiting for MySQL to be ready..."
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if mysqladmin ping -h 127.0.0.1 --silent 2>/dev/null; then
            ok "MySQL is ready!"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    echo ""
    warn "MySQL may not be ready. Continuing anyway..."
    return 0
}

configure_firewall() {
    if command -v ufw >/dev/null 2>&1; then
        if sudo ufw status | grep -q "Status: active"; then
            info "Configuring UFW firewall..."
            sudo ufw allow "${APP_PORT}/tcp" comment 'mini-pos HTTP'
            sudo ufw reload
            ok "UFW configured"
        fi
    fi

    if command -v firewall-cmd >/dev/null 2>&1; then
        if sudo firewall-cmd --state 2>/dev/null | grep -q "running"; then
            info "Configuring firewalld..."
            sudo firewall-cmd --permanent --add-port="${APP_PORT}/tcp" --zone=public
            sudo firewall-cmd --reload
            ok "firewalld configured"
        fi
    fi
}

setup_laravel() {
    info "Running Composer install..."
    composer install --no-dev --optimize-autoloader --no-interaction
    ok "Composer dependencies installed."

    info "Generating application key..."
    php artisan key:generate --force 2>/dev/null || true

    info "Running database migrations..."
    php artisan migrate --force 2>/dev/null || warn "Migrations may need manual attention."

    info "Creating storage link..."
    php artisan storage:link --force 2>/dev/null || true

    info "Caching config..."
    php artisan config:cache 2>/dev/null || true
    php artisan route:cache 2>/dev/null || true
    php artisan view:cache 2>/dev/null || true

    # Set permissions
    chmod -R 775 storage bootstrap/cache 2>/dev/null || true

    ok "Laravel setup complete."
}

build() {
    info "Pulling latest code..."
    git pull
    ok "Code updated."

    info "Installing Composer dependencies..."
    composer install --no-dev --optimize-autoloader --no-interaction
    ok "Composer dependencies installed."

    info "Installing npm dependencies..."
    npm install
    ok "npm dependencies installed."

    info "Building frontend assets..."
    npm run build
    ok "Frontend assets built."

    info "Clearing and rebuilding Laravel caches..."
    php artisan optimize:clear
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ok "Laravel caches rebuilt."

    info "Running migrations..."
    php artisan migrate --force 2>/dev/null || warn "Migrations may need manual attention."

    ok "Build complete!"
}

IP_STATE="/tmp/bee-kyal-lan-ip"

save_ip_state() {
    local ip="$1"
    printf '%s\n' "$ip" | sudo tee "$IP_STATE" >/dev/null
}

update_ip() {
    local ip current

    ip="$(detect_lan_ip)" || true
    [ -z "$ip" ] && die "Could not detect the LAN IP (set APP_IP=<ip> to override)."

    current=""
    [ -f "$IP_STATE" ] && current="$(cat "$IP_STATE" 2>/dev/null || true)"

    if [ -n "$current" ] && [ "$current" = "$ip" ]; then
        info "LAN IP unchanged ($ip) - nothing to do."
        return 0
    fi

    [ -n "$current" ] && warn "LAN IP changed: $current -> $ip"
    save_ip_state "$ip"

    update_env "$ip"

    # Reload nginx to pick up any changes
    if sudo nginx -t 2>/dev/null; then
        sudo systemctl reload nginx 2>/dev/null || true
        ok "Nginx reloaded with new APP_URL=${APP_PROTOCOL}://${ip}:${APP_PORT}"
    fi
}

setup_cron() {
    local interval="${CRON_INTERVAL:-0 9}"
    local script="$SCRIPT_DIR/install.sh"
    local logfile="/var/log/bee-kyal-ip.log"

    [ "$(id -u)" -eq 0 ] || die "setup-cron must run as root (use: sudo $0 setup-cron)"

    local cronfile="/etc/cron.d/bee-kyal-ip" tmp line
    line="$interval * * * * root $script update-ip >> $logfile 2>&1"
    tmp="$(mktemp)"
    grep -v "$script update-ip" "$cronfile" 2>/dev/null > "$tmp" || true
    printf '%s\n' "$line" >> "$tmp"
    mv "$tmp" "$cronfile"
    rm -f "$tmp"
    chmod 644 "$cronfile"
    ok "Installed cron job in $cronfile (daily at ${interval})."
    printf '    %s\n' "$line"
}

main() {
    case "${1:-}" in
        --build)
            if [ "$(id -u)" -eq 0 ]; then
                die "Run as a regular user (sudo is used internally when needed)."
            fi
            build
            ;;
        update-ip)
            if [ "$(id -u)" -ne 0 ]; then
                warn "Updating IP requires root privileges."
                exec sudo "$0" update-ip
                exit $?
            fi
            update_ip
            ;;
        setup-cron)
            setup_cron
            ;;
        *)
            if [ "$(id -u)" -eq 0 ]; then
                die "Run as a regular user (sudo is used internally when needed)."
            fi

            info "mini-pos LAMP setup (Nginx + PHP ${PHP_VERSION}-FPM + MySQL/MariaDB) - $SCRIPT_DIR"

            LAN_IP="$(detect_lan_ip)"
            [ -z "$LAN_IP" ] && die "Could not detect the LAN IP. Set APP_IP=<ip> and re-run."

            ok "Detected LAN IP: $LAN_IP"
            ok "Using port: $APP_PORT"

            save_ip_state "$LAN_IP"

            # Install system packages
            install_packages

            # Install Composer
            install_composer

            # Verify PHP extensions
            ensure_php_extensions

            # Configure Nginx
            configure_nginx "$LAN_IP"

            # Configure dnsmasq
            configure_dnsmasq "$LAN_IP"

            # Start services
            info "Starting MySQL/MariaDB..."
            sudo systemctl enable --now mysql 2>/dev/null || sudo systemctl enable --now mariadb 2>/dev/null || sudo systemctl start mysql 2>/dev/null || sudo systemctl start mariadb 2>/dev/null || true
            ok "MySQL/MariaDB started."

            info "Starting PHP-FPM..."
            sudo systemctl enable --now "php${PHP_VERSION}-fpm" 2>/dev/null || sudo systemctl start "php${PHP_VERSION}-fpm"
            ok "PHP-FPM started."

            info "Starting Nginx..."
            sudo systemctl enable --now nginx 2>/dev/null || sudo systemctl start nginx
            ok "Nginx started."

            # Setup database
            wait_for_db
            setup_database

            # Write .env
            update_env "$LAN_IP"

            # Install app dependencies and configure Laravel
            setup_laravel

            # Configure firewall
            configure_firewall

            ok "Setup complete!"
            info ""
            info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            info "Access your app at: ${APP_PROTOCOL}://${LAN_IP}:${APP_PORT}"
            info ""
            info "Database credentials (keep this safe):"
            info "  Database: ${DB_DATABASE}"
            info "  Username: ${DB_USERNAME}"
            info "  Password: ${DB_PASSWORD}"
            info ""
            info "To connect to MySQL from host:"
            info "  mysql -h 127.0.0.1 -P 3306 -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE}"
            info ""
            info "To update IP automatically, run: sudo $0 setup-cron"
            info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            ;;
    esac
}

main "$@"
