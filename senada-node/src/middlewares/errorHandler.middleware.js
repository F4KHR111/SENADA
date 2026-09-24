const logger = require('../utils/logger')

/**
 * errorHandler — middleware terpusat untuk menangani semua error (AGENTS.md §6.8).
 * Harus didaftarkan sebagai middleware TERAKHIR di app.js.
 *
 * Di production: jangan expose stack trace ke client.
 * Di development: tampilkan stack untuk debugging.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500
  const isProduction = process.env.NODE_ENV === 'production'

  logger.error(`${statusCode} — ${err.message}`, { stack: err.stack, url: req.originalUrl })

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500
      ? 'Terjadi kesalahan pada server. Hubungi administrator.'
      : err.message || 'Internal Server Error',
    // Stack hanya di development
    ...(isProduction ? {} : { stack: err.stack }),
  })
}

module.exports = errorHandler
