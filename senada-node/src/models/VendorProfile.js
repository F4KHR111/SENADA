'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class VendorProfile extends Model {
    static associate(models) {
      VendorProfile.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' })
      VendorProfile.belongsTo(models.User, { foreignKey: 'verified_by', as: 'verifier' })

      VendorProfile.hasMany(models.UndanganVendor, { foreignKey: 'vendor_id', as: 'undanganVendors' })
      VendorProfile.belongsToMany(models.Undangan, {
        through: models.UndanganVendor,
        foreignKey: 'vendor_id',
        otherKey: 'undangan_id',
        as: 'undanganList',
      })

      VendorProfile.hasMany(models.Spk, { foreignKey: 'vendor_id', as: 'spkList' })
      VendorProfile.hasMany(models.VendorEvaluation, { foreignKey: 'vendor_id', as: 'evaluations' })
    }
  }

  VendorProfile.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    npwp: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank_account_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank_account_holder: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verification_status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'VendorProfile',
    tableName: 'vendor_profiles',
    underscored: true,
    timestamps: true,
    paranoid: true, // soft delete - deleted_at (AGENTS.md §10.1)
  })

  return VendorProfile
}
