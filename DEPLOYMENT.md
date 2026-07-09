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

Agar Docker ishlatmoqchi bo'lmasangiz:

```bash
# Node.js 20, MongoDB, Nginx, PM2 o'rnatish
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
apt install -y nodejs nginx mongodb-org
npm install -g pm2

git clone https://github.com/<username>/oboy.git ~/oboy && cd ~/oboy

# Backend
cd backend && npm ci --omit=dev
cp .env.example .env
nano .env   # PORT, MONGODB_URI=mongodb://localhost:27017/wallpaper_studio, JWT_SECRET, va h.k.
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup   # server reboot'da avtomatik ishga tushishi uchun

# Frontend va Admin — statik build, Nginx orqali serve qilinadi
cd ../frontend && npm ci && npm run build
cd ../admin && npm ci && npm run build

# Nginx: har bir domen uchun serverblock yozing, root'ni tegishli dist/ ga
# ko'rsating (frontend/nginx.conf va admin/nginx.conf shablon sifatida
# ishlatilishi mumkin — root yo'lini /var/www/... ga moslang) va
# /api ni backend'ga (http://localhost:8003) proxy_pass qiling.
cp frontend/nginx.conf /etc/nginx/sites-available/oboishop
ln -s /etc/nginx/sites-available/oboishop /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL
apt install -y certbot python3-certbot-nginx
certbot --nginx -d oboishop.uz -d www.oboishop.uz -d admin.oboishop.uz -d api.oboishop.uz
```

PM2 logotiplari: `pm2 logs oboy-backend`, qayta ishga tushirish: `pm2 restart oboy-backend`.

---

## Nosozliklarni bartaraf etish

| Muammo | Tekshirish |
|---|---|
| 502 Bad Gateway | `docker compose ps` — backend "healthy"mi? `docker compose logs backend` |
| SSL xatosi | `docker compose logs certbot`, sertifikat muddati: `docker compose run --rm certbot certificates` |
| Telegram xabar kelmayapti | `backend/.env.production`da token/chat_id to'g'riligini tekshiring, `docker compose logs backend \| grep -i telegram` |
| Rasm yuklanmayapti | `backend_uploads` volume mavjudligini tekshiring: `docker volume ls` |
| CORS xatosi (brauzer konsolida) | `docker-compose.yml`dagi `CORS_ORIGINS` domeningizga mos kelishini tekshiring |
