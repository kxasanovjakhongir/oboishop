const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const isProd = process.env.NODE_ENV === 'production';

// Security response headers (HSTS, X-Content-Type-Options, etc).
// CSP is relaxed for cross-origin images since wallpaper photos are served
// from this same API under /uploads, and disabled entirely outside
// production so local Vite dev servers (different ports) aren't blocked.
const securityHeaders = helmet({
  contentSecurityPolicy: isProd
    ? {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      }
    : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// General API rate limit — generous enough for normal browsing/catalog use.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "So'rovlar soni chegaradan oshdi. Birozdan so'ng qayta urinib ko'ring." },
});

// Tighter limit for auth — slows down brute-force login attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Urinishlar soni chegaradan oshdi. 15 daqiqadan so'ng qayta urinib ko'ring." },
});

// Tighter limit for public write endpoints (orders, contacts, reviews,
// ratings) — these have no auth, so this is the main spam/abuse defense.
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "So'rovlar soni chegaradan oshdi. Birozdan so'ng qayta urinib ko'ring." },
});

module.exports = { securityHeaders, apiLimiter, authLimiter, writeLimiter, mongoSanitize: mongoSanitize() };
