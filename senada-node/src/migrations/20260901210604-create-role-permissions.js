'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permissions', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      role_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'roles', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',
      },
      permission_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'permissions', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',
      },
    })

    // Unique composite (role_id, permission_id)
    await queryInterface.addIndex('role_permissions', ['role_id', 'permission_id'], {
      name:   'role_permissions_role_permission_unique',
      unique: true,
    })

    // Index pada FK individual untuk JOIN cepat
    await queryInterface.addIndex('role_permissions', ['role_id'],       { name: 'role_permissions_role_id_idx' })
    await queryInterface.addIndex('role_permissions', ['permission_id'], { name: 'role_permissions_permission_id_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('role_permissions')
  },
}
