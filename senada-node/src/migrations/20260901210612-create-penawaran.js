'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('penawaran', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      undangan_vendor_id: {
        // 1-1: satu undangan_vendor hanya boleh punya satu penawaran
        type:       Sequelize.UUID,
        allowNull:  false,
        unique:     true,
        references: { model: 'undangan_vendors', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      total_penawaran: {
        type:      Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      status: {
        type:         Sequelize.ENUM('submitted', 'negotiating', 'approved', 'rejected'),
        allowNull:    false,
        defaultValue: 'submitted',
      },
      submitted_at: {
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
    })

    await queryInterface.addIndex('penawaran', ['undangan_vendor_id'], { name: 'penawaran_undangan_vendor_id_idx' })
    await queryInterface.addIndex('penawaran', ['status'],             { name: 'penawaran_status_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('penawaran')
  },
}
