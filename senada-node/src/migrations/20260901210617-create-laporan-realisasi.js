'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('laporan_realisasi', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      spk_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'spk', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      petugas_id: {
        // Petugas Laporan Realisasi yang menginput
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      nilai_realisasi: {
        type:      Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      tanggal_realisasi: {
        type:      Sequelize.DATEONLY,
        allowNull: true,
      },
      keterangan: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type:         Sequelize.ENUM('draft', 'submitted'),
        allowNull:    false,
        defaultValue: 'draft',
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

    await queryInterface.addIndex('laporan_realisasi', ['spk_id'],     { name: 'laporan_realisasi_spk_id_idx' })
    await queryInterface.addIndex('laporan_realisasi', ['petugas_id'], { name: 'laporan_realisasi_petugas_id_idx' })
    await queryInterface.addIndex('laporan_realisasi', ['status'],     { name: 'laporan_realisasi_status_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('laporan_realisasi')
  },
}
