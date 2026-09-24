'use strict'

require('dotenv').config()

const { Sequelize } = require('sequelize')
const mysql2        = require('mysql2')
const env           = require('./env')

/**
 * db.js — Sequelize instance tunggal yang dipakai seluruh aplikasi.
 *
 * Gunakan file ini di mana pun butuh query DB:
 *   const { sequelize, Sequelize } = require('../config/db')
 *   const { Op } = Sequelize
 *
 * Dibaca dari env.js (yang membaca .env) — tidak ada kredensial hardcode.
 *
 * PENTING (AGENTS.md §10.1):
 *   - DILARANG memanggil sequelize.sync() di mana pun.
 *   - Semua perubahan skema wajib lewat: npx sequelize-cli db:migrate
 */
const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password || null,
  {
    host:          env.db.host,
    port:          env.db.port,
    dialect:       'mysql',
    dialectModule: mysql2, // WAJIB untuk Vercel Serverless / NFT bundler
    logging: env.nodeEnv === 'development'
      ? (sql) => require('./env') && require('../utils/logger').debug(`[SQL] ${sql}`)
      : false,
    dialectOptions: {
      timezone: '+07:00',
      ...(process.env.DB_SSL === 'true' || (env.nodeEnv === 'production' && process.env.DB_SSL !== 'false')
        ? { ssl: { require: true, rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' } }
        : {}),
    },
    define: {
      underscored: true,  // nama kolom snake_case (nama_barang, bukan namaBarang)
      timestamps:  true,
      createdAt:   'created_at',
      updatedAt:   'updated_at',
    },
    pool: {
      max:     10,
      min:     0,
      acquire: 30000, // ms menunggu koneksi sebelum throw error
      idle:    10000, // ms koneksi idle sebelum dilepas ke pool
    },
  }
)

module.exports = { sequelize, Sequelize }
