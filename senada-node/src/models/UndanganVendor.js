'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class UndanganVendor extends Model {
    static associate(models) {
      UndanganVendor.belongsTo(models.Undangan, { foreignKey: 'undangan_id', as: 'undangan' })
      UndanganVendor.belongsTo(models.VendorProfile, { foreignKey: 'vendor_id', as: 'vendor' })
      UndanganVendor.hasOne(models.Penawaran, { foreignKey: 'undangan_vendor_id', as: 'penawaran' })
    }
  }

  UndanganVendor.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    undangan_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('invited', 'viewed', 'submitted', 'declined'),
      allowNull: false,
      defaultValue: 'invited',
    },
    invited_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    viewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'UndanganVendor',
    tableName: 'undangan_vendors',
    underscored: true,
    timestamps: false,
  })

  return UndanganVendor
}
