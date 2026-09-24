'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('spm_references', {
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
      ppspm_id: {
        // PPSPM yang menginput referensi SPM dari SAKTI
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      nomor_spm: {
        // Diisi manual dari sistem SAKTI (eksternal) — nullable
        type:      Sequelize.STRING,
        allowNull: true,
      },
      tanggal_spm: {
        type:      Sequelize.DATEONLY,
        allowNull: true,
      },
      status: {
        type:         Sequelize.ENUM('pending', 'processed'),
        allowNull:    false,
        defaultValue: 'pending',
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

    await queryInterface.addIndex('spm_references', ['spk_id'],    { name: 'spm_references_spk_id_idx' })
    await queryInterface.addIndex('spm_references', ['ppspm_id'],  { name: 'spm_references_ppspm_id_idx' })
    await queryInterface.addIndex('spm_references', ['status'],    { name: 'spm_references_status_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('spm_references')
  },
}
