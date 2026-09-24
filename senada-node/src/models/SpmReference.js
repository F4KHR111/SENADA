'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class SpmReference extends Model {
    static associate(models) {
      SpmReference.belongsTo(models.Spk, { foreignKey: 'spk_id', as: 'spk' })
      SpmReference.belongsTo(models.User, { foreignKey: 'ppspm_id', as: 'ppspm' })
    }
  }

  SpmReference.init({
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
    ppspm_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    nomor_spm: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tanggal_spm: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processed'),
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    sequelize,
    modelName: 'SpmReference',
    tableName: 'spm_references',
    underscored: true,
    timestamps: true,
  })

  return SpmReference
}
