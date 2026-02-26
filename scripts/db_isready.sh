#!/usr/bin/env bash
#
# Wait for Postgres inside the docker compose service to be ready.
# Uses `docker compose exec` so no container name is needed.

RETRIES=5

until
	docker compose exec -T postgres pg_isready -h localhost -U "${PG_USER:-postgres}" -d "${PG_DB:-postgres}" >/dev/null 2>&1
do
	if [ $RETRIES -le 0 ]; then
		echo "Postgres is not up - exiting"
		exit 1
	fi
	echo "Waiting for postgres server, $RETRIES remaining attempts..."
	RETRIES=$((RETRIES - 1))
	sleep 5
done
