.PHONY: build rebuild pull up down clean purge restart logs shell migrate seed seed-production

build:
	docker compose build && docker compose up -d

rebuild:
	docker compose build --no-cache && docker compose up -d

pull:
	sudo git pull origin pos/version-two

up:
	docker compose up -d

down:
	docker compose down

clean:
	docker compose down -v

purge:
	docker system prune -a --volumes

restart:
	docker compose restart

logs:
	docker compose logs -f --tail=100

shell:
	docker compose exec app sh

migrate:
	docker compose exec app php artisan migrate --force

seed:
	docker compose exec app php artisan db:seed --force

seed-production:
	docker compose exec -e APP_ENV=production app php artisan db:seed --force
