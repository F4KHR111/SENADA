const rateLimit = require('express-rate-limit')

/**
 * loginRateLimiter — brute-force protection di endpoint /login.
 * Max 10 percobaan per 15 menit per IP (AGENTS.md §6.1).
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
  },
})

/**
 * generalRateLimiter — rate limit umum untuk semua endpoint API.
 * Max 200 request per menit per IP.
 */
const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak request. Coba lagi sebentar.',
  },
})

module.exports = { loginRateLimiter, generalRateLimiter }
