require('dotenv').config()

/**
 * config.js — konfigurasi database untuk Sequelize CLI.
 *
 * File ini DIBACA LANGSUNG oleh sequelize-cli (via .sequelizerc).
 * Format wajib: object dengan key 'development' | 'test' | 'production'.
 *
 * Jangan pindah variabel DB ke sini secara langsung — tetap baca dari .env
 * agar tidak ada kredensial hardcode (AGENTS.md §6.7 & §9).
 *
 * Cara pakai CLI:
 *   npx sequelize-cli db:migrate
 *   npx sequelize-cli db:seed:all
 */
module.exports = {
  development: {
    username:        process.env.DB_USER     || 'root',
    password:        process.env.DB_PASSWORD || null,
    database:        process.env.DB_NAME     || 'senada_db',
    host:            process.env.DB_HOST     || '127.0.0.1',
    port:            parseInt(process.env.DB_PORT) || 3306,
    dialect:         'mysql',
    logging:         false,
    dialectOptions: {
      timezone: '+07:00',
    },
    define: {
      underscored: true,   // semua kolom snake_case otomatis
      timestamps:  true,
      createdAt:   'created_at',
      updatedAt:   'updated_at',
    },
  },

  test: {
    username: process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || null,
    database: `${process.env.DB_NAME || 'senada_db'}_test`,
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     parseInt(process.env.DB_PORT) || 3306,
    dialect:  'mysql',
    logging:  false,
    define: {
      underscored: true,
      timestamps:  true,
      createdAt:   'created_at',
      updatedAt:   'updated_at',
    },
  },

  production: {
    username:       process.env.DB_USER,
    password:       process.env.DB_PASSWORD,
    database:       process.env.DB_NAME,
    host:           process.env.DB_HOST,
    port:           parseInt(process.env.DB_PORT) || 3306,
    dialect:        'mysql',
    dialectModule:  require('mysql2'),
    logging:        false,
    dialectOptions: {
      timezone: '+07:00',
      ...(process.env.DB_SSL !== 'false' ? { ssl: { require: true, rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' } } : {}),
    },
    define: {
      underscored: true,
      timestamps:  true,
      createdAt:   'created_at',
      updatedAt:   'updated_at',
    },
  },
}
