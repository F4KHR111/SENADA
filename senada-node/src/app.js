require('dotenv').config()

const express     = require('express')
const helmet      = require('helmet')
const cors        = require('cors')
const cookieParser = require('cookie-parser')
const corsOptions  = require('./config/cors')
const { generalRateLimiter } = require('./middlewares/rateLimiter.middleware')
const errorHandler = require('./middlewares/errorHandler.middleware')
const logger       = require('./utils/logger')

const app = express()

// ── Security ──────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors(corsOptions))
app.use(cookieParser())

// ── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// ── Rate limiter umum ─────────────────────────────────────────────────────
app.use('/api', generalRateLimiter)

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'SENADA API is running.' })
})

// ── Routes ───────────────────────────────────────────────────────────────
// CATATAN KEAMANAN: Semua route WAJIB menggunakan prefix /api/ (AGENTS.md §6).
// Jangan mendaftarkan route tanpa prefix — bisa melewati aturan proxy/firewall.
app.use('/api/auth',         require('./routes/auth.routes'))
app.use('/api/hps',          require('./routes/hps.routes'))
app.use('/api/undangan',     require('./routes/undangan.routes'))
app.use('/api/penawaran',    require('./routes/penawaran.routes'))
app.use('/api/negosiasi',    require('./routes/negosiasi.routes'))
app.use('/api/spk',          require('./routes/spk.routes'))
app.use('/api/serah-terima', require('./routes/serahTerima.routes'))
app.use('/api/laporan',      require('./routes/laporan.routes'))
app.use('/api/admin',        require('./routes/admin.routes'))
app.use('/api/evaluations',  require('./routes/vendorEvaluation.routes'))







// ── 404 Handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan.' })
})

// ── Error Handler (HARUS di paling bawah) ─────────────────────────────────
app.use(errorHandler)

logger.info('app.js loaded — SENADA API initialized')

module.exports = app
