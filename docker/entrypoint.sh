#!/bin/sh
set -eu

mkdir -p storage/app/public storage/framework/cache storage/framework/data storage/framework/sessions \
    storage/framework/testing storage/framework/views bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

exec "$@"
