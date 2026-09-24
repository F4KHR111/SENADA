'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      name: {
        type:      Sequelize.STRING,
        allowNull: false,
        unique:    true,
        comment:   'Slug role: admin, ppk, pbj, penyedia, ppspm, petugas_laporan',
      },
      label: {
        type:      Sequelize.STRING,
        allowNull: false,
        comment:   'Nama tampilan role',
      },
      description: {
        type:      Sequelize.TEXT,
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

    // Index pada name (sudah unique, tapi eksplisit untuk lookup cepat)
    await queryInterface.addIndex('roles', ['name'], { name: 'roles_name_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('roles')
  },
}
