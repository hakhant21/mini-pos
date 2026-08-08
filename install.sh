#!/usr/bin/env bash
#
# Mini POS - one-time Docker installer for a LAN server
#
#   - Detects the machine's LAN IP
#   - Registers it as "mini-pos.local" in /etc/hosts
#   - Installs Docker (+ Compose) if missing, using https://get.docker.com
#   - Adds the current user to the "docker" group
#   - Builds & starts the stack and prints the access URL
#
# Usage:
#   ./install.sh                 # provision host + build & start the stack
#   APP_PORT=8080 ./install.sh   # use a custom web port
#   SKIP_BUILD=1 ./install.sh    # only provision the host, don't start the app
#
set -euo pipefail

APP_DOMAIN="mini-pos.local"
APP_PORT="${APP_PORT:-80}"
SKIP_BUILD="${SKIP_BUILD:-0}"
SUDO=""

# ------------------------------------------------------------------ helpers
info()  { printf '\033[1;34m[INFO]\033[0m %s\n' "$*"; }
ok()    { printf '\033[1;32m[OK]\033[0m   %s\n' "$*"; }
warn()  { printf '\033[1;33m[WARN]\033[0m %s\n' "$*"; }
fail()  { printf '\033[1;31m[ERROR]\033[0m %s\n' "$*" >&2; exit 1; }

require_sudo() {
    if [ "$(id -u)" -eq 0 ]; then
        SUDO=""
    else
        sudo -v 2>/dev/null || fail "This script needs sudo access. Run it with an account that has sudo privileges."
        SUDO="sudo"
    fi
}

# --------------------------------------------------------------- LAN IP
detect_lan_ip() {
    local ip=""

    # macOS
    if command -v ipconfig >/dev/null 2>&1; then
        for iface in en0 en1; do
            ip=$(ipconfig getifaddr "$iface" 2>/dev/null || true)
            [ -n "$ip" ] && break
        done
    fi

    # Linux: the interface of the default route
    if [ -z "$ip" ] && command -v ip >/dev/null 2>&1; then
        local iface
        iface=$(ip route show default 2>/dev/null | awk '/^default/ {print $5; exit}')
        if [ -n "$iface" ]; then
            ip=$(ip -4 -o addr show dev "$iface" 2>/dev/null | awk '{split($4,a,"/"); print a[1]}' | head -1)
        fi
    fi

    # Linux fallback
    if [ -z "$ip" ] && command -v hostname >/dev/null 2>&1; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi

    if [ -z "$ip" ] || ! printf '%s' "$ip" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'; then
        return 1
    fi
    printf '%s' "$ip"
}

add_hosts_entry() {
    local ip="$1"

    if grep -Eq "[[:space:]]${APP_DOMAIN}([[:space:]]|$)" /etc/hosts; then
        info "Updating existing ${APP_DOMAIN} entry in /etc/hosts"
        if [ "$(uname -s)" = "Darwin" ]; then
            $SUDO sed -i '' "/${APP_DOMAIN}/d" /etc/hosts
        else
            $SUDO sed -i "/${APP_DOMAIN}/d" /etc/hosts
        fi
    fi

    printf '%s %s\n' "$ip" "$APP_DOMAIN" | $SUDO tee -a /etc/hosts >/dev/null
    ok "Registered ${APP_DOMAIN} -> ${ip} in /etc/hosts"
}

# ----------------------------------------------------------------- Docker
ensure_docker() {
    if command -v docker >/dev/null 2>&1; then
        ok "Docker already installed: $(docker --version 2>/dev/null)"
    else
        info "Docker not found. Installing via https://get.docker.com ..."
        command -v curl >/dev/null 2>&1 || fail "curl is required to install Docker."
        curl -fsSL https://get.docker.com | $SUDO sh
        ok "Docker installed."
    fi

    # Start + enable the daemon on Linux (Docker Desktop handles this on macOS)
    if [ "$(uname -s)" != "Darwin" ]; then
        $SUDO systemctl enable --now docker 2>/dev/null || \
        $SUDO service docker start 2>/dev/null || true
    fi

    if docker compose version >/dev/null 2>&1; then
        ok "Docker Compose (v2) available: $(docker compose version 2>/dev/null)"
    elif command -v docker-compose >/dev/null 2>&1; then
        ok "docker-compose (v1) available: $(docker-compose --version 2>/dev/null)"
    else
        warn "Docker Compose plugin not found. Attempting to install it..."
        if [ "$(uname -s)" != "Darwin" ] && command -v apt-get >/dev/null 2>&1; then
            $SUDO apt-get update -y
            $SUDO apt-get install -y docker-compose-plugin || true
        fi
    fi

    if ! docker compose version >/dev/null 2>&1 && ! command -v docker-compose >/dev/null 2>&1; then
        fail "Docker Compose is unavailable. Install it manually (e.g. 'sudo apt install docker-compose-plugin')."
    fi
}

add_docker_group() {
    if [ "$(id -u)" -ne 0 ]; then
        if id -nG "$USER" 2>/dev/null | grep -qw docker; then
            ok "User ${USER} is already in the 'docker' group."
        else
            info "Adding ${USER} to the 'docker' group..."
            $SUDO usermod -aG docker "$USER"
            warn "Log out and back in (or run 'newgrp docker') for the group change to take effect."
        fi
    fi
}

# ------------------------------------------------------------------ stack
ensure_env_file() {
    if [ ! -f .env ]; then
        info "Creating .env from .env.example"
        cp .env.example .env
    fi
}

run_stack() {
    if [ "$SKIP_BUILD" = "1" ]; then
        info "SKIP_BUILD=1, skipping build & start."
        return
    fi

    local -a cmd=(docker)
    if ! docker info >/dev/null 2>&1; then
        cmd=($SUDO docker)
    fi

    info "Building and starting the stack (first build downloads packages and may take a while)..."
    APP_URL="http://${APP_DOMAIN}" APP_PORT="$APP_PORT" "${cmd[@]}" compose up -d --build
    ok "Stack is up."
}

# ------------------------------------------------------------------- main
main() {
    echo
    info "Mini POS - Docker installer"
    echo "   Machine: $(uname -srm)"
    echo

    cd "$(dirname "$0")"

    require_sudo

    local lan_ip=""
    lan_ip="$(detect_lan_ip)" || true

    echo
    if [ -n "$lan_ip" ]; then
        info "Detected LAN IP: ${lan_ip}"
        add_hosts_entry "$lan_ip"
    else
        warn "Could not auto-detect the LAN IP. Skipping /etc/hosts update."
        warn "Run it manually:  sudo sh -c 'echo \"<LAN-IP> ${APP_DOMAIN}\" >> /etc/hosts'"
    fi

    echo
    ensure_docker

    echo
    add_docker_group

    echo
    ensure_env_file
    run_stack

    echo
    ok "Done!"
    if [ "$APP_PORT" = "80" ]; then
        printf '    Access the app at:  \033[1mhttp://%s\033[0m\n' "$APP_DOMAIN"
    else
        printf '    Access the app at:  \033[1mhttp://%s:%s\033[0m\n' "$APP_DOMAIN" "$APP_PORT"
    fi
}

main "$@"
