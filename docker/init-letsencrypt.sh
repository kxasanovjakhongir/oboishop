#!/usr/bin/env bash
# One-time bootstrap for Let's Encrypt certs in the docker-compose stack.
#
# Why this script exists: nginx won't start with an ssl_certificate
# directive pointing at a file that doesn't exist yet, but certbot can't
# obtain a cert until nginx is up and serving the ACME challenge on port 80.
# This breaks that chicken-and-egg problem: create a throwaway self-signed
# cert so nginx boots, ask certbot for the real one over the now-running
# gateway, then reload nginx with it. Run this once per server; renewals
# after that are handled automatically by the `certbot` service in
# docker-compose.yml.
#
# Usage: ./docker/init-letsencrypt.sh   (run from the repo root)
set -euo pipefail

if [ ! -f .env ]; then
  echo "Xato: repo root'da .env topilmadi. .env.example'dan nusxa oling va DOMAIN/ADMIN_DOMAIN/API_DOMAIN/LETSENCRYPT_EMAIL to'ldiring." >&2
  exit 1
fi
set -a; source .env; set +a

: "${DOMAIN:?.env da DOMAIN o'rnatilmagan}"
: "${ADMIN_DOMAIN:?.env da ADMIN_DOMAIN o'rnatilmagan}"
: "${API_DOMAIN:?.env da API_DOMAIN o'rnatilmagan}"
: "${LETSENCRYPT_EMAIL:?.env da LETSENCRYPT_EMAIL o'rnatilmagan}"

DOMAINS_ARGS="-d $DOMAIN -d www.$DOMAIN -d $ADMIN_DOMAIN -d $API_DOMAIN"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"

echo "==> Vaqtinchalik (self-signed) sertifikat yaratilmoqda, nginx ishga tushishi uchun..."
mkdir -p "./data/certbot/conf/live/$DOMAIN"
docker compose run --rm --entrypoint "openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout '$CERT_PATH/privkey.pem' \
  -out '$CERT_PATH/fullchain.pem' \
  -subj '/CN=localhost'" certbot

echo "==> Gateway (nginx) ishga tushirilmoqda..."
docker compose up -d gateway

echo "==> Vaqtinchalik sertifikat o'chirilmoqda..."
rm -rf "./data/certbot/conf/live/$DOMAIN" \
       "./data/certbot/conf/archive/$DOMAIN" \
       "./data/certbot/conf/renewal/$DOMAIN.conf"

echo "==> Haqiqiy Let's Encrypt sertifikati so'ralmoqda: $DOMAINS_ARGS"
docker compose run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot \
  --email $LETSENCRYPT_EMAIL --agree-tos --no-eff-email \
  $DOMAINS_ARGS" certbot

echo "==> nginx qayta yuklanmoqda (haqiqiy sertifikat bilan)..."
docker compose exec gateway nginx -s reload

echo "==> Tayyor. https://$DOMAIN ni tekshiring."
