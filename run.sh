#!/usr/bin/env bash
set -e

# Always run Compose relative to this script, not the caller's current folder.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ============================================================
# Colors and formatting
# ============================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
step() { echo -e "\n${BLUE}${BOLD}▶ $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }

# ============================================================
# Helper functions
# ============================================================
run_in_container() {
    docker compose exec -T app sh -c "$1"
}

check_command() {
    command -v "$1" &>/dev/null
}

compose() {
    docker compose "$@"
}

wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1

    info "Waiting for $service to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if compose exec -T "$service" php -v &>/dev/null 2>&1; then
            success "$service is ready!"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    error "$service failed to start within $max_attempts attempts"
}

# ============================================================
# Main setup
# ============================================================
step "Checking Docker installation"

if ! check_command docker; then
    warn "Docker not found. Installing..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "$USER"
    info "Docker installed. You may need to log out and back in for group changes."
fi

if ! docker info &>/dev/null 2>&1; then
    warn "Docker daemon not running. Starting..."
    if command -v systemctl &>/dev/null; then
        sudo systemctl start docker
    elif command -v open &>/dev/null; then
        open -a Docker
    else
        error "Cannot start Docker daemon. Please start Docker manually."
    fi
fi

if ! docker info &>/dev/null 2>&1; then
    error "Docker daemon is unavailable. Start Docker and run this script again."
fi

step "Checking Docker Compose"

if ! compose version &>/dev/null 2>&1; then
    warn "Docker Compose plugin not found. Installing..."
    if ! check_command curl; then
        error "curl is required to install Docker Compose"
    fi
    compose_arch=$(uname -m)
    case "$compose_arch" in
        aarch64|arm64) compose_arch="aarch64" ;;
        armv7l|armv6l) compose_arch="armv7" ;;
        x86_64|amd64) compose_arch="x86_64" ;;
        *) error "Unsupported CPU architecture: $compose_arch" ;;
    esac
    sudo mkdir -p /usr/local/lib/docker/cli-plugins
    sudo curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-${compose_arch}" \
        -o /usr/local/lib/docker/cli-plugins/docker-compose
    sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    success "Docker Compose installed."
fi

step "Setting up .env file"

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        success ".env created from .env.example"
    else
        error ".env.example not found. Please create a .env file manually."
    fi
else
    info ".env already exists."
fi

# Generate APP_KEY if not set
if ! grep -q "^APP_KEY=" .env || [ -z "$(grep "^APP_KEY=" .env | cut -d '=' -f2)" ]; then
    if ! check_command openssl; then
        error "OpenSSL is required to generate APP_KEY"
    fi
    APP_KEY="base64:$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | cut -c1-43)"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/^APP_KEY=.*/APP_KEY=$APP_KEY/" .env
    else
        sed -i "s/^APP_KEY=.*/APP_KEY=$APP_KEY/" .env
    fi
    success "APP_KEY generated"
fi

# Set database password if not set
if grep -q "^DB_PASSWORD=$" .env || ! grep -q "^DB_PASSWORD=" .env; then
    if ! check_command openssl; then
        error "OpenSSL is required to generate DB_PASSWORD"
    fi
    DB_PASSWORD=$(openssl rand -base64 16 | tr -dc 'A-Za-z0-9' | cut -c1-16)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
    else
        sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
    fi
    success "DB_PASSWORD generated"
fi

step "Starting Docker containers"

# Pull latest images
info "Pulling Docker images..."
compose pull

# Build and start containers
info "Building and starting containers..."
compose up -d --build

step "Waiting for services to be ready"

# Wait for app to be ready
wait_for_service app

# Wait for database
info "Waiting for database to be ready..."
sleep 15

step "Running database migrations"

if run_in_container "php artisan migrate --force"; then
    success "Migrations completed successfully"
else
    error "Migrations failed"
fi

step "Optimizing application"

run_in_container "php artisan optimize" || true
run_in_container "php artisan view:cache" || true
run_in_container "php artisan config:cache" || true
run_in_container "php artisan route:cache" || true

step "Setting permissions"

run_in_container "chmod -R 775 /var/www/storage /var/www/bootstrap/cache" || true

step "Checking service health"

sleep 10
if compose ps | grep -q "healthy"; then
    success "✅ All services are healthy!"
else
    warn "Some services may not be healthy yet. Check with: docker compose ps"
fi

# Get the app URL
APP_URL=$(grep "^APP_URL=" .env | cut -d '=' -f2 || echo "http://localhost:8000")

echo ""
echo "========================================"
echo -e "${GREEN}${BOLD}✅ Setup Complete!${NC}"
echo "========================================"
echo ""
echo -e "🌐 ${BOLD}Application URL:${NC} $APP_URL"
echo ""
echo -e "📊 ${BOLD}Useful commands:${NC}"
echo "  docker compose ps          - Check container status"
echo "  docker compose logs -f     - View logs"
echo "  docker compose exec app sh - Access app container"
echo "  docker compose down        - Stop containers"
echo "  docker compose up -d       - Start containers"
echo ""
echo -e "🔍 ${BOLD}Health check:${NC}"
echo "  curl $APP_URL/up"
echo ""
echo "========================================"
