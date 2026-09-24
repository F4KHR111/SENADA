require('dotenv').config()

/**
 * env.js — satu tempat untuk semua environment variable.
 * Gunakan env.PORT, env.jwtAccessSecret, dst. di seluruh aplikasi
 * agar tidak tersebar process.env.XXX di mana-mana.
 */
const env = {
  port:              parseInt(process.env.PORT) || 5000,
  nodeEnv:           process.env.NODE_ENV || 'development',
  clientUrl:         process.env.CLIENT_URL || 'http://localhost:5173',

  db: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    name:     process.env.DB_NAME     || 'senada_db',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    accessSecret:   process.env.JWT_ACCESS_SECRET  || 'senada_jwt_access_secret_development_key_2026_x!9q',
    refreshSecret:  process.env.JWT_REFRESH_SECRET || 'senada_jwt_refresh_secret_development_key_2026_z#4k',
    accessExpires:  process.env.JWT_ACCESS_EXPIRES  || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  adminDefaultEmail:    process.env.ADMIN_DEFAULT_EMAIL || 'admin@senada.go.id',
  adminDefaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin#SENADA2026',
}

module.exports = env
