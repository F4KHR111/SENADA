'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Penawaran extends Model {
    static associate(models) {
      Penawaran.belongsTo(models.UndanganVendor, { foreignKey: 'undangan_vendor_id', as: 'undanganVendor' })
      Penawaran.hasMany(models.PenawaranItem, { foreignKey: 'penawaran_id', as: 'items' })
      Penawaran.hasMany(models.Negosiasi, { foreignKey: 'penawaran_id', as: 'negosiasiList' })
    }
  }

  Penawaran.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    undangan_vendor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    total_penawaran: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('submitted', 'negotiating', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'submitted',
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Penawaran',
    tableName: 'penawaran',
    underscored: true,
    timestamps: true,
  })

  return Penawaran
}
