'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      name: {
        type:      Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type:      Sequelize.STRING,
        allowNull: false,
        unique:    true,
      },
      password_hash: {
        type:      Sequelize.STRING,
        allowNull: false,
      },
      employee_id: {
        // NIP/ID pegawai — nullable untuk vendor (pihak eksternal)
        type:      Sequelize.STRING,
        allowNull: true,
        unique:    true,
      },
      phone: {
        type:      Sequelize.STRING,
        allowNull: true,
      },
      avatar_url: {
        type:      Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type:         Sequelize.ENUM('active', 'inactive', 'suspended'),
        allowNull:    false,
        defaultValue: 'active',
      },
      last_login_at: {
        type:      Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type:      Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type:      Sequelize.DATE,
        allowNull: false,
      },
      // Master data — soft delete (AGENTS.md §10.1)
      deleted_at: {
        type:      Sequelize.DATE,
        allowNull: true,
      },
    })

    // Index wajib (AGENTS.md §10.1)
    await queryInterface.addIndex('users', ['email'],  { name: 'users_email_idx' })
    await queryInterface.addIndex('users', ['status'], { name: 'users_status_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users')
  },
}
