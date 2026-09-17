# Mini POS

Laravel-based point-of-sale application.

## Raspberry Pi Docker Deployment

The Docker stack targets 32-bit Raspberry Pi systems (`linux/arm/v7`) and
includes:

- PHP 8.4 FPM
- Nginx
- Redis 7
- Supervisor for PHP-FPM and the Redis queue worker
- SQLite for the application database

### Requirements

- Raspberry Pi OS 32-bit
- Docker Engine with Docker Compose v2
- At least 2 GB of free storage for the first image build

### Start the Application

From the project directory:

```bash
make build
make up
```

Open `http://<raspberry-pi-ip>:8000` in a browser. The port can be changed
with `APP_PORT`:

```bash
APP_PORT=8080 docker compose up -d
```

On the first start, the container automatically generates the application
key, creates the SQLite database, runs migrations, and seeds the database.
Seeding runs once per persistent storage volume.

### Common Commands

```bash
make logs       # Follow application logs
make restart    # Restart all services
make migrate    # Run pending migrations
make seed       # Run the database seeder manually
make shell      # Open a shell in the PHP container
make down       # Stop the stack
```

### Persistent Data

Docker named volumes preserve the SQLite database, Laravel storage, and Redis
data when containers are recreated:

- `app_database`
- `app_storage`
- `redis_data`

Do not run `docker compose down -v` unless you intend to delete all
persistent application data.
