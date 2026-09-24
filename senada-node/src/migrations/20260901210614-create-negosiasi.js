'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('negosiasi', {
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
        onDelete:   'CASCADE',  // negosiasi ikut terhapus jika penawaran dihapus
      },
      round: {
        // Nomor ronde negosiasi (mulai dari 1)
        type:         Sequelize.INTEGER,
        allowNull:    false,
        defaultValue: 1,
      },
      diajukan_oleh: {
        // PBJ yang mengajukan harga nego
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      harga_usulan: {
        type:      Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      status: {
        type:         Sequelize.ENUM('pending', 'accepted', 'rejected'),
        allowNull:    false,
        defaultValue: 'pending',
      },
      catatan: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      responded_at: {
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

    await queryInterface.addIndex('negosiasi', ['penawaran_id'],  { name: 'negosiasi_penawaran_id_idx' })
    await queryInterface.addIndex('negosiasi', ['diajukan_oleh'], { name: 'negosiasi_diajukan_oleh_idx' })
    await queryInterface.addIndex('negosiasi', ['status'],        { name: 'negosiasi_status_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('negosiasi')
  },
}
