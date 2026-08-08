#!/usr/bin/env bash
set -euo pipefail

# mini-pos LAN deployment setup for Linux (HTTP only)
#  - detects the machine's LAN IP
#  - installs Docker (+ Compose) via get.docker.com if missing
#  - adds the current user to the docker group
#  - builds & starts the stack, reachable at http://<LAN_IP>:<APP_PORT>
#
# Extra modes:
#   ./install.sh update-ip    - detect the LAN IP; if it changed, recreate the stack
#                               with the new APP_URL (used by the cron job)
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
    # Try to get IP from default route interface
    local iface
    iface=$(ip route show default 2>/dev/null | awk '/^default/ {print $5; exit}')
    if [ -n "$iface" ]; then
        ip=$(ip -4 -o addr show dev "$iface" 2>/dev/null | awk '{print $4; exit}' | cut -d/ -f1)
    fi
    # Fallback to hostname -I
    if [ -z "$ip" ] && command -v hostname >/dev/null 2>&1; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    echo "$ip"
}

update_env() {
    local ip="$1"
    local protocol="$APP_PROTOCOL"

    # Create .env if it doesn't exist
    [ ! -f "$ENV_FILE" ] && touch "$ENV_FILE"

    # Update or add environment variables
    cat > "$ENV_FILE" <<EOF
# Application
APP_NAME=${APP_NAME}
APP_URL=${protocol}://${ip}:${APP_PORT}
APP_ENV=production
APP_DEBUG=false

# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

# Database (for migrations/seeders)
MYSQL_DATABASE=${DB_DATABASE}
MYSQL_USER=${DB_USERNAME}
MYSQL_PASSWORD=${DB_PASSWORD}
MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
# CACHE_PREFIX=

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

    ok "Updated $ENV_FILE with database configuration"
}

ensure_docker() {
    if command -v docker >/dev/null 2>&1; then
        info "Docker found: $(docker --version 2>/dev/null || true)"
    else
        info "Docker not found. Installing via get.docker.com..."
        curl -fsSL https://get.docker.com | sudo sh
        ok "Docker installed."
    fi

    if ! docker compose version >/dev/null 2>&1; then
        die "Docker Compose plugin is missing. Restart Docker and re-run this script."
    fi

    if command -v systemctl >/dev/null 2>&1; then
        sudo systemctl enable --now docker >/dev/null 2>&1 || true
    fi
    ok "Docker and Compose are ready."
}

ensure_docker_group() {
    if groups "$USER" 2>/dev/null | grep -q "\bdocker\b"; then
        ok "User '$USER' is already in the docker group."
        return 0
    fi

    info "Adding user '$USER' to the docker group..."
    sudo usermod -aG docker "$USER"
    warn "User added to the docker group. Log out and back in for it to take effect."
    warn "Continuing this run using 'sudo' for docker commands."
}

configure_firewall() {
    # Configure firewall if UFW is installed and active
    if command -v ufw >/dev/null 2>&1; then
        if sudo ufw status | grep -q "Status: active"; then
            info "Configuring UFW firewall..."
            sudo ufw allow "${APP_PORT}/tcp" comment 'mini-pos HTTP'
            sudo ufw reload
            ok "UFW configured"
        fi
    fi

    # Configure firewalld if available
    if command -v firewall-cmd >/dev/null 2>&1; then
        if sudo firewall-cmd --state 2>/dev/null | grep -q "running"; then
            info "Configuring firewalld..."
            sudo firewall-cmd --permanent --add-port="${APP_PORT}/tcp" --zone=public
            sudo firewall-cmd --reload
            ok "firewalld configured"
        fi
    fi
}

wait_for_db() {
    info "Waiting for MySQL to be ready..."
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker compose exec -T db mysqladmin ping -h localhost --silent 2>/dev/null; then
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

run_migrations() {
    info "Running database migrations..."
    sleep 5

    # Wait for MySQL to be ready and run migrations
    if wait_for_db; then
        info "Setting up database tables..."
        docker compose exec -T app php artisan migrate --force || {
            warn "Migration failed. You may need to run: docker compose exec app php artisan migrate"
        }
    fi
}

start_stack() {
    local ip="$1"

    if [ ! -f docker-compose.yml ]; then
        warn "docker-compose.yml not found in $SCRIPT_DIR; skipping build/start."
        return 0
    fi

    info "Building and starting the stack with MySQL..."
    info "First build downloads dependencies and may take a while."

    # Start the stack with MySQL
    APP_URL="${APP_PROTOCOL}://${ip}:${APP_PORT}" \
    APP_PORT="$APP_PORT" \
    DB_DATABASE="${DB_DATABASE}" \
    DB_USERNAME="${DB_USERNAME}" \
    DB_PASSWORD="${DB_PASSWORD}" \
    DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD}" \
        docker compose up -d --build

    # Wait for containers to be ready
    info "Waiting for containers to be ready..."
    sleep 5

    # Check if containers are running
    if docker compose ps | grep -q "Up"; then
        ok "Stack is running"

        # Run migrations
        run_migrations

        info ""
        info "Database credentials:"
        info "  Database: ${DB_DATABASE}"
        info "  Username: ${DB_USERNAME}"
        info "  Password: ${DB_PASSWORD}"
        info "  Root password: ${DB_ROOT_PASSWORD}"
    else
        warn "Containers may not have started properly. Check with: docker compose ps"
        warn "Check logs with: docker compose logs"
    fi
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

    # Update .env file
    update_env "$ip"

    if [ -f docker-compose.yml ]; then
        info "Recreating stack with APP_URL=${APP_PROTOCOL}://${ip}:${APP_PORT} ..."
        APP_URL="${APP_PROTOCOL}://${ip}:${APP_PORT}" \
        APP_PORT="$APP_PORT" \
        DB_DATABASE="${DB_DATABASE}" \
        DB_USERNAME="${DB_USERNAME}" \
        DB_PASSWORD="${DB_PASSWORD}" \
        DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD}" \
            docker compose up -d
        ok "Stack updated to ${APP_PROTOCOL}://${ip}:${APP_PORT}"
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
        update-ip)
            # Check if running with proper permissions
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

            info "mini-pos Docker setup with MySQL - $SCRIPT_DIR"

            LAN_IP="$(detect_lan_ip)"
            [ -z "$LAN_IP" ] && die "Could not detect the LAN IP. Set APP_IP=<ip> and re-run."

            ok "Detected LAN IP: $LAN_IP"
            ok "Using protocol: $APP_PROTOCOL (HTTP)"
            ok "Using port: $APP_PORT"
            ok "Using database: MySQL (${DB_DATABASE})"

            save_ip_state "$LAN_IP"
            ensure_docker
            ensure_docker_group

            # Update .env file
            update_env "$LAN_IP"

            configure_firewall

            # Start Docker stack
            start_stack "$LAN_IP"

            ok "Setup complete!"
            info ""
            info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            info "Access your app at: ${APP_PROTOCOL}://${LAN_IP}:${APP_PORT}"
            info ""
            info "Database credentials (keep this safe):"
            info "  Database: ${DB_DATABASE}"
            info "  Username: ${DB_USERNAME}"
            info "  Password: ${DB_PASSWORD}"
            info "  Root password: ${DB_ROOT_PASSWORD}"
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
