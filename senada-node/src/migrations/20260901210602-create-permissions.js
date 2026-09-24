'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permissions', {
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
        comment:   'Contoh: hps:create, spk:sign, laporan:input',
      },
      module: {
        type:      Sequelize.STRING,
        allowNull: false,
        comment:   'Contoh: hps, undangan, spk',
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
    })

    await queryInterface.addIndex('permissions', ['module'], { name: 'permissions_module_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('permissions')
  },
}
