'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Hps extends Model {
    static associate(models) {
      Hps.belongsTo(models.User, { foreignKey: 'ppk_id', as: 'ppk' })
      Hps.belongsTo(models.User, { foreignKey: 'pbj_id', as: 'pbj' })

      Hps.hasMany(models.HpsItem, { foreignKey: 'hps_id', as: 'items' })
      Hps.hasOne(models.Undangan, { foreignKey: 'hps_id', as: 'undangan' })
    }
  }

  Hps.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    nomor_hps: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nama_paket: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fiscal_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ppk_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    pbj_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'verified', 'fixed'),
      allowNull: false,
      defaultValue: 'draft',
    },
    total_harga: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fixed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Hps',
    tableName: 'hps',
    underscored: true,
    timestamps: true,
  })

  return Hps
}
