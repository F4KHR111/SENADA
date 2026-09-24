'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      user_id: {
        // Nullable: bisa null jika aksi dilakukan sistem/scheduled job
        type:       Sequelize.UUID,
        allowNull:  true,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'SET NULL',  // user dihapus → audit tetap ada, user_id jadi null
      },
      action: {
        // Contoh: 'create', 'update', 'approve', 'sign', 'reject'
        type:      Sequelize.STRING,
        allowNull: false,
      },
      entity_type: {
        // Nama tabel/entitas yang diubah
        type:      Sequelize.STRING,
        allowNull: false,
      },
      entity_id: {
        // UUID entitas — bukan FK nyata (polymorphic)
        type:      Sequelize.UUID,
        allowNull: false,
      },
      before_data: {
        // State data SEBELUM aksi (JSON) — nullable untuk 'create'
        type:      Sequelize.JSON,
        allowNull: true,
      },
      after_data: {
        // State data SESUDAH aksi (JSON) — nullable untuk 'delete'
        type:      Sequelize.JSON,
        allowNull: true,
      },
      ip_address: {
        type:      Sequelize.STRING,
        allowNull: true,
      },
      user_agent: {
        type:      Sequelize.STRING,
        allowNull: true,
      },
      // Hanya created_at — audit log immutable (tidak boleh diubah/dihapus)
      created_at: {
        type:      Sequelize.DATE,
        allowNull: false,
      },
    })

    // Index composite (entity_type, entity_id) — AGENTS.md §10.2
    await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id'], {
      name: 'audit_logs_entity_type_entity_id_idx',
    })
    await queryInterface.addIndex('audit_logs', ['user_id'], { name: 'audit_logs_user_id_idx' })
    await queryInterface.addIndex('audit_logs', ['action'],  { name: 'audit_logs_action_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs')
  },
}
