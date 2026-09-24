'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Undangan extends Model {
    static associate(models) {
      Undangan.belongsTo(models.Hps, { foreignKey: 'hps_id', as: 'hps' })
      Undangan.belongsTo(models.User, { foreignKey: 'pbj_id', as: 'pbj' })

      Undangan.hasMany(models.UndanganVendor, { foreignKey: 'undangan_id', as: 'undanganVendors' })
      Undangan.belongsToMany(models.VendorProfile, {
        through: models.UndanganVendor,
        foreignKey: 'undangan_id',
        otherKey: 'vendor_id',
        as: 'vendors',
      })
    }
  }

  Undangan.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    nomor_undangan: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    hps_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    pbj_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'closed'),
      allowNull: false,
      defaultValue: 'draft',
    },
    tanggal_undangan: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    batas_waktu_penawaran: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Undangan',
    tableName: 'undangan',
    underscored: true,
    timestamps: true,
  })

  return Undangan
}
