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

// Trust proxy WAJIB untuk Vercel / reverse proxy agar express-rate-limit tidak error
app.set('trust proxy', 1)

// ── Security ──────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors(corsOptions))
app.use(cookieParser())

// ── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// ── Auto-Migrate & Seed (Setup endpoint jika sewaktu-waktu dibutuhkan) ────
const db = require('./models')
const { initDatabase } = require('./config/autoMigrate')

app.get('/api/setup/init-db', async (_req, res) => {
  try {
    await initDatabase(db)
    res.json({ success: true, message: 'Database schema and seed verified.' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── Root info ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'SENADA API is running on Vercel.',
    environment: process.env.NODE_ENV || 'development',
    serverless: !!process.env.VERCEL,
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      hps: '/api/hps',
      undangan: '/api/undangan',
    },
  })
})

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    const { sequelize } = require('./config/db')
    await sequelize.authenticate()
    const dialect = sequelize.getDialect()
    res.json({
      success: true,
      message: `SENADA API is healthy. Database (${dialect}) connected.`,
      db: 'connected',
      dialect,
    })
  } catch (err) {
    res.status(200).json({
      success: true,
      message: 'SENADA API is running, but database connection is pending or unreachable.',
      db: 'disconnected',
      dbError: err.message,
    })
  }
})

// ── Rate limiter umum ─────────────────────────────────────────────────────
app.use('/api', generalRateLimiter)

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
