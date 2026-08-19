#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    echo -e "${2}${1}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is installed
check_docker() {
    print_color "Checking Docker installation..." "$BLUE"
    if ! command_exists docker; then
        print_color "❌ Docker is not installed. Please install Docker first." "$RED"
        print_color "Visit: https://docs.docker.com/get-docker/" "$YELLOW"
        exit 1
    fi
    print_color "✅ Docker is installed" "$GREEN"
}

# Function to check if Docker Compose is installed
check_docker_compose() {
    print_color "Checking Docker Compose installation..." "$BLUE"
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_color "❌ Docker Compose is not installed. Please install Docker Compose first." "$RED"
        print_color "Visit: https://docs.docker.com/compose/install/" "$YELLOW"
        exit 1
    fi
    print_color "✅ Docker Compose is installed" "$GREEN"
}

# Function to check if Node.js is installed
check_nodejs() {
    print_color "Checking Node.js installation..." "$BLUE"
    if ! command_exists node; then
        print_color "⚠️ Node.js is not installed on host (will use Docker container)" "$YELLOW"
        USE_DOCKER_NODE=true
    else
        NODE_VERSION=$(node --version)
        print_color "✅ Node.js is installed (version: $NODE_VERSION)" "$GREEN"
        USE_DOCKER_NODE=false
    fi
}

# Function to check if pnpm is installed
check_pnpm() {
    print_color "Checking pnpm installation..." "$BLUE"
    if ! command_exists pnpm; then
        print_color "⚠️ pnpm is not installed on host (will use npm)" "$YELLOW"
        USE_PNPM=false
    else
        PNPM_VERSION=$(pnpm --version)
        print_color "✅ pnpm is installed (version: $PNPM_VERSION)" "$GREEN"
        USE_PNPM=true
    fi
}

# Function to copy .env file
setup_env() {
    print_color "Setting up .env file..." "$BLUE"
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_color "✅ .env file created from .env.example" "$GREEN"
        else
            print_color "⚠️ .env.example not found. Creating default .env file..." "$YELLOW"
            cat > .env << 'EOF'
APP_NAME="ဘီးကြဲ"
APP_ENV=local
APP_KEY=base64:yp/neRwqjcWkAtkitFn2Wf9jflNNYm0gapGJJggJD5E=
APP_DEBUG=true
APP_URL=http://localhost

APP_LOCALE=my
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# MySQL Configuration
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=fms
DB_USERNAME=root
DB_PASSWORD=fms

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=localhost

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database

REDIS_CLIENT=phpredis
REDIS_HOST=redis
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
            print_color "✅ Default .env file created" "$GREEN"
        fi
    else
        print_color "✅ .env file already exists" "$GREEN"
    fi
}

# Function to start Docker containers
start_docker() {
    print_color "Starting Docker containers..." "$BLUE"

    # Check if containers are already running
    if docker-compose ps | grep -q "Up"; then
        print_color "⚠️ Containers are already running. Restarting..." "$YELLOW"
        docker-compose down
    fi

    # Start containers in detached mode
    docker-compose up -d

    print_color "✅ Docker containers started" "$GREEN"
}

# Function to wait for containers to be ready
wait_for_containers() {
    print_color "Waiting for containers to be ready..." "$BLUE"

    # Wait for MySQL
    print_color "Waiting for MySQL..." "$YELLOW"
    until docker-compose exec -T mysql mysqladmin ping -h"localhost" --silent 2>/dev/null; do
        echo -n "."
        sleep 2
    done
    print_color "\n✅ MySQL is ready" "$GREEN"

    # Wait for Redis
    print_color "Waiting for Redis..." "$YELLOW"
    until docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; do
        echo -n "."
        sleep 2
    done
    print_color "\n✅ Redis is ready" "$GREEN"

    # Wait for Backend
    print_color "Waiting for Backend..." "$YELLOW"
    until docker-compose exec -T backend curl -f http://localhost:9000/ >/dev/null 2>&1; do
        echo -n "."
        sleep 2
    done
    print_color "\n✅ Backend is ready" "$GREEN"
}

# Function to install PHP dependencies
install_php_deps() {
    print_color "Installing PHP dependencies..." "$BLUE"
    docker-compose exec -T backend composer install --no-interaction --prefer-dist
    print_color "✅ PHP dependencies installed" "$GREEN"
}

# Function to install Node.js dependencies
install_node_deps() {
    print_color "Installing Node.js dependencies..." "$BLUE"
    if [ "$USE_DOCKER_NODE" = true ]; then
        # Use Docker's Node
        docker-compose exec -T backend npm install
    else
        # Use host's Node (if you want to run npm on host, but we'll use Docker for consistency)
        docker-compose exec -T backend npm install
    fi
    print_color "✅ Node.js dependencies installed" "$GREEN"
}

# Function to build frontend assets
build_frontend() {
    print_color "Building frontend assets..." "$BLUE"
    docker-compose exec -T backend npm run build || {
        print_color "⚠️ npm run build failed. Trying npm run production..." "$YELLOW"
        docker-compose exec -T backend npm run production
    }
    print_color "✅ Frontend assets built" "$GREEN"
}

# Function to run Laravel commands
run_laravel_commands() {
    print_color "Running Laravel setup commands..." "$BLUE"

    # Generate key
    docker-compose exec -T backend php artisan key:generate --no-interaction

    # Clear caches
    docker-compose exec -T backend php artisan optimize:clear

    # Run migrations
    docker-compose exec -T backend php artisan migrate --no-interaction

    # Create storage link
    docker-compose exec -T backend php artisan storage:link --no-interaction

    # If needed, run seeders
    # docker-compose exec -T backend php artisan db:seed --no-interaction

    print_color "✅ Laravel setup completed" "$GREEN"
}

# Function to run artisan commands from arguments
run_custom_artisan() {
    if [ -n "$1" ]; then
        print_color "Running custom artisan command: $1" "$BLUE"
        docker-compose exec -T backend php artisan $1
    fi
}

# Function to get into container
enter_container() {
    print_color "Entering backend container..." "$GREEN"
    docker exec -it backend bash
}

# Main installation function
main_install() {
    print_color "🚀 Starting Laravel Docker Setup" "$GREEN"
    print_color "=================================" "$BLUE"

    check_docker
    check_docker_compose
    check_nodejs
    check_pnpm
    setup_env

    print_color "\n📦 Starting Docker containers..." "$BLUE"
    start_docker

    print_color "\n⏳ Waiting for containers..." "$BLUE"
    wait_for_containers

    print_color "\n📦 Installing dependencies..." "$BLUE"
    install_php_deps
    install_node_deps
    build_frontend

    print_color "\n⚙️ Running Laravel setup..." "$BLUE"
    run_laravel_commands

    print_color "\n✅ Setup completed successfully!" "$GREEN"
    print_color "🌐 Application is running at: http://localhost" "$GREEN"
    print_color "🐘 Container: backend" "$GREEN"
    print_color "📝 To enter container: docker exec -it backend bash" "$YELLOW"
}

# Function for development mode
dev_mode() {
    print_color "🔄 Starting development mode..." "$BLUE"
    docker-compose up -d
    docker-compose logs -f
}

# Function for quick commands
quick_command() {
    case "$1" in
        "migrate")
            docker-compose exec backend php artisan migrate
            ;;
        "fresh")
            docker-compose exec backend php artisan migrate:fresh --seed
            ;;
        "optimize")
            docker-compose exec backend php artisan optimize:clear
            ;;
        "test")
            docker-compose exec backend php artisan test
            ;;
        "shell")
            docker exec -it backend bash
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "down")
            docker-compose down
            ;;
        "restart")
            docker-compose restart
            ;;
        *)
            print_color "Available commands: migrate, fresh, optimize, test, shell, logs, down, restart" "$YELLOW"
            ;;
    esac
}

# Main script execution
case "$1" in
    "install")
        main_install
        ;;
    "dev")
        dev_mode
        ;;
    "shell"|"logs"|"down"|"restart"|"migrate"|"fresh"|"optimize"|"test")
        quick_command "$1"
        ;;
    "command")
        shift
        run_custom_artisan "$@"
        ;;
    *)
        if [ -n "$1" ]; then
            print_color "Unknown command: $1" "$RED"
            echo ""
        fi
        print_color "Usage:" "$BLUE"
        echo "  ./entrypoint.sh install    - Full setup (recommended for first time)"
        echo "  ./entrypoint.sh dev        - Start in development mode"
        echo "  ./entrypoint.sh shell      - Enter backend container"
        echo "  ./entrypoint.sh logs       - View all logs"
        echo "  ./entrypoint.sh migrate    - Run migrations"
        echo "  ./entrypoint.sh fresh      - Fresh migrate with seed"
        echo "  ./entrypoint.sh optimize   - Clear all caches"
        echo "  ./entrypoint.sh test       - Run tests"
        echo "  ./entrypoint.sh down       - Stop containers"
        echo "  ./entrypoint.sh restart    - Restart containers"
        echo "  ./entrypoint.sh command [artisan_command] - Run custom artisan command"
        exit 1
        ;;
esac

exit 0
