'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('spk', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      nomor_spk: {
        type:      Sequelize.STRING,
        allowNull: false,
        unique:    true,
      },
      negosiasi_id: {
        // 1-1: hanya negosiasi yang accepted yang bisa jadi SPK
        type:       Sequelize.UUID,
        allowNull:  false,
        unique:     true,
        references: { model: 'negosiasi', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      ppk_id: {
        // PPK yang menandatangani SPK
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      vendor_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'vendor_profiles', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      tanggal_spk: {
        type:      Sequelize.DATEONLY,
        allowNull: true,
      },
      tanggal_mulai: {
        type:      Sequelize.DATEONLY,
        allowNull: true,
      },
      tanggal_selesai: {
        type:      Sequelize.DATEONLY,
        allowNull: true,
      },
      nilai_kontrak: {
        type:      Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      status: {
        type:         Sequelize.ENUM('draft', 'signed', 'active', 'completed', 'cancelled'),
        allowNull:    false,
        defaultValue: 'draft',
      },
      signed_at: {
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

    // Index wajib (AGENTS.md §10.1) — termasuk nomor_spk
    await queryInterface.addIndex('spk', ['nomor_spk'],    { name: 'spk_nomor_spk_idx' })
    await queryInterface.addIndex('spk', ['negosiasi_id'], { name: 'spk_negosiasi_id_idx' })
    await queryInterface.addIndex('spk', ['ppk_id'],       { name: 'spk_ppk_id_idx' })
    await queryInterface.addIndex('spk', ['vendor_id'],    { name: 'spk_vendor_id_idx' })
    await queryInterface.addIndex('spk', ['status'],       { name: 'spk_status_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('spk')
  },
}
