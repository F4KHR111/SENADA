'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      user_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',  // user dihapus → semua refresh token ikut dihapus
      },
      token_hash: {
        type:      Sequelize.STRING,
        allowNull: false,
        comment:   'Hash dari refresh token — jangan simpan token mentah (AGENTS.md §6)',
      },
      user_agent: {
        type:      Sequelize.STRING,
        allowNull: true,
      },
      ip_address: {
        type:      Sequelize.STRING,
        allowNull: true,
      },
      expires_at: {
        type:      Sequelize.DATE,
        allowNull: false,
      },
      revoked_at: {
        type:      Sequelize.DATE,
        allowNull: true,
      },
      // Hanya created_at — tidak ada updated_at (token immutable setelah dibuat)
      created_at: {
        type:      Sequelize.DATE,
        allowNull: false,
      },
    })

    // Index FK dan expires_at untuk cleanup token kadaluarsa
    await queryInterface.addIndex('refresh_tokens', ['user_id'],    { name: 'refresh_tokens_user_id_idx' })
    await queryInterface.addIndex('refresh_tokens', ['expires_at'], { name: 'refresh_tokens_expires_at_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens')
  },
}
