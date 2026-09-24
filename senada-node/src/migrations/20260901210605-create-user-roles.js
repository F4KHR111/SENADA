'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      user_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',   // user dihapus → entri pivot ikut terhapus
      },
      role_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'roles', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',  // role tidak boleh dihapus jika masih dipakai user
      },
    })

    // Unique composite (user_id, role_id)
    await queryInterface.addIndex('user_roles', ['user_id', 'role_id'], {
      name:   'user_roles_user_role_unique',
      unique: true,
    })

    // Index FK individual
    await queryInterface.addIndex('user_roles', ['user_id'], { name: 'user_roles_user_id_idx' })
    await queryInterface.addIndex('user_roles', ['role_id'], { name: 'user_roles_role_id_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_roles')
  },
}
