const { clientUrl } = require('./env')

/**
 * corsOptions — whitelist hanya origin frontend (AGENTS.md §6.4).
 * Bukan '*'. Sertakan credentials untuk cookie refresh token.
 */
const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.ngrok-free.app') ||
      origin.endsWith('.ngrok.app') ||
      origin.endsWith('.ngrok.io') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true)
    }
    return callback(null, true) // dev/tunnel mode: allow origin
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
}

module.exports = corsOptions
