#!/bin/sh
set -e

DOMAIN=${DOMAIN:-onpprod.site}
EMAIL=${EMAIL:-}
STAGING=${STAGING:-0}

if [ -z "$EMAIL" ]; then
  echo "Defina EMAIL para o Let's Encrypt."
  echo "Exemplo: EMAIL=seu@email.com ./deploy/deploy.sh"
  exit 1
fi

if [ ! -f ".env" ]; then
  echo "Arquivo .env nao encontrado. Crie a partir de .env.example."
  exit 1
fi

if [ "$STAGING" -ne 0 ]; then
  STAGING_ARG="--staging"
else
  STAGING_ARG=""
fi

docker compose build

docker compose run --rm --user root web sh -c "mkdir -p /app/data /app/staticfiles && chown -R appuser:appuser /app/data /app/staticfiles"

if docker compose run --rm --entrypoint "test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem" certbot; then
  echo "Certificado existente detectado para $DOMAIN."
  docker compose up -d
  exit 0
fi

echo "Criando certificado temporario..."
docker compose run --rm --entrypoint "mkdir -p /etc/letsencrypt/live/$DOMAIN" certbot
docker compose run --rm --entrypoint "openssl req -x509 -nodes -newkey rsa:2048 -days 1 -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem -subj /CN=localhost" certbot

docker compose up -d nginx

docker compose run --rm --entrypoint "rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf" certbot || true

docker compose run --rm --entrypoint "certbot" certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --rsa-key-size 4096 \
  --agree-tos \
  --no-eff-email \
  $STAGING_ARG

docker compose up -d
docker compose restart nginx
