require('dotenv').config()

const app              = require('./src/app')
const env              = require('./src/config/env')
const logger           = require('./src/utils/logger')
const { sequelize }    = require('./src/config/db')  // koneksi langsung dari db.js

async function startServer() {
  try {
    // Verifikasi koneksi ke MySQL/XAMPP
    await sequelize.authenticate()
    logger.info(
      `Koneksi database berhasil → ${env.db.host}:${env.db.port}/${env.db.name}`
    )

    app.listen(env.port, () => {
      logger.info(`SENADA API berjalan di http://localhost:${env.port} [${env.nodeEnv}]`)
    })
  } catch (err) {
    logger.error('Gagal koneksi ke database. Pastikan XAMPP MySQL sudah berjalan.')
    logger.error(err.message)
    process.exit(1)
  }
}

startServer()
