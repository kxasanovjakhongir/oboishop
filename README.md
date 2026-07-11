# OboiShop — Wallpaper Studio 3D

Oboylar savdosi uchun 3D vizualizatsiyali web platforma: katalog, savat/buyurtma, Telegram bot orqali buyurtma xabarnomasi, va 7 ta virtual xonada oboyni joyiga qo'yib ko'rish imkoniyati.

**Arxitektura:** `frontend/` (React 18 + Vite + Three.js/R3F, mijozlarga ko'rinadigan sayt) · `backend/` (Node.js + Express + MongoDB, API) · `admin/` (React 18 + Vite, boshqaruv paneli) — uchtasi alohida ilova, bitta MongoDB'ga ulanadi.

## Local ishga tushirish

### 1. MongoDB o'rnating va ishga tushiring
```bash
brew install mongodb-community
brew services start mongodb-community
```

### 2. Paketlarni o'rnating
```bash
npm run install:all
# yoki alohida: cd backend|frontend|admin && npm install
```

### 3. Environment sozlash
Har uchala ilovada `.env.example`dan nusxa oling:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.development
cp admin/.env.example admin/.env.development
```
`backend/.env`da kamida `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USERNAME`/`ADMIN_PASSWORD`ni to'ldiring. To'liq ro'yxat va izohlar uchun `backend/.env.example`ga qarang. Telegram bot orqali buyurtma xabarnomasi olish uchun `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`ni ham to'ldiring (ixtiyoriy — bo'sh qoldirilsa, buyurtmalar baribir saqlanadi, faqat xabar yuborilmaydi).

### 4. Ishga tushirish
```bash
npm run dev   # backend + frontend + admin — barchasini bitta terminalda
```
yoki har birini alohida terminalda: `npm run backend`, `npm run frontend`, `npm run admin`.

| Ilova | URL |
|---|---|
| Sayt | http://localhost:3000 |
| Admin panel | http://localhost:3001 |
| Backend API | http://localhost:8004/api |
| Health check | http://localhost:8004/health |

Birinchi ishga tushganda backend `.env`dagi `ADMIN_USERNAME`/`ADMIN_PASSWORD` bilan admin foydalanuvchisini avtomatik yaratadi (Admin panelga shu bilan kiring).

## Sahifalar

| Sahifa | Yo'l |
|---|---|
| Bosh sahifa | `/` |
| Katalog | `/catalog` |
| Mahsulot | `/product/:id` |
| 3D Studio | `/3d-studio` |
| Kalkulyator | `/calculator` |
| Savat / Checkout | `/cart`, `/checkout` |
| Sevimlilar | `/favorites` |
| Biz haqimizda / Kontakt | `/about`, `/contact` |

## Texnologiyalar

- **Frontend**: React 18, Vite, Three.js / React Three Fiber, Tailwind CSS, Zustand, react-router-dom, react-i18next (uz/ru/en), react-helmet-async (SEO)
- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT, Multer, Helmet, express-rate-limit, express-mongo-sanitize, Morgan, Compression
- **Admin**: React 18, Vite, Tailwind CSS

## Ma'lumotlar bazasi

MongoDB/Mongoose ishlatiladi — sxemalar moslashuvchan (schemaless) bo'lgani uchun rasmiy migration vositasi ishlatilmagan; yangi maydonlar `default` qiymat bilan qo'shiladi va eski hujjatlar avtomatik moslashadi. Agar kelajakda versiyalangan migratsiyalar kerak bo'lsa, [migrate-mongo](https://github.com/seppevs/migrate-mongo) tavsiya etiladi.

## Production / Deploy

To'liq bosqichma-bosqich yo'riqnoma — server tayyorlashdan tortib SSL, CI/CD, backup va rollback'gacha — [DEPLOYMENT.md](./DEPLOYMENT.md) faylida. Qisqacha:

```bash
cp .env.example .env && nano .env                              # domenlar
cp backend/.env.example backend/.env.production && nano ...     # maxfiy ma'lumotlar
./docker/init-letsencrypt.sh                                    # SSL sertifikatini olish (bir marta)
docker compose up -d --build
```

Production'da qo'shimcha ishlaydi: xavfsizlik headerlari (Helmet), rate limiting, NoSQL-injection himoyasi (mongo-sanitize), CORS allowlist, gzip siqish, strukturaviy loglar, `/health` monitoring endpoint'i, avtomatik SSL yangilanishi (certbot), va GitHub Actions orqali build+lint tekshiruvi har bir push'da.

## Testing

```bash
cd backend && npm test     # Jest + Supertest + mongodb-memory-server (56 test, real HTTP so'rovlar, xotiradagi MongoDB'ga qarshi)
cd frontend && npm test    # Vitest + React Testing Library (utils, Zustand store, komponentlar)
```

Backend testlari `app.js` (Express ilovasi, `server.js`dan alohida — Mongo ulanishi/`app.listen()`siz) ga qarshi ishlaydi, har bir test fayli o'zining vaqtinchalik in-memory MongoDB nusxasini oladi. Qamrov: auth, wallpapers/categories/orders/site-ratings/reviews/features/contacts/settings CRUD'lari, buyurtma narxini serverda qayta hisoblash, reyting agregatsiyasi, CORS/mongo-sanitize xavfsizligi, Telegram bot integratsiyasi (muvaffaqiyat/xato/sozlanmagan holatlar).

Frontend testlari: `utils/phone.js` (telefon mask), `store/useStore.ts` (savat/sevimlilar logikasi), `WallpaperCard`/`Cart` komponentlari.

E2E (Playwright/Cypress) va admin panel testlari hali yozilmagan — keyingi bosqich sifatida qo'shilishi mumkin. Sifat nazorati CI'da avtomatik: ESLint (frontend/admin), TypeScript (`tsc --noEmit`, frontend), va yuqoridagi ikkala test suite har bir push'da (`.github/workflows/ci.yml`).
