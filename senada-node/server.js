require('dotenv').config()

const app              = require('./src/app')
const env              = require('./src/config/env')
const logger           = require('./src/utils/logger')
const { sequelize }    = require('./src/config/db')

async function startServer() {
  try {
    await sequelize.authenticate()
    logger.info(
      `Koneksi database berhasil → ${env.db.host}:${env.db.port}/${env.db.name}`
    )

    app.listen(env.port, () => {
      logger.info(`SENADA API berjalan di http://localhost:${env.port} [${env.nodeEnv}]`)
    })
  } catch (err) {
    logger.error('Gagal koneksi ke database.')
    logger.error(err.message)
    if (!process.env.VERCEL) {
      process.exit(1)
    }
  }
}

// Hanya jalankan listener manual jika BUKAN di Vercel Serverless
if (!process.env.VERCEL) {
  startServer()
}

// WAJIB export app untuk Vercel Serverless Functions
module.exports = app
