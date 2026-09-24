'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      // many-to-many ke Role lewat RolePermission
      Permission.belongsToMany(models.Role, {
        through:    models.RolePermission,
        foreignKey: 'permission_id',
        otherKey:   'role_id',
        as:         'roles',
      })
    }
  }

  Permission.init({
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
      allowNull:    false,
    },
    name: {
      type:      DataTypes.STRING,
      allowNull: false,
      unique:    true,
    },
    module: {
      type:      DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName:   'Permission',
    tableName:   'permissions',
    underscored: true,
    timestamps:  true,
  })

  return Permission
}
