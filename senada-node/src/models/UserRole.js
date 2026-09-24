'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    static associate(models) {
      UserRole.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' })
      UserRole.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' })
    }
  }

  UserRole.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'UserRole',
    tableName: 'user_roles',
    underscored: true,
    timestamps: false,
  })

  return UserRole
}
