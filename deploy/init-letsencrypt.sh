#!/bin/sh
set -e

DOMAIN=${DOMAIN:-onpprod.site}
EMAIL=${EMAIL:-}
STAGING=${STAGING:-0}

if [ -z "$EMAIL" ]; then
  echo "Defina EMAIL para solicitar o certificado. Exemplo:"
  echo "EMAIL=seu@email.com ./deploy/init-letsencrypt.sh"
  exit 1
fi

if [ $STAGING -ne 0 ]; then
  STAGING_ARG="--staging"
else
  STAGING_ARG=""
fi

DUMMY_CERT=0

if docker compose run --rm --entrypoint "test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem" certbot; then
  echo "Certificado ja existe para $DOMAIN."
else
  echo "Criando certificado temporario para iniciar o NGINX..."
  docker compose run --rm --entrypoint "mkdir -p /etc/letsencrypt/live/$DOMAIN" certbot
  docker compose run --rm --entrypoint "openssl req -x509 -nodes -newkey rsa:2048 -days 1 -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem -subj /CN=localhost" certbot
  DUMMY_CERT=1
fi

docker compose up -d nginx

if [ $DUMMY_CERT -eq 1 ]; then
  docker compose run --rm --entrypoint "rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf" certbot || true

  docker compose run --rm certbot certonly \
    --webroot -w /var/www/certbot \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --rsa-key-size 4096 \
    --agree-tos \
    --no-eff-email \
    $STAGING_ARG

  docker compose restart nginx
else
  echo "Certificado ja configurado. Use certbot renew para atualizacoes."
fi
