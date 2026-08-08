#!/usr/bin/env bash
set -euo pipefail

# mini-pos LAN deployment setup
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

APP_PORT="${APP_PORT:-80}"
APP_IP="${APP_IP:-}"

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

start_stack() {
    local ip="$1"

    if [ ! -f docker-compose.yml ]; then
        warn "docker-compose.yml not found in $SCRIPT_DIR; skipping build/start."
        return 0
    fi

    info "Building and starting the stack..."
    info "First build downloads dependencies and may take a while."
    APP_URL="http://${ip}" APP_PORT="$APP_PORT" \
        ${SUDO_PREFIX:-}docker compose up -d --build
    ok "Stack is running at http://${ip}"
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

    if [ -f docker-compose.yml ]; then
        info "Recreating stack with APP_URL=http://$ip ..."
        APP_URL="http://${ip}" APP_PORT="$APP_PORT" \
            ${SUDO_PREFIX:-}docker compose up -d
        ok "Stack updated to http://${ip}"
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
        ok "Installed cron job in root's crontab (daily at 09:00)."
    else
        local cronfile="/etc/cron.d/bee-kyal-ip" tmp line
        line="$interval * * * * root $script update-ip >> $logfile 2>&1"
        tmp="$(mktemp)"
        grep -v "$script update-ip" "$cronfile" 2>/dev/null > "$tmp" || true
        printf '%s\n' "$line" >> "$tmp"
        mv "$tmp" "$cronfile"
        rm -f "$tmp"
        chmod 644 "$cronfile"
        ok "Installed cron job in $cronfile (daily at 09:00)."
        printf '    %s\n' "$line"
    fi
}

main() {
    case "${1:-}" in
        update-ip)
            update_ip
            ;;
        setup-cron)
            setup_cron
            ;;
        *)
            [ "$(id -u)" -eq 0 ] && die "Run as a regular user (sudo is used internally when needed)."

            info "mini-pos Docker setup ($SCRIPT_DIR)"

            LAN_IP="$(detect_lan_ip)"
            [ -z "$LAN_IP" ] && die "Could not detect the LAN IP. Set APP_IP=<ip> and re-run."

            ok "Detected LAN IP: $LAN_IP"

            save_ip_state "$LAN_IP"
            ensure_docker
            ensure_docker_group
            start_stack "$LAN_IP"
            ;;
    esac
}

main "$@"
