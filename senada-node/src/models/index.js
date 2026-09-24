'use strict'

const { sequelize, Sequelize } = require('../config/db')

/**
 * models/index.js — model loader terpusat.
 *
 * Mengimpor dan menginisialisasi 20 model Sequelize sesuai AGENTS.md §10.2 & §10.3,
 * lalu menjalankan associate(db) untuk mengatur seluruh relasi.
 */
const db = {}

// ── Inisialisasi 20 Model ───────────────────────────────────────────────
db.Role             = require('./Role')(sequelize, Sequelize.DataTypes)
db.Permission       = require('./Permission')(sequelize, Sequelize.DataTypes)
db.User             = require('./User')(sequelize, Sequelize.DataTypes)
db.RolePermission   = require('./RolePermission')(sequelize, Sequelize.DataTypes)
db.UserRole         = require('./UserRole')(sequelize, Sequelize.DataTypes)
db.RefreshToken     = require('./RefreshToken')(sequelize, Sequelize.DataTypes)
db.VendorProfile    = require('./VendorProfile')(sequelize, Sequelize.DataTypes)
db.Hps              = require('./Hps')(sequelize, Sequelize.DataTypes)
db.HpsItem          = require('./HpsItem')(sequelize, Sequelize.DataTypes)
db.Undangan         = require('./Undangan')(sequelize, Sequelize.DataTypes)
db.UndanganVendor   = require('./UndanganVendor')(sequelize, Sequelize.DataTypes)
db.Penawaran        = require('./Penawaran')(sequelize, Sequelize.DataTypes)
db.PenawaranItem    = require('./PenawaranItem')(sequelize, Sequelize.DataTypes)
db.Negosiasi        = require('./Negosiasi')(sequelize, Sequelize.DataTypes)
db.Spk              = require('./Spk')(sequelize, Sequelize.DataTypes)
db.SerahTerima      = require('./SerahTerima')(sequelize, Sequelize.DataTypes)
db.LaporanRealisasi = require('./LaporanRealisasi')(sequelize, Sequelize.DataTypes)
db.SpmReference     = require('./SpmReference')(sequelize, Sequelize.DataTypes)
db.Document         = require('./Document')(sequelize, Sequelize.DataTypes)
db.AuditLog         = require('./AuditLog')(sequelize, Sequelize.DataTypes)
db.VendorEvaluation = require('./VendorEvaluation')(sequelize, Sequelize.DataTypes)

// ── Jalankan associate() setiap model (relasi antar model) ───────────────
Object.values(db).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
