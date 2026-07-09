require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const logger = require('./utils/logger');
const { securityHeaders, apiLimiter, mongoSanitize } = require('./middleware/security');

const isProd = process.env.NODE_ENV === 'production';
const app = express();

// Render/behind-nginx deployments sit behind a reverse proxy — trust it so
// rate limiting and logging see the real client IP instead of the proxy's.
app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(compression());
app.use(morgan(isProd ? 'combined' : 'dev'));

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001')
  .split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const err = new Error('CORS: ruxsat etilmagan manba');
    err.status = 403;
    callback(err);
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(mongoSanitize);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check — used by Docker/load balancer/uptime monitors, kept outside
// the /api rate limiter so monitoring polls never get throttled.
app.use('/health', require('./routes/health'));
app.use('/api/health', require('./routes/health'));

app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallpapers', require('./routes/wallpapers'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/features', require('./routes/features'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/site-ratings', require('./routes/siteRatings'));
app.use('/api/orders', require('./routes/orders'));

app.get('/', (req, res) => res.json({ message: 'Wallpaper Studio API ishlayapti' }));

// Central error handler — catches anything thrown/passed to next() by routes
// above. Keeps stack traces out of client responses in production.
app.use((err, req, res, next) => {
  logger.error(err, { path: req.path, method: req.method });
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: isProd ? 'Server xatosi' : err.message });
});

const seedAdmin = async () => {
  const Admin = require('./models/Admin');
  const exists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
  if (!exists) {
    await Admin.create({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD });
    logger.info('Admin yaratildi:', process.env.ADMIN_USERNAME);
  }
};

const seedFeatures = async () => {
  const Feature = require('./models/Feature');
  const count = await Feature.countDocuments();
  if (count === 0) {
    await Feature.insertMany([
      { icon: '🎨', title: 'Keng assortiment', description: 'Turli uslub, rang va materialda 1000+ namuna', order: 0 },
      { icon: '🏠', title: '3D Vizualizatsiya', description: "7 ta virtual xonada real ko'rinishini ko'ring", order: 1 },
      { icon: '🚚', title: 'Tez yetkazish', description: "Toshkent bo'ylab 1-2 ish kuni ichida", order: 2 },
      { icon: '💎', title: 'Sifat kafolati', description: 'Barcha mahsulotlar sertifikatlangan va kafolatlangan', order: 3 },
      { icon: '🤝', title: 'Bepul maslahat', description: 'Mutaxassis dizaynerlardan maslahat oling', order: 4 },
      { icon: '🔄', title: 'Qulay qaytarish', description: '14 kun ichida qaytarish imkoniyati', order: 5 },
    ]);
    logger.info('Afzalliklar (features) seed qilindi');
  }
};

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    logger.info('MongoDB ulandi');
    await seedAdmin();
    await seedFeatures();
    app.listen(process.env.PORT, () => {
      logger.info(`Server http://localhost:${process.env.PORT} da ishlamoqda (${process.env.NODE_ENV || 'development'})`);
    });
  })
  .catch((err) => logger.error(err, { phase: 'mongodb-connect' }));

process.on('unhandledRejection', (err) => logger.error(err, { phase: 'unhandledRejection' }));
process.on('uncaughtException', (err) => logger.error(err, { phase: 'uncaughtException' }));
