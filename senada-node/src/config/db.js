'use strict'

require('dotenv').config()

const { Sequelize } = require('sequelize')
const mysql2        = require('mysql2')
const env           = require('./env')

const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL
const isPostgres  = !!postgresUrl

/**
 * db.js — Sequelize instance tunggal yang dipakai seluruh aplikasi.
 * Mendukung PostgreSQL (Vercel Postgres bawaan) dan MySQL (XAMPP / Cloud).
 */
const sequelize = isPostgres
  ? new Sequelize(postgresUrl, {
      dialect:       'postgres',
      dialectModule: require('pg'),
      logging:       env.nodeEnv === 'development'
        ? (sql) => require('../utils/logger').debug(`[SQL] ${sql}`)
        : false,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
      define: {
        underscored: true,
        timestamps:  true,
        createdAt:   'created_at',
        updatedAt:   'updated_at',
      },
      pool: {
        max:     5,
        min:     0,
        acquire: 30000,
        idle:    10000,
      },
    })
  : new Sequelize(
      env.db.name,
      env.db.user,
      env.db.password || null,
      {
        host:          env.db.host,
        port:          env.db.port,
        dialect:       'mysql',
        dialectModule: mysql2,
        logging:       env.nodeEnv === 'development'
          ? (sql) => require('./env') && require('../utils/logger').debug(`[SQL] ${sql}`)
          : false,
        dialectOptions: {
          timezone: '+07:00',
          ...(process.env.DB_SSL === 'true' || (env.nodeEnv === 'production' && process.env.DB_SSL !== 'false')
            ? { ssl: { require: true, rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' } }
            : {}),
        },
        define: {
          underscored: true,
          timestamps:  true,
          createdAt:   'created_at',
          updatedAt:   'updated_at',
        },
        pool: {
          max:     10,
          min:     0,
          acquire: 30000,
          idle:    10000,
        },
      }
    )

module.exports = { sequelize, Sequelize }
