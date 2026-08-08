#!/usr/bin/env bash
set -euo pipefail

# mini-pos LAN deployment setup for Linux (HTTP only)
#  - detects the machine's LAN IP
#  - installs Docker (+ Compose) via get.docker.com if missing
#  - adds the current user to the docker group
#  - installs and configures Caddy as reverse proxy
#  - builds & starts the stack, reachable at http://<LAN_IP>:<APP_PORT>
#  - adds bee-kyal.lan to /etc/hosts with the detected IP
#
# Extra modes:
#   ./install.sh update-ip    - detect the LAN IP; if it changed, recreate the stack
#                               with the new APP_URL (used by the cron job)
#   sudo ./install.sh setup-cron - install a cron job (default daily at 09:00) that
#                                  runs "update-ip" to follow a dynamic LAN IP
#   sudo ./install.sh uninstall - remove Caddy and clean up
#
# Usage:
#   ./install.sh                 # default port 80
#   APP_PORT=8080 ./install.sh   # custom port
#   APP_IP=192.168.1.50 ./install.sh  # skip detection, use a fixed IP
#   DB_PASSWORD=mysecret ./install.sh  # custom MySQL password
#   SKIP_CADDY=true ./install.sh  # skip Caddy installation

APP_PORT="${APP_PORT:-80}"
APP_IP="${APP_IP:-}"
APP_DOMAIN="${APP_DOMAIN:-bee-kyal.lan}"
APP_PROTOCOL="http"
SKIP_CADDY="${SKIP_CADDY:-false}"

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

HOSTS_FILE="/etc/hosts"
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

update_hosts() {
    local ip="$1"
    local domain="$APP_DOMAIN"

    info "Updating hosts file with $domain -> $ip"

    # Remove any existing entries for this domain
    sudo sed -i "/^.*$domain/d" "$HOSTS_FILE" 2>/dev/null || true

    # Add the new entry
    echo "$ip $domain" | sudo tee -a "$HOSTS_FILE" >/dev/null

    # Also add localhost entry
    if ! grep -q "127.0.0.1.*$domain" "$HOSTS_FILE" 2>/dev/null; then
        echo "127.0.0.1 $domain" | sudo tee -a "$HOSTS_FILE" >/dev/null
    fi

    ok "Updated $HOSTS_FILE with $domain -> $ip"
}

update_env() {
    local ip="$1"
    local domain="$APP_DOMAIN"
    local protocol="$APP_PROTOCOL"

    # Create .env if it doesn't exist
    [ ! -f "$ENV_FILE" ] && touch "$ENV_FILE"

    # Update or add environment variables
    cat > "$ENV_FILE" <<EOF
# Application
APP_URL=${protocol}://${domain}:${APP_PORT}
APP_DOMAIN=${domain}
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

install_caddy() {
    if [ "$SKIP_CADDY" = "true" ]; then
        info "Skipping Caddy installation (SKIP_CADDY=true)"
        return 0
    fi

    if command -v caddy >/dev/null 2>&1; then
        ok "Caddy already installed: $(caddy version)"
        return 0
    fi

    info "Installing Caddy reverse proxy..."

    # Detect distribution and install
    if command -v apt-get >/dev/null 2>&1; then
        # Debian/Ubuntu
        sudo apt-get update
        sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
        sudo apt-get update
        sudo apt-get install -y caddy
    elif command -v yum >/dev/null 2>&1; then
        # RHEL/CentOS
        sudo yum install -y yum-utils
        sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        sudo yum install -y caddy
    elif command -v dnf >/dev/null 2>&1; then
        # Fedora
        sudo dnf install -y dnf-plugins-core
        sudo dnf copr enable @caddy/caddy
        sudo dnf install -y caddy
    else
        warn "Unsupported package manager. Installing Caddy from binary..."
        # Generic Linux installation
        CADDY_VERSION=$(curl -s https://api.github.com/repos/caddyserver/caddy/releases/latest | grep tag_name | cut -d '"' -f 4)
        CADDY_URL="https://github.com/caddyserver/caddy/releases/download/${CADDY_VERSION}/caddy_${CADDY_VERSION#v}_linux_amd64.tar.gz"
        curl -L "$CADDY_URL" | sudo tar -xz -C /usr/local/bin caddy
        sudo chmod +x /usr/local/bin/caddy
    fi

    ok "Caddy installed successfully"
}

configure_caddy() {
    if [ "$SKIP_CADDY" = "true" ]; then
        info "Skipping Caddy configuration (SKIP_CADDY=true)"
        return 0
    fi

    local ip="$1"
    local caddyfile="/etc/caddy/Caddyfile"

    info "Configuring Caddy..."

    sudo mkdir -p /etc/caddy
    sudo mkdir -p /var/log/caddy
    sudo mkdir -p /var/www/html

    # Set proper permissions
    sudo chown -R caddy:caddy /var/log/caddy 2>/dev/null || true
    sudo chown -R caddy:caddy /var/www/html 2>/dev/null || true
    sudo chmod 755 /var/log/caddy 2>/dev/null || true
    sudo chmod 755 /var/www/html 2>/dev/null || true

    # Create a backup if Caddyfile exists
    if [ -f "$caddyfile" ]; then
        sudo cp "$caddyfile" "${caddyfile}.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    # Write new Caddyfile
    sudo tee "$caddyfile" > /dev/null <<EOF
# mini-pos Caddy configuration
# App domain
${APP_DOMAIN}:${APP_PORT} {
    reverse_proxy 127.0.0.1:${APP_PORT}

    # Security headers
    header {
        # Enable HSTS
        Strict-Transport-Security "max-age=63072000"
        # Prevent MIME type sniffing
        X-Content-Type-Options "nosniff"
        # Enable XSS protection
        X-XSS-Protection "1; mode=block"
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"
        # Referrer policy
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    # Logs
    log {
        output file /var/log/caddy/${APP_DOMAIN}.log
        format json
    }
}

# IP-based access (redirects to domain)
${ip}:${APP_PORT} {
    redir http://${APP_DOMAIN}:${APP_PORT} permanent
}

# Localhost access
127.0.0.1:${APP_PORT} {
    reverse_proxy 127.0.0.1:${APP_PORT}
}
EOF

    # Set proper permissions
    sudo chown caddy:caddy "$caddyfile" 2>/dev/null || true
    sudo chmod 644 "$caddyfile"

    ok "Caddy configured"
}

setup_caddy_service() {
    if [ "$SKIP_CADDY" = "true" ]; then
        info "Skipping Caddy service setup (SKIP_CADDY=true)"
        return 0
    fi

    info "Setting up Caddy service..."

    # Reload systemd
    sudo systemctl daemon-reload

    # Enable and start Caddy
    sudo systemctl enable caddy
    sudo systemctl restart caddy

    # Check status
    sleep 2
    if sudo systemctl is-active caddy >/dev/null 2>&1; then
        ok "Caddy service is running"
    else
        warn "Caddy service failed to start. Check with: sudo systemctl status caddy"
        warn "Check logs with: sudo journalctl -u caddy -n 50"
    fi
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
    APP_URL="${APP_PROTOCOL}://${APP_DOMAIN}:${APP_PORT}" \
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

    # Update hosts file
    update_hosts "$ip"

    # Update .env file
    update_env "$ip"

    # Update Caddy configuration if not skipped
    if [ "$SKIP_CADDY" != "true" ] && [ -f /etc/caddy/Caddyfile ]; then
        configure_caddy "$ip"
        sudo systemctl reload caddy
    fi

    if [ -f docker-compose.yml ]; then
        info "Recreating stack with APP_URL=${APP_PROTOCOL}://${APP_DOMAIN}:${APP_PORT} ..."
        APP_URL="${APP_PROTOCOL}://${APP_DOMAIN}:${APP_PORT}" \
        APP_PORT="$APP_PORT" \
        DB_DATABASE="${DB_DATABASE}" \
        DB_USERNAME="${DB_USERNAME}" \
        DB_PASSWORD="${DB_PASSWORD}" \
        DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD}" \
            docker compose up -d
        ok "Stack updated to ${APP_PROTOCOL}://${APP_DOMAIN}:${APP_PORT} (IP: ${ip})"
    fi
}

uninstall_caddy() {
    if [ "$(id -u)" -ne 0 ]; then
        die "Uninstall must run as root (use: sudo $0 uninstall)"
    fi

    info "Uninstalling Caddy..."

    # Stop and disable service
    if systemctl is-active caddy >/dev/null 2>&1; then
        systemctl stop caddy
    fi
    systemctl disable caddy 2>/dev/null || true

    # Remove package
    if command -v apt-get >/dev/null 2>&1; then
        apt-get remove -y caddy 2>/dev/null || true
    elif command -v yum >/dev/null 2>&1; then
        yum remove -y caddy 2>/dev/null || true
    elif command -v dnf >/dev/null 2>&1; then
        dnf remove -y caddy 2>/dev/null || true
    fi

    # Remove files
    rm -rf /etc/caddy
    rm -rf /var/log/caddy
    rm -f /usr/local/bin/caddy

    ok "Caddy uninstalled"
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
    # Check for internal commands first
    case "${1:-}" in
        update-hosts-internal)
            shift
            update_hosts "$@"
            exit 0
            ;;
    esac

    case "${1:-}" in
        update-ip)
            # Check if running with proper permissions for hosts file
            if [ "$(id -u)" -ne 0 ]; then
                warn "Updating hosts file requires root privileges."
                exec sudo "$0" update-ip
                exit $?
            fi
            update_ip
            ;;
        setup-cron)
            setup_cron
            ;;
        uninstall)
            uninstall_caddy
            ;;
        *)
            if [ "$(id -u)" -eq 0 ]; then
                die "Run as a regular user (sudo is used internally when needed)."
            fi

            info "mini-pos Docker setup with MySQL and Caddy - $SCRIPT_DIR"

            LAN_IP="$(detect_lan_ip)"
            [ -z "$LAN_IP" ] && die "Could not detect the LAN IP. Set APP_IP=<ip> and re-run."

            ok "Detected LAN IP: $LAN_IP"
            ok "Using domain: $APP_DOMAIN"
            ok "Using protocol: $APP_PROTOCOL (HTTP)"
            ok "Using port: $APP_PORT"
            ok "Using database: MySQL (${DB_DATABASE})"
            ok "Caddy: $([ "$SKIP_CADDY" = "true" ] && echo "SKIPPED" || echo "ENABLED")"

            save_ip_state "$LAN_IP"
            ensure_docker
            ensure_docker_group

            # Update hosts file (requires sudo)
            if [ "$(id -u)" -eq 0 ]; then
                update_hosts "$LAN_IP"
                update_env "$LAN_IP"
            else
                warn "Updating hosts file requires root privileges."
                warn "Running update_hosts with sudo..."
                sudo "$0" update-hosts-internal "$LAN_IP"
                update_env "$LAN_IP"
            fi

            # Install and configure Caddy
            install_caddy
            configure_caddy "$LAN_IP"
            setup_caddy_service
            configure_firewall

            # Start Docker stack
            start_stack "$LAN_IP"

            ok "Setup complete!"
            info ""
            info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            info "Access your app at: ${APP_PROTOCOL}://${APP_DOMAIN}:${APP_PORT}"
            info "Or via IP: ${APP_PROTOCOL}://${LAN_IP}:${APP_PORT}"
            info ""
            if [ "$SKIP_CADDY" != "true" ]; then
                info "Caddy is proxying requests to your app container"
                info "Caddy logs: /var/log/caddy/${APP_DOMAIN}.log"
                info "Caddy config: /etc/caddy/Caddyfile"
                info ""
                info "Useful Caddy commands:"
                info "  - Check status: sudo systemctl status caddy"
                info "  - View logs: sudo journalctl -u caddy -f"
                info "  - Reload config: sudo systemctl reload caddy"
                info ""
            fi
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
            info "To uninstall Caddy, run: sudo $0 uninstall"
            info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            ;;
    esac
}

main "$@"
