'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hps_items', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      hps_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'hps', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',  // rincian ikut terhapus jika HPS induk dihapus (draft)
      },
      nama_barang: {
        type:      Sequelize.STRING,
        allowNull: false,
      },
      spesifikasi: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      satuan: {
        type:      Sequelize.STRING,
        allowNull: false,
      },
      volume: {
        type:      Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      harga_satuan: {
        type:      Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      subtotal: {
        // volume × harga_satuan — disimpan untuk performa query
        type:      Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      urutan: {
        type:         Sequelize.INTEGER,
        allowNull:    false,
        defaultValue: 0,
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

    await queryInterface.addIndex('hps_items', ['hps_id'], { name: 'hps_items_hps_id_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('hps_items')
  },
}
