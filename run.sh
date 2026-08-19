#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

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

# ── Node.js ─────────────────────────────────────────────
if ! command -v node &>/dev/null; then
    warn "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    info "Node.js installed."
fi

# ── pnpm ────────────────────────────────────────────────
if ! command -v pnpm &>/dev/null; then
    warn "pnpm not found. Installing..."
    npm install -g pnpm
    info "pnpm installed."
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

# ── Frontend build ──────────────────────────────────────
info "Installing frontend dependencies..."
pnpm install

info "Building frontend assets..."
pnpm run build

# ── Docker Compose up ───────────────────────────────────
info "Starting Docker containers..."
docker compose up -d --build

# Wait for backend container to be ready
info "Waiting for backend container..."
until docker compose ps --format json 2>/dev/null | grep -q "running" || docker compose ps 2>/dev/null | grep -q "running"; do
    sleep 2
done
sleep 3

# ── Backend setup inside container ──────────────────────
info "Running composer install..."
docker compose exec backend composer install --no-dev --optimize-autoloader --no-interaction

info "Running migrate:fresh --seed..."
docker compose exec backend php artisan migrate:fresh --seed

info "Running optimize:clear..."
docker compose exec backend php artisan optimize:clear

info "Done! App is running at http://localhost:80"
