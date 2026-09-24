'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // many-to-many ke User lewat UserRole
      Role.belongsToMany(models.User, {
        through:    models.UserRole,
        foreignKey: 'role_id',
        otherKey:   'user_id',
        as:         'users',
      })
      // many-to-many ke Permission lewat RolePermission
      Role.belongsToMany(models.Permission, {
        through:    models.RolePermission,
        foreignKey: 'role_id',
        otherKey:   'permission_id',
        as:         'permissions',
      })
    }
  }

  Role.init({
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
    label: {
      type:      DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName:  'Role',
    tableName:  'roles',
    underscored: true,
    timestamps:  true,
    paranoid:    true,  // soft delete — deleted_at (AGENTS.md §10.1)
  })

  return Role
}
