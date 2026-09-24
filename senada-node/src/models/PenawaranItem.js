'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class PenawaranItem extends Model {
    static associate(models) {
      PenawaranItem.belongsTo(models.Penawaran, { foreignKey: 'penawaran_id', as: 'penawaran' })
      PenawaranItem.belongsTo(models.HpsItem, { foreignKey: 'hps_item_id', as: 'hpsItem' })
    }
  }

  PenawaranItem.init({
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
    hps_item_id: {
      type: DataTypes.UUID,
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
  }, {
    sequelize,
    modelName: 'PenawaranItem',
    tableName: 'penawaran_items',
    underscored: true,
    timestamps: true,
  })

  return PenawaranItem
}
