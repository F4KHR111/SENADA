'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('undangan_vendors', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      undangan_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'undangan', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',   // undangan dihapus → entri vendor undangan ikut terhapus
      },
      vendor_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'vendor_profiles', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',  // vendor tidak boleh dihapus jika masih ada undangan aktif
      },
      status: {
        type:         Sequelize.ENUM('invited', 'viewed', 'submitted', 'declined'),
        allowNull:    false,
        defaultValue: 'invited',
      },
      invited_at: {
        type:      Sequelize.DATE,
        allowNull: true,
      },
      viewed_at: {
        type:      Sequelize.DATE,
        allowNull: true,
      },
    })

    // Unique composite (undangan_id, vendor_id) — satu vendor hanya bisa diundang sekali per undangan
    await queryInterface.addIndex('undangan_vendors', ['undangan_id', 'vendor_id'], {
      name:   'undangan_vendors_undangan_vendor_unique',
      unique: true,
    })

    await queryInterface.addIndex('undangan_vendors', ['undangan_id'], { name: 'undangan_vendors_undangan_id_idx' })
    await queryInterface.addIndex('undangan_vendors', ['vendor_id'],   { name: 'undangan_vendors_vendor_id_idx' })
    await queryInterface.addIndex('undangan_vendors', ['status'],      { name: 'undangan_vendors_status_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('undangan_vendors')
  },
}
