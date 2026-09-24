'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class SerahTerima extends Model {
    static associate(models) {
      SerahTerima.belongsTo(models.Spk, { foreignKey: 'spk_id', as: 'spk' })
      SerahTerima.belongsTo(models.User, { foreignKey: 'diterima_oleh', as: 'penerima' })
    }
  }

  SerahTerima.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    spk_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    tanggal_serah_terima: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    diterima_oleh: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'SerahTerima',
    tableName: 'serah_terima',
    underscored: true,
    timestamps: true,
  })

  return SerahTerima
}
