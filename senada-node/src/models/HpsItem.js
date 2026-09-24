'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class HpsItem extends Model {
    static associate(models) {
      HpsItem.belongsTo(models.Hps, { foreignKey: 'hps_id', as: 'hps' })
      HpsItem.hasMany(models.PenawaranItem, { foreignKey: 'hps_item_id', as: 'penawaranItems' })
    }
  }

  HpsItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    hps_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    nama_barang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    spesifikasi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    satuan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    volume: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    harga_satuan: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    urutan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'HpsItem',
    tableName: 'hps_items',
    underscored: true,
    timestamps: true,
  })

  return HpsItem
}
