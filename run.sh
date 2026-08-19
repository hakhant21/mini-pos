#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
run_in_container() { docker compose exec app sh -c "$1"; }

# ── Docker ──────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
    warn "Docker not found. Installing..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "$USER"
    info "Docker installed. You may need to log out and back in for group changes."
fi

if ! docker info &>/dev/null 2>&1; then
    warn "Docker daemon not running. Starting..."
    sudo systemctl start docker || sudo open -a Docker
fi

# ── Docker Compose ──────────────────────────────────────
if ! docker compose version &>/dev/null 2>&1; then
    warn "Docker Compose plugin not found. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    info "Docker Compose installed."
fi

# ── .env ────────────────────────────────────────────────
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        info ".env created from .env.example"
    else
        error ".env and .env.example not found."
    fi
else
    info ".env already exists."
fi

# ── TLS (mkcert) ───────────────────────────────────────
if ! command -v mkcert &>/dev/null; then
    warn "mkcert not found. Installing..."
    if command -v brew &>/dev/null; then
        brew install mkcert
    elif command -v apt-get &>/dev/null; then
        sudo apt-get update && sudo apt-get install -y mkcert
    else
        curl -JLO "https://github.com/FiloSottile/mkcert/releases/download/v1.4.6/mkcert-v1.4.6-$(uname -s)-$(uname -m)"
        chmod +x mkcert-*
        sudo mv mkcert-* /usr/local/bin/mkcert
    fi
fi

mkcert -install

mkdir -p docker/caddy/certs
mkcert -key-file docker/caddy/certs/key.pem -cert-file docker/caddy/certs/cert.pem pos.local

# ── Docker Compose up ───────────────────────────────────
info "Starting Docker containers..."
docker compose up -d --build

info "Waiting for setup to complete..."
DOCKER_LOGS_PID=""
docker compose logs -f --tail=0 app &
DOCKER_LOGS_PID=$!

while kill -0 "$DOCKER_LOGS_PID" 2>/dev/null; do
    if docker compose logs app 2>&1 | grep -q "APP_READY"; then
        kill "$DOCKER_LOGS_PID" 2>/dev/null
        break
    fi
    sleep 2
done

echo ""
info "Done! App is up and running at https://pos.local"
