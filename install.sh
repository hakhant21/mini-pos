#!/usr/bin/env bash
set -euo pipefail

# mini-pos LAN deployment setup with HTTPS
#  - detects the machine's LAN IP
#  - installs Docker (+ Compose) via get.docker.com if missing
#  - adds the current user to the docker group
#  - builds & starts the stack with HTTPS via Caddy
#  - adds bee-kyal.local to /etc/hosts with the detected IP
#
# Extra modes:
#   ./install.sh update-ip    - detect the LAN IP; if it changed, recreate the stack
#                               with the new APP_URL (used by the cron job)
#   sudo ./install.sh setup-cron - install a cron job (default daily at 09:00) that
#                                  runs "update-ip" to follow a dynamic LAN IP
#
# Usage:
#   ./install.sh                 # default port 443 (HTTPS)
#   APP_PORT=8443 ./install.sh   # custom HTTPS port

APP_PORT="${APP_PORT:-443}"
APP_IP="${APP_IP:-}"
APP_DOMAIN="${APP_DOMAIN:-bee-kyal.local}"
APP_PROTOCOL="${APP_PROTOCOL:-https}"

C_RED=$'\033[31m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'
C_CYAN=$'\033[36m'; C_RESET=$'\033[0m'

info() { printf "[INFO] %s\n" "$*"; }
ok()   { printf "[%sOK%s] %s\n" "$C_GREEN" "$C_RESET" "$*"; }
warn() { printf "[%sWARN%s] %s\n" "$C_YELLOW" "$C_RESET" "$*"; }
die()  { printf "[%sERROR%s] %s\n" "$C_RED" "$C_RESET" "$*" >&2; exit 1; }

IS_MAC=false
[ "$(uname -s)" = "Darwin" ] && IS_MAC=true

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SUDO_PREFIX=""
HOSTS_FILE="/etc/hosts"
ENV_FILE="$SCRIPT_DIR/.env"
CADDY_ROOT_CRT="$SCRIPT_DIR/caddy-root.crt"

detect_lan_ip() {
    [ -n "$APP_IP" ] && { echo "$APP_IP"; return 0; }

    local ip=""
    if $IS_MAC; then
        for iface in en0 en1; do
            ip=$(ipconfig getifaddr "$iface" 2>/dev/null || true)
            [ -n "$ip" ] && break
        done
    else
        if command -v ip >/dev/null 2>&1; then
            local iface
            iface=$(ip route show default 2>/dev/null | awk '/^default/ {print $5; exit}')
            [ -n "$iface" ] && ip=$(ip -4 -o addr show dev "$iface" 2>/dev/null | awk '{print $4; exit}' | cut -d/ -f1)
        fi
        if [ -z "$ip" ] && command -v hostname >/dev/null 2>&1; then
            ip=$(hostname -I 2>/dev/null | awk '{print $1}')
        fi
    fi
    echo "$ip"
}

update_hosts() {
    local ip="$1"
    local domain="$APP_DOMAIN"

    if $IS_MAC; then
        # macOS uses a different approach
        if grep -q "^127.0.0.1.*$domain" "$HOSTS_FILE"; then
            sudo sed -i '' "/^127.0.0.1.*$domain/d" "$HOSTS_FILE"
        fi
        if grep -q "^$ip.*$domain" "$HOSTS_FILE"; then
            # Update existing entry
            sudo sed -i '' "s/^$ip.*$domain.*/$ip $domain/" "$HOSTS_FILE"
        else
            # Add new entry
            echo "$ip $domain" | sudo tee -a "$HOSTS_FILE" >/dev/null
        fi
    else
        # Linux
        # Remove any existing entries for this domain
        sudo sed -i "/^.*$domain/d" "$HOSTS_FILE" 2>/dev/null || true

        # Add the new entry (both localhost and IP)
        {
            echo "127.0.0.1 $domain"
            echo "$ip $domain"
        } | sudo tee -a "$HOSTS_FILE" >/dev/null
    fi

    ok "Updated $HOSTS_FILE with $domain -> $ip"
}

update_env() {
    local ip="$1"
    local domain="$APP_DOMAIN"
    local protocol="$APP_PROTOCOL"

    # Create .env if it doesn't exist
    [ ! -f "$ENV_FILE" ] && touch "$ENV_FILE"

    # Update or add APP_URL
    if grep -q "^APP_URL=" "$ENV_FILE" 2>/dev/null; then
        sed -i.bak "s|^APP_URL=.*|APP_URL=${protocol}://${domain}|" "$ENV_FILE"
        rm -f "${ENV_FILE}.bak"
    else
        echo "APP_URL=${protocol}://${domain}" >> "$ENV_FILE"
    fi

    # Update or add APP_DOMAIN
    if grep -q "^APP_DOMAIN=" "$ENV_FILE" 2>/dev/null; then
        sed -i.bak "s|^APP_DOMAIN=.*|APP_DOMAIN=${domain}|" "$ENV_FILE"
        rm -f "${ENV_FILE}.bak"
    else
        echo "APP_DOMAIN=${domain}" >> "$ENV_FILE"
    fi

    # Update or add SESSION_SECURE_COOKIE for HTTPS
    if grep -q "^SESSION_SECURE_COOKIE=" "$ENV_FILE" 2>/dev/null; then
        sed -i.bak "s|^SESSION_SECURE_COOKIE=.*|SESSION_SECURE_COOKIE=true|" "$ENV_FILE"
        rm -f "${ENV_FILE}.bak"
    else
        echo "SESSION_SECURE_COOKIE=true" >> "$ENV_FILE"
    fi

    ok "Updated $ENV_FILE with APP_URL=${protocol}://${domain}"
}

ensure_docker() {
    if command -v docker >/dev/null 2>&1; then
        info "Docker found: $(docker --version 2>/dev/null || true)"
    else
        if $IS_MAC; then
            die "Docker not found. Install Docker Desktop (https://www.docker.com/products/docker-desktop/) and re-run."
        fi
        info "Docker not found. Installing via get.docker.com..."
        curl -fsSL https://get.docker.com | sudo sh
        ok "Docker installed."
    fi

    if ! docker compose version >/dev/null 2>&1; then
        die "Docker Compose plugin is missing. Restart Docker and re-run this script."
    fi

    if command -v systemctl >/dev/null 2>&1; then
        sudo systemctl enable --now docker >/dev/null 2>&1 || true
    elif command -v service >/dev/null 2>&1 && ! $IS_MAC; then
        sudo service docker start >/dev/null 2>&1 || true
    fi
    ok "Docker and Compose are ready."
}

ensure_docker_group() {
    if $IS_MAC; then
        return 0
    fi

    if groups "$USER" 2>/dev/null | grep -q "\bdocker\b"; then
        ok "User '$USER' is already in the docker group."
        return 0
    fi

    info "Adding user '$USER' to the docker group..."
    sudo usermod -aG docker "$USER"
    warn "User added to the docker group. Log out and back in for it to take effect."
    warn "Continuing this run using 'sudo' for docker commands."
    SUDO_PREFIX="sudo "
}

export_caddy_certificate() {
    info "Exporting Caddy root certificate for local trust..."

    # Wait for Caddy to start and generate certificates
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker exec caddy test -f /data/caddy/pki/authorities/local/root.crt 2>/dev/null; then
            docker exec caddy cat /data/caddy/pki/authorities/local/root.crt > "$CADDY_ROOT_CRT"
            ok "Caddy root certificate exported to $CADDY_ROOT_CRT"

            # Show instructions for trusting the certificate
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "To trust the self-signed certificate and avoid browser warnings:"
            echo ""
            if $IS_MAC; then
                echo "  macOS: Double-click $CADDY_ROOT_CRT, add to System keychain"
                echo "  Then right-click -> Get Info -> Always Trust"
            elif command -v update-ca-certificates >/dev/null 2>&1; then
                echo "  Linux (Debian/Ubuntu):"
                echo "    sudo cp $CADDY_ROOT_CRT /usr/local/share/ca-certificates/"
                echo "    sudo update-ca-certificates"
            elif command -v trust >/dev/null 2>&1; then
                echo "  Linux (Fedora/RHEL):"
                echo "    sudo trust anchor $CADDY_ROOT_CRT"
            else
                echo "  Linux:"
                echo "    sudo cp $CADDY_ROOT_CRT /usr/share/ca-certificates/"
                echo "    sudo update-ca-certificates --fresh"
            fi
            echo ""
            echo "  Or simply click 'Advanced' -> 'Proceed to site' in your browser"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done

    warn "Could not export Caddy certificate (Caddy may not be running yet)"
}

start_stack() {
    local ip="$1"

    if [ ! -f docker-compose.yml ]; then
        warn "docker-compose.yml not found in $SCRIPT_DIR; skipping build/start."
        return 0
    fi

    info "Building and starting the stack with HTTPS..."
    info "First build downloads dependencies and may take a while."

    # Update environment with current IP and domain
    APP_URL="${APP_PROTOCOL}://${APP_DOMAIN}" APP_PORT="$APP_PORT" \
        ${SUDO_PREFIX:-}docker compose up -d --build

    ok "Stack is running at ${APP_PROTOCOL}://${APP_DOMAIN} (IP: ${ip})"
    info "You can also access via: ${APP_PROTOCOL}://${ip}:${APP_PORT}"

    # Export certificate for trust
    export_caddy_certificate
}

IP_STATE="/etc/bee-kyal-lan-ip"

save_ip_state() {
    local ip="$1"
    local sudo_cmd="sudo"
    [ "$(id -u)" -eq 0 ] && sudo_cmd=""
    printf '%s\n' "$ip" | $sudo_cmd tee "$IP_STATE" >/dev/null
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

    if [ -f docker-compose.yml ]; then
        info "Recreating stack with APP_URL=${APP_PROTOCOL}://${APP_DOMAIN} ..."
        APP_URL="${APP_PROTOCOL}://${APP_DOMAIN}" APP_PORT="$APP_PORT" \
            ${SUDO_PREFIX:-}docker compose up -d
        ok "Stack updated to ${APP_PROTOCOL}://${APP_DOMAIN} (IP: ${ip})"

        # Re-export certificate in case it changed
        export_caddy_certificate
    fi
}

setup_cron() {
    local interval="${CRON_INTERVAL:-0 9}"
    local script="$SCRIPT_DIR/install.sh"
    local logfile="/var/log/bee-kyal-ip.log"

    [ "$(id -u)" -eq 0 ] || die "setup-cron must run as root (use: sudo $0 setup-cron)"

    if $IS_MAC; then
        local tmp line
        line="$interval * * * * $script update-ip >> $logfile 2>&1"
        tmp="$(mktemp)"
        crontab -l 2>/dev/null | grep -v "$script update-ip" > "$tmp" || true
        printf '%s\n' "$line" >> "$tmp"
        crontab "$tmp"
        rm -f "$tmp"
        ok "Installed cron job in root's crontab (daily at ${interval})."
    else
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
    fi
}

main() {
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
        trust-cert)
            # Manually export and trust certificate
            export_caddy_certificate
            ;;
        *)
            [ "$(id -u)" -eq 0 ] && die "Run as a regular user (sudo is used internally when needed)."

            info "mini-pos Docker setup with HTTPS ($SCRIPT_DIR)"

            LAN_IP="$(detect_lan_ip)"
            [ -z "$LAN_IP" ] && die "Could not detect the LAN IP. Set APP_IP=<ip> and re-run."

            ok "Detected LAN IP: $LAN_IP"
            ok "Using domain: $APP_DOMAIN"
            ok "Using protocol: $APP_PROTOCOL"

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
                sudo "$0" update_hosts_internal "$LAN_IP"
                update_env "$LAN_IP"
            fi

            start_stack "$LAN_IP"

            ok "Setup complete!"
            info ""
            info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            info "Access your app at: ${APP_PROTOCOL}://${APP_DOMAIN}"
            info "Or via IP: ${APP_PROTOCOL}://${LAN_IP}:${APP_PORT}"
            info ""
            info "Since this is a self-signed certificate, your browser will show a warning:"
            info "  - Click 'Advanced' -> 'Proceed to site' (or similar)"
            info "  - Or install the certificate: sudo $0 trust-cert"
            info ""
            info "To update IP automatically, run: sudo $0 setup-cron"
            info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            ;;
    esac
}

# Internal function for sudo to update hosts
update_hosts_internal() {
    local ip="$1"
    update_hosts "$ip"
}

main "$@"
