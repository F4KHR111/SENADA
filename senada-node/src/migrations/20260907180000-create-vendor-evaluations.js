'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vendor_evaluations', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      spk_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        unique:     true,
        references: { model: 'spk', key: 'id' },
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
      evaluator_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      kualitas_skor: {
        type:      Sequelize.INTEGER,
        allowNull: false,
      },
      waktu_skor: {
        type:      Sequelize.INTEGER,
        allowNull: false,
      },
      layanan_skor: {
        type:      Sequelize.INTEGER,
        allowNull: false,
      },
      skor_akhir: {
        type:      Sequelize.DECIMAL(3, 2),
        allowNull: false,
      },
      catatan: {
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

    await queryInterface.addIndex('vendor_evaluations', ['spk_id'],        { name: 'vendor_evaluations_spk_id_idx' })
    await queryInterface.addIndex('vendor_evaluations', ['vendor_id'],     { name: 'vendor_evaluations_vendor_id_idx' })
    await queryInterface.addIndex('vendor_evaluations', ['evaluator_id'],  { name: 'vendor_evaluations_evaluator_id_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vendor_evaluations')
  },
}
