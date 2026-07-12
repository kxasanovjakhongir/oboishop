// Builds and exports the configured Express app without connecting to
// MongoDB or starting an HTTP listener — server.js does that at process
// bootstrap. Kept separate so tests can `require('./app')` and drive it
// with supertest against whatever database connection they set up
// themselves (see tests/setup.js).
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const logger = require('./utils/logger');
const { securityHeaders, apiLimiter, mongoSanitize } = require('./middleware/security');

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const app = express();

// Render/behind-nginx deployments sit behind a reverse proxy — trust it so
// rate limiting and logging see the real client IP instead of the proxy's.
app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(compression());
if (!isTest) app.use(morgan(isProd ? 'combined' : 'dev'));

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
app.use('/api/history', require('./routes/history'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/site-ratings', require('./routes/siteRatings'));
app.use('/api/orders', require('./routes/orders'));

app.get('/', (req, res) => res.json({ message: 'Wallpaper Studio API ishlayapti' }));

// Central error handler — catches anything thrown/passed to next() by routes
// above. Keeps stack traces out of client responses in production.
app.use((err, req, res, next) => {
  if (!isTest) logger.error(err, { path: req.path, method: req.method });
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: isProd ? 'Server xatosi' : err.message });
});

module.exports = app;
