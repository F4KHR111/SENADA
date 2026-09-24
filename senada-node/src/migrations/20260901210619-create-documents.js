'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      entity_type: {
        // Polymorphic: 'hps' | 'penawaran' | 'spk' | 'serah_terima'
        type:      Sequelize.STRING,
        allowNull: false,
      },
      entity_id: {
        // UUID entitas terkait — bukan FK nyata (polymorphic)
        type:      Sequelize.UUID,
        allowNull: false,
      },
      file_name: {
        // Nama file original (untuk tampilan)
        type:      Sequelize.STRING,
        allowNull: false,
      },
      file_path: {
        // Path penyimpanan di server — jangan expose langsung ke client (AGENTS.md §6.5)
        type:      Sequelize.STRING,
        allowNull: false,
      },
      file_type: {
        // MIME type: application/pdf, image/jpeg, image/png
        type:      Sequelize.STRING,
        allowNull: true,
      },
      file_size: {
        // Ukuran dalam bytes
        type:      Sequelize.INTEGER,
        allowNull: true,
      },
      uploaded_by: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      // Hanya created_at — dokumen immutable setelah diupload
      created_at: {
        type:      Sequelize.DATE,
        allowNull: false,
      },
    })

    // Index composite (entity_type, entity_id) — AGENTS.md §10.2
    await queryInterface.addIndex('documents', ['entity_type', 'entity_id'], {
      name: 'documents_entity_type_entity_id_idx',
    })
    await queryInterface.addIndex('documents', ['uploaded_by'], { name: 'documents_uploaded_by_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('documents')
  },
}
