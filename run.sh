#!/usr/bin/env bash
#
# dev.sh — build and manage the POS Docker stack
#
set -euo pipefail

# ---------------------------------------------------------------------------
# Config (override via env vars if needed)
# ---------------------------------------------------------------------------
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
APP_SERVICE="${APP_SERVICE:-app}"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"
BUILD_TARGET="${BUILD_TARGET:-}"          # e.g. "frontend" to build a single stage
NO_CACHE="${NO_CACHE:-0}"                 # set NO_CACHE=1 to force rebuild

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
log()  { printf '\033[1;34m▶ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m✘ %s\033[0m\n' "$*" >&2; exit 1; }

usage() {
    cat <<EOF
Usage: $(basename "$0") <command> [args...]

Commands:
  build                 Build all images (docker compose build)
  build <service>       Build a specific service (app | nginx)
  rebuild               Build with --no-cache
  up                    Start the stack in the background
  down                  Stop and remove the stack
  restart [service]     Restart the stack (or a single service)
  logs [service]        Tail logs (default: all services)
  shell                 Open a bash shell in the app container
  exec <cmd...>         Run an arbitrary command in the app container
  artisan <args...>     Run "php artisan <args>" in the app container
  composer <args...>    Run "composer <args>" in the app container
  npm <args...>         Run "npm <args>" in the app container
  ps                    Show container status
  clean                 Down + remove volumes (destructive!)

Environment overrides:
  COMPOSE_FILE   (default: docker-compose.yml)
  APP_SERVICE    (default: app)
  NGINX_SERVICE  (default: nginx)
  NO_CACHE       (default: 0)  set to 1 to force --no-cache
EOF
}

# ---------------------------------------------------------------------------
# Docker compose wrapper (auto-detects "docker compose" vs "docker-compose")
# ---------------------------------------------------------------------------
if docker compose version >/dev/null 2>&1; then
    DC=(docker compose -f "$COMPOSE_FILE")
elif command -v docker-compose >/dev/null 2>&1; then
    DC=(docker-compose -f "$COMPOSE_FILE")
else
    die "Neither 'docker compose' nor 'docker-compose' is available."
fi

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------
cmd_build() {
    local target="${1:-}"
    local args=(build)
    [[ "$NO_CACHE" == "1" ]] && args+=(--no-cache)
    [[ -n "$target" ]] && args+=("$target")
    log "Building: ${DC[*]} ${args[*]}"
    "${DC[@]}" "${args[@]}"
    ok "Build complete."
}

cmd_rebuild() {
    NO_CACHE=1 cmd_build "${1:-}"
}

cmd_up() {
    log "Starting stack..."
    "${DC[@]}" up -d --build
    ok "Stack is up."
}

cmd_down() {
    log "Stopping stack..."
    "${DC[@]}" down
    ok "Stack is down."
}

cmd_restart() {
    local svc="${1:-}"
    log "Restarting ${svc:-all services}..."
    if [[ -n "$svc" ]]; then
        "${DC[@]}" restart "$svc"
    else
        "${DC[@]}" restart
    fi
    ok "Restarted."
}

cmd_logs() {
    local svc="${1:-}"
    if [[ -n "$svc" ]]; then
        "${DC[@]}" logs -f "$svc"
    else
        "${DC[@]}" logs -f
    fi
}

cmd_shell() {
    log "Opening shell in '$APP_SERVICE'..."
    "${DC[@]}" exec "$APP_SERVICE" bash
}

cmd_exec() {
    [[ $# -gt 0 ]] || die "exec requires a command, e.g. ./dev.sh exec ls -la"
    "${DC[@]}" exec "$APP_SERVICE" "$@"
}

cmd_artisan() {
    "${DC[@]}" exec "$APP_SERVICE" php artisan "$@"
}

cmd_composer() {
    "${DC[@]}" exec "$APP_SERVICE" composer "$@"
}

cmd_npm() {
    "${DC[@]}" exec "$APP_SERVICE" npm "$@"
}

cmd_ps() {
    "${DC[@]}" ps
}

cmd_clean() {
    read -r -p "This will remove containers AND volumes. Continue? [y/N] " ans
    [[ "${ans,,}" == "y" ]] || { echo "Aborted."; exit 0; }
    "${DC[@]}" down -v --remove-orphans
    ok "Cleaned."
}

# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------
main() {
    [[ $# -gt 0 ]] || { usage; exit 1; }
    local cmd="$1"; shift
    case "$cmd" in
        build)    cmd_build "$@" ;;
        rebuild)  cmd_rebuild "$@" ;;
        up)       cmd_up "$@" ;;
        down)     cmd_down "$@" ;;
        restart)  cmd_restart "$@" ;;
        logs)     cmd_logs "$@" ;;
        shell)    cmd_shell "$@" ;;
        exec)     cmd_exec "$@" ;;
        artisan)  cmd_artisan "$@" ;;
        composer) cmd_composer "$@" ;;
        npm)      cmd_npm "$@" ;;
        ps)       cmd_ps "$@" ;;
        clean)    cmd_clean "$@" ;;
        -h|--help|help) usage ;;
        *) die "Unknown command: $cmd (run with --help)" ;;
    esac
}

main "$@"
