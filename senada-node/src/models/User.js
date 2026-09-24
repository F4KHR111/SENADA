'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Pivot user_roles
      User.hasMany(models.UserRole, { foreignKey: 'user_id', as: 'userRoles' })
      User.belongsToMany(models.Role, {
        through: models.UserRole,
        foreignKey: 'user_id',
        otherKey: 'role_id',
        as: 'roles',
      })

      // 1-1 ke VendorProfile (jika vendor)
      User.hasOne(models.VendorProfile, { foreignKey: 'user_id', as: 'vendorProfile' })

      // Tokens & Logs
      User.hasMany(models.RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' })
      User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'auditLogs' })

      // Relasi bisnis
      User.hasMany(models.Hps, { foreignKey: 'ppk_id', as: 'hpsCreated' })
      User.hasMany(models.Hps, { foreignKey: 'pbj_id', as: 'hpsVerified' })
      User.hasMany(models.Undangan, { foreignKey: 'pbj_id', as: 'undanganList' })
      User.hasMany(models.Negosiasi, { foreignKey: 'diajukan_oleh', as: 'negosiasiList' })
      User.hasMany(models.Spk, { foreignKey: 'ppk_id', as: 'spkList' })
      User.hasMany(models.SerahTerima, { foreignKey: 'diterima_oleh', as: 'serahTerimaList' })
      User.hasMany(models.LaporanRealisasi, { foreignKey: 'petugas_id', as: 'laporanRealisasiList' })
      User.hasMany(models.SpmReference, { foreignKey: 'ppspm_id', as: 'spmReferences' })
      User.hasMany(models.Document, { foreignKey: 'uploaded_by', as: 'documents' })
      User.hasMany(models.VendorEvaluation, { foreignKey: 'evaluator_id', as: 'evaluationsGiven' })
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active',
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    paranoid: true, // soft delete - deleted_at
  })

  return User
}
