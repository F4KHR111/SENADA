'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class LaporanRealisasi extends Model {
    static associate(models) {
      LaporanRealisasi.belongsTo(models.Spk, { foreignKey: 'spk_id', as: 'spk' })
      LaporanRealisasi.belongsTo(models.User, { foreignKey: 'petugas_id', as: 'petugas' })
    }
  }

  LaporanRealisasi.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    spk_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    petugas_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    nilai_realisasi: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    tanggal_realisasi: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted'),
      allowNull: false,
      defaultValue: 'draft',
    },
  }, {
    sequelize,
    modelName: 'LaporanRealisasi',
    tableName: 'laporan_realisasi',
    underscored: true,
    timestamps: true,
  })

  return LaporanRealisasi
}
