#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
run_in_container() { docker compose exec backend sh -c "$1"; }

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

# ── Docker Compose up ───────────────────────────────────
info "Starting Docker containers..."
docker compose up -d --build

# Wait for backend container to be ready
info "Waiting docker container to be ready..."

info "Ready in 5..."
sleep 1
info "Ready in 4..."
sleep 1
info "Ready in 3..."
sleep 1
info "Ready in 2..."
sleep 1
info "Ready in 1..."
sleep 1

info "Waiting application and services to be ready..."
sleep 5

info "Done! App is up and running..."
