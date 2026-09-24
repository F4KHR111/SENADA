'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      RolePermission.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' })
      RolePermission.belongsTo(models.Permission, { foreignKey: 'permission_id', as: 'permission' })
    }
  }

  RolePermission.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'RolePermission',
    tableName: 'role_permissions',
    underscored: true,
    timestamps: false,
  })

  return RolePermission
}
