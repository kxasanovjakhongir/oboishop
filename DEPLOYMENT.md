# Deploy qo'llanmasi — OboiShop

Bu hujjat loyihani production serverga chiqarish uchun bosqichma-bosqich yo'riqnoma. Asosiy yo'l — **Docker Compose** (tavsiya etiladi). Docker'siz, PM2 + tizim Nginx orqali bare-metal deploy qilish yo'li hujjat oxirida keltirilgan.

## Talab qilinadigan narsalar

- Ubuntu 22.04+ (yoki shunga o'xshash) VPS, kamida 2GB RAM
- Domen nomi (masalan `oboishop.uz`) — DNS panelida sozlash huquqi
- GitHub'da bu repo (CI/CD uchun)

---

## 1-bosqich: Domenni sozlash

DNS provayderingizda 3 ta A-yozuv yarating, barchasi serveringiz IP-manziliga ko'rsatilsin:

| Tur | Nom | Qiymat |
|---|---|---|
| A | `oboishop.uz` | `<server IP>` |
| A | `www.oboishop.uz` | `<server IP>` |
| A | `admin.oboishop.uz` | `<server IP>` |
| A | `api.oboishop.uz` | `<server IP>` |

DNS tarqalishi (propagation) bir necha daqiqadan bir necha soatgacha vaqt olishi mumkin — SSL bosqichiga o'tishdan oldin `dig oboishop.uz` orqali tekshiring.

## 2-bosqich: Serverni tayyorlash va Docker o'rnatish

```bash
ssh root@<server-ip>

# Docker + Docker Compose plugin
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

# root bo'lmagan foydalanuvchi bilan ishlash tavsiya etiladi
adduser deploy
usermod -aG docker deploy
su - deploy
```

## 3-bosqich: Loyihani serverga olib kelish

```bash
git clone https://github.com/<username>/oboy.git ~/oboy
cd ~/oboy
```

## 4-bosqich: Environment sozlash

```bash
# docker-compose uchun (domen nomlari)
cp .env.example .env
nano .env   # DOMAIN, ADMIN_DOMAIN, API_DOMAIN, LETSENCRYPT_EMAIL to'ldiring

# backend maxfiy ma'lumotlari
cp backend/.env.example backend/.env.production
nano backend/.env.production
```

`backend/.env.production`da albatta to'ldiring:
- `JWT_SECRET` — `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` bilan generatsiya qiling
- `ADMIN_PASSWORD` — kuchli parol (birinchi ishga tushganda shu parol bilan admin yaratiladi)
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` — buyurtma xabarnomalari uchun (@BotFather orqali)

`MONGODB_URI` va `CORS_ORIGINS`ni bu faylda o'zgartirish shart emas — `docker-compose.yml` ularni compose tarmog'i uchun avtomatik moslashtiradi.

`frontend/.env.production` va `admin/.env.production`dagi domen nomlari ham `.env`dagi qiymatlaringizga mos kelishini tekshiring (default: `oboishop.uz`).

## 5-bosqich: Birinchi marta ishga tushirish (SSL bilan)

Birinchi marta SSL sertifikatini olish uchun maxsus skript kerak (nginx sertifikatsiz ishga tusholmaydi, certbot esa ishlab turgan nginx'siz sertifikat ololmaydi — skript bu muammoni hal qiladi):

```bash
chmod +x docker/init-letsencrypt.sh
./docker/init-letsencrypt.sh
```

Bu skript: vaqtinchalik sertifikat yaratadi → gateway'ni ishga tushiradi → haqiqiy Let's Encrypt sertifikatini so'raydi → nginx'ni qayta yuklaydi.

## 6-bosqich: Qolgan xizmatlarni ishga tushirish

```bash
docker compose up -d --build
docker compose ps   # barchasi "healthy"/"running" bo'lishi kerak
```

Tekshirish:
```bash
curl -I https://oboishop.uz
curl https://api.oboishop.uz/health
```

## 7-bosqich: Admin'ga kirish va ma'lumotlarni to'ldirish

`https://admin.oboishop.uz` ga kiring, `backend/.env.production`dagi `ADMIN_USERNAME`/`ADMIN_PASSWORD` bilan login qiling, Settings bo'limida `siteName`, `logo`, `phone`, `telegramUsername` va h.k.ni to'ldiring.

## 8-bosqich: Avtomatik qayta ishga tushirish

Docker'ning o'zi buni ta'minlaydi — `docker-compose.yml`dagi har bir xizmatda `restart: unless-stopped` bor, ya'ni server qayta yuklansa yoki konteyner qulasa, Docker uni avtomatik qayta ko'taradi. Qo'shimcha sozlash shart emas (agar server reboot bo'lsa, faqat Docker daemon avtoishga tushishi kerak — bu `curl -fsSL https://get.docker.com | sh` bilan avtomatik yoqiladi).

## 9-bosqich: CI/CD (GitHub Actions orqali avtomatik deploy)

`.github/workflows/ci.yml` har bir `main`ga push'da backend/frontend/admin'ni build+lint+tekshiradi. Avtomatik deploy qilish uchun GitHub repo sozlamalarida (**Settings → Secrets and variables → Actions**) quyidagilarni qo'shing:

| Secret | Qiymat |
|---|---|
| `DEPLOY_HOST` | server IP yoki domen |
| `DEPLOY_USER` | `deploy` (yoki sizning SSH foydalanuvchingiz) |
| `DEPLOY_SSH_KEY` | serverga kirish uchun **private** SSH kalit |
| `DEPLOY_PATH` | (ixtiyoriy) `~/oboy`, default shu |

Serverda `deploy` foydalanuvchisi uchun SSH kalit orqali parolsiz kirish sozlangan bo'lishi kerak (`ssh-copy-id`). Bu secretlar qo'shilmaguncha deploy bosqichi shunchaki o'tkazib yuboriladi (CI qizarmaydi) — README/bu hujjatda aytilganidek.

## 10-bosqich: Backup

MongoDB va yuklangan rasmlar Docker named volume'larda saqlanadi (`mongo_data`, `backend_uploads`). Muntazam backup:

```bash
# MongoDB dump
docker compose exec mongo mongodump --archive=/tmp/backup.archive
docker compose cp mongo:/tmp/backup.archive ./backups/mongo-$(date +%F).archive

# Yuklangan rasmlar
docker run --rm -v oboy_backend_uploads:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

Buni kunlik cron orqali avtomatlashtirish tavsiya etiladi (`crontab -e`):
```
0 3 * * * cd ~/oboy && ./scripts/backup.sh   # o'zingiz shu skriptni yozib qo'ying
```

## 11-bosqich: Rollback

```bash
# Oldingi commit'ga qaytish
cd ~/oboy
git log --oneline -5          # qaysi commit'ga qaytishni tanlang
git checkout <commit-hash>
docker compose up -d --build

# MongoDB'ni backup'dan tiklash
docker compose cp ./backups/mongo-2026-07-01.archive mongo:/tmp/restore.archive
docker compose exec mongo mongorestore --archive=/tmp/restore.archive --drop
```

## 12-bosqich: Yangilash (oddiy deploy)

```bash
cd ~/oboy
git pull origin main
docker compose up -d --build
docker image prune -f   # eski image'larni tozalash
```

---

## Muqobil yo'l: Docker'siz (PM2 + tizim Nginx + tizim MongoDB)

Agar Docker ishlatmoqchi bo'lmasangiz, loyihaning uchta qismi (frontend, admin — statik build; backend — PM2 orqali doimiy process) alohida sozlanadi.

### 1. Serverga ulanish

```bash
ssh root@<server_IP>
```

### 2. Kerakli paketlar (Node + Nginx + PM2 + MongoDB)

```bash
apt update && apt upgrade -y
apt install -y nginx git curl gnupg

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm i -g pm2

# MongoDB — Ubuntu 22.04 (jammy) uchun. Boshqa versiya bo'lsa
# mongodb.com/docs/manual/administration/install-on-linux dan aniq buyruqni oling.
#
# MUHIM: MongoDB 5.0+ server binariylari AVX protsessor buyrug'ini talab
# qiladi va eski/arzon VPS'larda (AVX'siz) hech qanday log qoldirmasdan
# ishga tushmay qoladi. Avval quyidagini tekshiring:
#   grep avx /proc/cpuinfo
# Bo'sh natija qaytsa (AVX yo'q) — 7.0 o'rniga 4.4 o'rnating (pastda,
# skobkadagi qatorlar). AVX bor bo'lsa 7.0 (yangi, qo'llab-quvvatlanadigan
# versiya) ishlating.
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
# AVX'siz server bo'lsa, yuqoridagi 3 qatorni shu bilan almashtiring:
#   curl -fsSL https://pgp.mongodb.com/server-4.4.asc | gpg -o /usr/share/keyrings/mongodb-server-4.4.gpg --dearmor
#   echo "deb [signed-by=/usr/share/keyrings/mongodb-server-4.4.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/4.4 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list
# (4.4 EOL bo'lgan — faqat AVX'siz uskunada muqobil yo'q bo'lgani uchun ishlatiladi;
#  imkon qadar MongoDB Atlas kabi boshqariladigan xizmatga o'tishni ko'rib chiqing.)
apt update
apt install -y mongodb-org
systemctl enable --now mongod
```

### 3. Loyihani yuklash va tayyorlash

```bash
cd /var/www
git clone https://github.com/kxasanovjakhongir/oboishop.git myapp
cd myapp

# Backend
cd backend
npm ci --omit=dev
cp .env.example .env
nano .env
# To'ldiring:
#   PORT=8004
#   NODE_ENV=production
#   MONGODB_URI=mongodb://localhost:27017/wallpaper_studio
#   JWT_SECRET=<node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
#   ADMIN_USERNAME, ADMIN_PASSWORD
#   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
#   CORS_ORIGINS=https://oboishop.uz,https://www.oboishop.uz,https://admin.oboishop.uz

# Frontend
cd ../frontend
npm ci
cp .env.example .env.production
nano .env.production
#   VITE_API_URL=https://api.oboishop.uz/api
#   VITE_SITE_URL=https://oboishop.uz
npm run build          # -> frontend/dist

# Admin
cd ../admin
npm ci
cp .env.example .env.production
nano .env.production
#   VITE_API_URL=https://api.oboishop.uz/api
npm run build           # -> admin/dist
```

### 4. Nginx — uchta alohida server blok (`/etc/nginx/sites-available/oboishop`)

To'rtta real subdomen (`oboishop.uz`, `www.oboishop.uz`, `admin.oboishop.uz`,
`api.oboishop.uz`) bo'lgani uchun standart `server_names_hash_bucket_size`
(ko'p buildlarda 32) yetarli bo'lmasligi mumkin — nginx
`could not build server_names_hash, you should increase
server_names_hash_bucket_size` xatosi bilan ishga tushmay qoladi. Avval
`/etc/nginx/nginx.conf` faylini oching va `http { ... }` blokining ichiga
(har qanday joyga, `include /etc/nginx/sites-enabled/*;` qatoridan oldin)
qo'shing:

```nginx
http {
    server_names_hash_bucket_size 64;
    # ... qolgan standart qatorlar shu yerda qoladi ...
}
```

Endi server bloklarni yozing:

```nginx
# Frontend (mijozlar sayti)
server {
    listen 80;
    server_name oboishop.uz www.oboishop.uz;
    root /var/www/myapp/frontend/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Admin panel
server {
    listen 80;
    server_name admin.oboishop.uz;
    root /var/www/myapp/admin/dist;
    index index.html;
    add_header X-Robots-Tag "noindex, nofollow" always;
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.oboishop.uz;
    client_max_body_size 20m;

    # Yuklangan rasm/tekstura fayllari hech qachon o'zgarmaydi (multer har
    # birini noyob nom bilan saqlaydi) — shuning uchun uzoq muddat
    # keshlanadi, dinamik API javoblaridan alohida.
    location /uploads/ {
        proxy_pass http://localhost:8004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 30d;
        add_header Cache-Control "public";
    }

    location / {
        proxy_pass http://localhost:8004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/oboishop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 5. Backend'ni PM2 bilan ishga tushirish

Loyihada tayyor `ecosystem.config.js` bor — shuni ishlatamiz:

```bash
cd /var/www/myapp/backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup   # chiqqan buyruqni nusxalab, alohida ishga tushiring
```

Frontend va admin — statik fayllar, PM2 shart emas, Nginx to'g'ridan-to'g'ri serve qiladi.

### 6. SSL — barcha 4 nom uchun birdan

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d oboishop.uz -d www.oboishop.uz -d admin.oboishop.uz -d api.oboishop.uz
```

### 7. Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### Foydali PM2 buyruqlari

```bash
pm2 logs oboy-backend       # jonli loglar
pm2 restart oboy-backend    # qayta ishga tushirish
pm2 status                  # holatni ko'rish
```

### Yangilash

```bash
cd /var/www/myapp && git pull
cd backend && npm ci --omit=dev && pm2 restart oboy-backend
cd ../frontend && npm ci && npm run build
cd ../admin && npm ci && npm run build
```

---

## Nosozliklarni bartaraf etish

| Muammo | Tekshirish |
|---|---|
| 502 Bad Gateway | `docker compose ps` — backend "healthy"mi? `docker compose logs backend` |
| SSL xatosi | `docker compose logs certbot`, sertifikat muddati: `docker compose run --rm certbot certificates` |
| Telegram xabar kelmayapti | `backend/.env.production`da token/chat_id to'g'riligini tekshiring, `docker compose logs backend \| grep -i telegram` |
| Rasm yuklanmayapti | `backend_uploads` volume mavjudligini tekshiring: `docker volume ls` |
| CORS xatosi (brauzer konsolida) | `docker-compose.yml`dagi `CORS_ORIGINS` domeningizga mos kelishini tekshiring |
| Mongo konteyner/xizmat sira "healthy" bo'lmaydi, log deyarli bo'sh | AVX muammosi bo'lishi mumkin: `grep avx /proc/cpuinfo` bo'sh qaytsa, `mongo:7`/`mongodb-org 7.0` emas, `mongo:4.4`/`mongodb-org 4.4` kerak (yuqoridagi bosqichlarda izohlangan) |
| Backend to'satdan "heap out of memory" bilan qulaydi yoki PM2/Docker uni tinimsiz qayta ishga tushiradi | RAM kam bo'lishi mumkin — `NODE_OPTIONS`/`node_args`dagi `--max-old-space-size` qiymatini kamaytiring yoki VPS RAM'ini oshiring |
| `nginx -t` "server_names_hash_bucket_size" xatosi beradi | Docker: `docker/nginx-tuning.conf` mount qilinganini tekshiring. Bare-metal: `/etc/nginx/nginx.conf`ning `http{}` blokiga `server_names_hash_bucket_size 64;` qo'shilganini tekshiring |
| Rasmlar sekin yuklanadi / har safar qayta so'raladi | `/uploads/` uchun alohida `expires`/`Cache-Control` bloki nginx konfiguratsiyasida borligini tekshiring (docker/nginx.conf.template yoki bare-metal server blok) |
