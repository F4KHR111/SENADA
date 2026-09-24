const winston = require('winston')
const { nodeEnv } = require('../config/env')

/**
 * logger — Winston application logger.
 * Level: debug (dev) / warn (production).
 * Untuk audit krusial, gunakan auditLogger di src/audit/.
 */
const logger = winston.createLogger({
  level: nodeEnv === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    nodeEnv === 'production'
      ? winston.format.json()
      : winston.format.printf(({ timestamp, level, message, stack }) =>
          stack
            ? `${timestamp} [${level.toUpperCase()}] ${message}\n${stack}`
            : `${timestamp} [${level.toUpperCase()}] ${message}`
        )
  ),
  transports: [
    new winston.transports.Console(),
    ...(process.env.VERCEL
      ? []
      : [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]),
  ],
})

module.exports = logger
