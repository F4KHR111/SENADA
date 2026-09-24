'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Spk extends Model {
    static associate(models) {
      Spk.belongsTo(models.Negosiasi, { foreignKey: 'negosiasi_id', as: 'negosiasi' })
      Spk.belongsTo(models.User, { foreignKey: 'ppk_id', as: 'ppk' })
      Spk.belongsTo(models.VendorProfile, { foreignKey: 'vendor_id', as: 'vendor' })

      Spk.hasOne(models.SerahTerima, { foreignKey: 'spk_id', as: 'serahTerima' })
      Spk.hasOne(models.VendorEvaluation, { foreignKey: 'spk_id', as: 'evaluation' })
      Spk.hasMany(models.LaporanRealisasi, { foreignKey: 'spk_id', as: 'laporanRealisasiList' })
      Spk.hasMany(models.SpmReference, { foreignKey: 'spk_id', as: 'spmReferences' })
    }
  }

  Spk.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    nomor_spk: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    negosiasi_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    ppk_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tanggal_spk: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    tanggal_mulai: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    tanggal_selesai: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nilai_kontrak: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'signed', 'active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft',
    },
    signed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Spk',
    tableName: 'spk',
    underscored: true,
    timestamps: true,
  })

  return Spk
}
