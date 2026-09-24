'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hps', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      nomor_hps: {
        type:      Sequelize.STRING,
        allowNull: false,
        unique:    true,
      },
      nama_paket: {
        type:      Sequelize.STRING,
        allowNull: false,
      },
      deskripsi: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      fiscal_year: {
        type:      Sequelize.INTEGER,
        allowNull: false,
      },
      ppk_id: {
        // PPK yang membuat HPS
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      pbj_id: {
        // PBJ yang memverifikasi — nullable, diisi saat verifikasi
        type:       Sequelize.UUID,
        allowNull:  true,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      status: {
        type:         Sequelize.ENUM('draft', 'verified', 'fixed'),
        allowNull:    false,
        defaultValue: 'draft',
      },
      total_harga: {
        type:         Sequelize.DECIMAL(15, 2),
        allowNull:    false,
        defaultValue: 0,
      },
      verified_at: {
        type:      Sequelize.DATE,
        allowNull: true,
      },
      fixed_at: {
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

    // Index wajib (AGENTS.md §10.1)
    await queryInterface.addIndex('hps', ['nomor_hps'],   { name: 'hps_nomor_hps_idx' })
    await queryInterface.addIndex('hps', ['ppk_id'],      { name: 'hps_ppk_id_idx' })
    await queryInterface.addIndex('hps', ['pbj_id'],      { name: 'hps_pbj_id_idx' })
    await queryInterface.addIndex('hps', ['status'],      { name: 'hps_status_idx' })
    await queryInterface.addIndex('hps', ['fiscal_year'], { name: 'hps_fiscal_year_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('hps')
  },
}
