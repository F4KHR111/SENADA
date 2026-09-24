'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class VendorEvaluation extends Model {
    static associate(models) {
      VendorEvaluation.belongsTo(models.Spk, { foreignKey: 'spk_id', as: 'spk' })
      VendorEvaluation.belongsTo(models.VendorProfile, { foreignKey: 'vendor_id', as: 'vendor' })
      VendorEvaluation.belongsTo(models.User, { foreignKey: 'evaluator_id', as: 'evaluator' })
    }
  }

  VendorEvaluation.init({
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
    vendor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    evaluator_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    kualitas_skor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    waktu_skor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    layanan_skor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    skor_akhir: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'VendorEvaluation',
    tableName: 'vendor_evaluations',
    underscored: true,
    timestamps: true,
  })

  return VendorEvaluation
}
