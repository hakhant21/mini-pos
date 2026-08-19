#!/usr/bin/env bash
set -euo pipefail

# mini-pos LAN deployment setup for Linux (Nginx + PHP-FPM + MySQL)
#  - detects the machine's LAN IP
#  - installs Nginx, PHP-FPM, MySQL (via .deb), Node.js, Composer, pnpm
#  - configures nginx vhost, dnsmasq, creates database, runs Laravel setup
#  - reachable at http://<LAN_IP>:<APP_PORT>
#
# Usage:
#   ./install.sh                 # full setup (same as --setup)
#   ./install.sh --setup         # full setup
#   ./install.sh --build         # pull code, install deps, rebuild assets
#   ./install.sh --restart       # restart all services
#   APP_PORT=8080 ./install.sh   # custom port
#   APP_IP=192.168.1.50 ./install.sh  # skip detection, use a fixed IP
#
# Internal modes (used by cron):
#   ./install.sh update-ip       - detect LAN IP; update .env if changed
#   sudo ./install.sh setup-cron - install daily cron job for update-ip

APP_NAME="${APP_NAME:-mini-pos}"
APP_PORT="${APP_PORT:-80}"
APP_IP="${APP_IP:-}"
APP_PROTOCOL="http"

DB_DATABASE="${DB_DATABASE:-minipos}"
DB_USERNAME="${DB_USERNAME:-pos}"
DB_PASSWORD="${DB_PASSWORD:-asdffdsa}"

MYSQL_DEB_URL="https://dev.mysql.com/get/mysql-apt-config_0.8.30-1_all.deb"
MYSQL_DEB_FILE="/tmp/mysql-apt-config.deb"

detect_php_version() {
    local ver
    ver=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || true)
    if [ -n "$ver" ]; then
        echo "$ver"
        return 0
    fi
    local available
    available=$(apt-cache search 'php[0-9]' 2>/dev/null | grep -oP 'php\K[0-9]+\.[0-9]+' | sort -V | tail -1 || true)
    if [ -n "$available" ]; then
        echo "$available"
        return 0
    fi
    echo "8.3"
}

PHP_VERSION="8.3"

C_RED=$'\033[31m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'
C_CYAN=$'\033[36m'; C_RESET=$'\033[0m'

info() { printf "[INFO] %s\n" "$*"; }
ok()   { printf "[%sOK%s] %s\n" "$C_GREEN" "$C_RESET" "$*"; }
warn() { printf "[%sWARN%s] %s\n" "$C_YELLOW" "$C_RESET" "$*"; }
die()  { printf "[%sERROR%s] %s\n" "$C_RED" "$C_RESET" "$*" >&2; exit 1; }

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
APP_DEBUG=true
APP_KEY=

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

    PHP_VERSION="$(detect_php_version)"
    export PHP_VERSION

    if ! apt-cache show "php${PHP_VERSION}-fpm" >/dev/null 2>&1; then
        info "PHP ${PHP_VERSION} not in default repos. Adding ondrej/php PPA..."
        sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq software-properties-common
        sudo add-apt-repository -y ppa:ondrej/php
        sudo apt-get update -qq
    fi

    info "Installing Nginx, PHP ${PHP_VERSION}-FPM, and dependencies..."
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
        nginx \
        dnsmasq \
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

    sudo apt-get install -y -qq "php${PHP_VERSION}-exif" 2>/dev/null || true

    ok "Packages installed (PHP ${PHP_VERSION})."
}

install_mysql() {
    if command -v mysql >/dev/null 2>&1 && mysql --version 2>/dev/null | grep -qi "mysql"; then
        info "MySQL found: $(mysql --version 2>/dev/null || true)"
        return 0
    fi

    info "Downloading MySQL APT config .deb..."
    curl -fsSL "$MYSQL_DEB_URL" -o "$MYSQL_DEB_FILE"

    info "Installing MySQL APT config via dpkg..."
    sudo dpkg -i "$MYSQL_DEB_FILE"
    rm -f "$MYSQL_DEB_FILE"

    info "Updating package lists for MySQL repo..."
    sudo apt-get update -qq

    info "Installing MySQL Server..."
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq mysql-server

    ok "MySQL installed: $(mysql --version 2>/dev/null || true)"
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

install_nodejs() {
    if command -v node >/dev/null 2>&1; then
        info "Node.js found: $(node --version 2>/dev/null || true)"
        return 0
    fi

    info "Installing Node.js from nodejs.org..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y -qq nodejs
    ok "Node.js installed: $(node --version 2>/dev/null || true)."
}

install_pnpm() {
    if command -v pnpm >/dev/null 2>&1; then
        info "pnpm found: $(pnpm --version 2>/dev/null || true)"
        return 0
    fi

    info "Installing pnpm..."
    sudo npm install -g pnpm
    ok "pnpm installed: $(pnpm --version 2>/dev/null || true)."
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

configure_hostname() {
    local current_hostname
    current_hostname=$(hostname 2>/dev/null || true)

    if [ "$current_hostname" = "pos" ]; then
        ok "Hostname already set to pos."
        return 0
    fi

    info "Setting hostname to pos..."
    sudo hostnamectl set-hostname pos 2>/dev/null || sudo hostname pos

    if ! grep -q "127.0.1.1.*pos" /etc/hosts 2>/dev/null; then
        echo "127.0.1.1 pos" | sudo tee -a /etc/hosts >/dev/null
    fi

    ok "Hostname set to pos."
}

configure_dnsmasq() {
    local lan_ip="$1"
    info "Configuring dnsmasq for bee-kyal.lan -> ${lan_ip}..."

    sudo tee /etc/dnsmasq.d/bee-kyal.conf >/dev/null <<EOF
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
    listen [::]:${APP_PORT};
    server_name bee-kyal.lan ${lan_ip};
    root ${SCRIPT_DIR}/public;
    index index.php;

    charset utf-8;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php\$ {
        fastcgi_pass unix:/var/run/php/php${PHP_VERSION}-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

    sudo ln -sf "$vhost" "$enabled"

    sudo rm -f /etc/nginx/sites-enabled/default
    sudo rm -f /etc/nginx/sites-available/default
    sudo rm -f /etc/nginx/conf.d/default.conf

    if grep -q "default_server" /etc/nginx/nginx.conf 2>/dev/null; then
        sudo sed -i '/listen.*default_server/d' /etc/nginx/nginx.conf 2>/dev/null || true
    fi

    if sudo nginx -t 2>/dev/null; then
        ok "Nginx configured."
    else
        die "Nginx configuration test failed."
    fi
}

setup_database() {
    info "Setting up MySQL database..."

    # Ensure MySQL is running
    sudo systemctl start mysql 2>/dev/null || true

    # Set root password and secure installation
    info "Configuring MySQL root user and securing installation..."
    sudo mysql -e "
        ALTER USER 'root'@'localhost' IDENTIFIED BY 'asdffdsa';
        DELETE FROM mysql.user WHERE User='';
        DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
        DROP DATABASE IF EXISTS test;
        DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
        FLUSH PRIVILEGES;
    " 2>/dev/null || warn "Root user may already be configured."

    # Create database and user
    info "Creating database '${DB_DATABASE}' and user '${DB_USERNAME}'..."
    sudo mysql -u root -p'asdffdsa' -e "
        CREATE DATABASE IF NOT EXISTS \`${DB_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE USER IF NOT EXISTS '${DB_USERNAME}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
        CREATE USER IF NOT EXISTS '${DB_USERNAME}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
        GRANT ALL PRIVILEGES ON \`${DB_DATABASE}\`.* TO '${DB_USERNAME}'@'127.0.0.1';
        GRANT ALL PRIVILEGES ON \`${DB_DATABASE}\`.* TO '${DB_USERNAME}'@'localhost';
        FLUSH PRIVILEGES;
    " 2>/dev/null || warn "Database/user may already exist."

    ok "Database '${DB_DATABASE}' ready. User '${DB_USERNAME}'@'localhost'."
    info "Connect: mysql -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE}"
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
    composer update
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

    chmod -R 775 storage bootstrap/cache 2>/dev/null || true

    ok "Laravel setup complete."
}

build() {
    info "Pulling latest code..."
    git pull
    ok "Code updated."

    install_nodejs
    install_pnpm

    info "Installing Composer dependencies..."
    composer update
    ok "Composer dependencies installed."

    info "Installing pnpm dependencies..."
    pnpm install
    ok "pnpm dependencies installed."

    info "Approving all build scripts..."
    pnpm approve-builds --all 2>/dev/null || true

    info "Building frontend assets..."
    pnpm run build
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

restart_services() {
    info "Restarting MySQL..."
    sudo systemctl restart mysql 2>/dev/null || true
    ok "MySQL restarted."

    info "Restarting PHP-FPM..."
    sudo systemctl restart "php${PHP_VERSION}-fpm" 2>/dev/null || true
    ok "PHP-FPM restarted."

    info "Restarting Nginx..."
    sudo systemctl restart nginx
    ok "Nginx restarted."

    info "Restarting dnsmasq..."
    sudo systemctl restart dnsmasq 2>/dev/null || true
    ok "dnsmasq restarted."

    ok "All services restarted."
}

run_setup() {
    if [ "$(id -u)" -eq 0 ]; then
        die "Run as a regular user (sudo is used internally when needed)."
    fi

    info "mini-pos setup (Nginx + PHP ${PHP_VERSION}-FPM + MySQL) - $SCRIPT_DIR"

    LAN_IP="$(detect_lan_ip)"
    [ -z "$LAN_IP" ] && die "Could not detect the LAN IP. Set APP_IP=<ip> and re-run."

    ok "Detected LAN IP: $LAN_IP"
    ok "Using port: $APP_PORT"

    save_ip_state "$LAN_IP"

    configure_hostname
    install_packages
    install_mysql
    install_composer
    install_nodejs
    install_pnpm
    ensure_php_extensions
    configure_nginx "$LAN_IP"
    configure_dnsmasq "$LAN_IP"

    info "Starting MySQL..."
    sudo systemctl enable --now mysql 2>/dev/null || sudo systemctl start mysql 2>/dev/null || true
    ok "MySQL started."

    info "Starting PHP-FPM..."
    sudo systemctl enable --now "php${PHP_VERSION}-fpm" 2>/dev/null || sudo systemctl start "php${PHP_VERSION}-fpm"
    ok "PHP-FPM started."

    info "Starting Nginx..."
    sudo systemctl enable --now nginx 2>/dev/null || sudo systemctl start nginx
    ok "Nginx started."

    wait_for_db
    setup_database
    update_env "$LAN_IP"
    setup_laravel
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
    info "  Root password: asdffdsa"
    info ""
    info "To connect to MySQL:"
    info "  mysql -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE}"
    info "  sudo mysql -p'asdffdsa'  (as root)"
    info ""
    info "To update IP automatically, run: sudo $0 setup-cron"
    info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

main() {
    case "${1:-}" in
        --setup)
            run_setup
            ;;
        --build)
            if [ "$(id -u)" -eq 0 ]; then
                die "Run as a regular user (sudo is used internally when needed)."
            fi
            build
            ;;
        --restart)
            if [ "$(id -u)" -ne 0 ]; then
                warn "Restarting services requires root privileges."
                exec sudo "$0" --restart
                exit $?
            fi
            restart_services
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
            run_setup
            ;;
    esac
}

main "$@"
