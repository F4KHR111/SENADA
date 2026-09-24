'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Negosiasi extends Model {
    static associate(models) {
      Negosiasi.belongsTo(models.Penawaran, { foreignKey: 'penawaran_id', as: 'penawaran' })
      Negosiasi.belongsTo(models.User, { foreignKey: 'diajukan_oleh', as: 'pengaju' })
      Negosiasi.hasOne(models.Spk, { foreignKey: 'negosiasi_id', as: 'spk' })
    }
  }

  Negosiasi.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    penawaran_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    diajukan_oleh: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    harga_usulan: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Negosiasi',
    tableName: 'negosiasi',
    underscored: true,
    timestamps: true,
  })

  return Negosiasi
}
