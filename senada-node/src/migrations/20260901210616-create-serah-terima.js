'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('serah_terima', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      spk_id: {
        // 1-1 dengan spk
        type:       Sequelize.UUID,
        allowNull:  false,
        unique:     true,
        references: { model: 'spk', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      tanggal_serah_terima: {
        type:      Sequelize.DATEONLY,
        allowNull: true,
      },
      status: {
        type:         Sequelize.ENUM('pending', 'completed'),
        allowNull:    false,
        defaultValue: 'pending',
      },
      diterima_oleh: {
        // PPK yang menerima barang/jasa
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
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

    await queryInterface.addIndex('serah_terima', ['spk_id'],        { name: 'serah_terima_spk_id_idx' })
    await queryInterface.addIndex('serah_terima', ['diterima_oleh'], { name: 'serah_terima_diterima_oleh_idx' })
    await queryInterface.addIndex('serah_terima', ['status'],        { name: 'serah_terima_status_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('serah_terima')
  },
}
