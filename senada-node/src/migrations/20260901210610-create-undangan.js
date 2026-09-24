'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('undangan', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      nomor_undangan: {
        type:      Sequelize.STRING,
        allowNull: false,
        unique:    true,
      },
      hps_id: {
        // 1-1 dengan hps: satu HPS hanya menghasilkan satu undangan
        type:       Sequelize.UUID,
        allowNull:  false,
        unique:     true,
        references: { model: 'hps', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      pbj_id: {
        // PBJ yang membuat undangan
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      status: {
        type:         Sequelize.ENUM('draft', 'sent', 'closed'),
        allowNull:    false,
        defaultValue: 'draft',
      },
      tanggal_undangan: {
        type:      Sequelize.DATEONLY,
        allowNull: true,
      },
      batas_waktu_penawaran: {
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

    await queryInterface.addIndex('undangan', ['hps_id'], { name: 'undangan_hps_id_idx' })
    await queryInterface.addIndex('undangan', ['pbj_id'], { name: 'undangan_pbj_id_idx' })
    await queryInterface.addIndex('undangan', ['status'], { name: 'undangan_status_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('undangan')
  },
}
