'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vendor_profiles', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
        allowNull:    false,
      },
      user_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        unique:     true,         // 1-1 dengan users
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',    // user vendor dihapus → profil ikut terhapus
      },
      company_name: {
        type:      Sequelize.STRING,
        allowNull: false,
      },
      npwp: {
        type:      Sequelize.STRING,
        allowNull: false,
        unique:    true,
      },
      address: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      city: {
        type:      Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type:      Sequelize.STRING,
        allowNull: true,
      },
      bank_name: {
        type:      Sequelize.STRING,
        allowNull: true,
      },
      bank_account_number: {
        type:      Sequelize.STRING,
        allowNull: true,
      },
      bank_account_holder: {
        type:      Sequelize.STRING,
        allowNull: true,
      },
      verification_status: {
        type:         Sequelize.ENUM('pending', 'verified', 'rejected'),
        allowNull:    false,
        defaultValue: 'pending',
      },
      verified_by: {
        // FK ke users.id (admin/PBJ yang memverifikasi) — nullable
        type:       Sequelize.UUID,
        allowNull:  true,
        references: { model: 'users', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'SET NULL',
      },
      verified_at: {
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
      // Master data — soft delete (AGENTS.md §10.1)
      deleted_at: {
        type:      Sequelize.DATE,
        allowNull: true,
      },
    })

    // Index FK dan filter kolom
    await queryInterface.addIndex('vendor_profiles', ['user_id'],             { name: 'vendor_profiles_user_id_idx' })
    await queryInterface.addIndex('vendor_profiles', ['verified_by'],         { name: 'vendor_profiles_verified_by_idx' })
    await queryInterface.addIndex('vendor_profiles', ['verification_status'], { name: 'vendor_profiles_verification_status_idx' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vendor_profiles')
  },
}
