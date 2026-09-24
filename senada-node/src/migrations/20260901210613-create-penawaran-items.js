'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('penawaran_items', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      penawaran_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'penawaran', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',  // item ikut terhapus jika penawaran dihapus
      },
      hps_item_id: {
        // Acuan ke hps_items — barang & volume fixed dari HPS, vendor hanya input harga
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'hps_items', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',  // hps_item tidak boleh dihapus jika ada penawaran terkait
      },
      harga_satuan: {
        type:      Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      subtotal: {
        type:      Sequelize.DECIMAL(15, 2),
        allowNull: false,
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

    await queryInterface.addIndex('penawaran_items', ['penawaran_id'],  { name: 'penawaran_items_penawaran_id_idx' })
    await queryInterface.addIndex('penawaran_items', ['hps_item_id'],   { name: 'penawaran_items_hps_item_id_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('penawaran_items')
  },
}
