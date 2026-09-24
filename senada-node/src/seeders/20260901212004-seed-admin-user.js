'use strict'
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const env    = require('../config/env')

const ADMIN_USER_ID = '00000000-0000-4000-8000-000000000099'
const ADMIN_ROLE_ID = '00000000-0000-4000-8000-000000000001'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminEmail    = env.adminDefaultEmail
    const adminPassword = env.adminDefaultPassword

    // Hash password dengan bcrypt minimal 10 salt rounds (AGENTS.md §2 & §6.1)
    const saltRounds   = 10
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds)

    // Cek apakah user admin sudah ada berdasarkan email
    const existingUsers = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email',
      {
        replacements: { email: adminEmail },
        type: Sequelize.QueryTypes.SELECT,
      }
    )

    let userId = ADMIN_USER_ID

    if (existingUsers.length === 0) {
      await queryInterface.bulkInsert('users', [
        {
          id:            ADMIN_USER_ID,
          name:          'Super Administrator',
          email:         adminEmail,
          password_hash: passwordHash,
          employee_id:   '198001012005011001',
          phone:         '081234567890',
          status:        'active',
          created_at:    new Date(),
          updated_at:    new Date(),
        },
      ])
    } else {
      userId = existingUsers[0].id
      await queryInterface.bulkUpdate(
        'users',
        { password_hash: passwordHash, updated_at: new Date() },
        { id: userId }
      )
    }

    // Pastikan relasi ke role 'admin' ada di user_roles
    const existingUserRoles = await queryInterface.sequelize.query(
      'SELECT id FROM user_roles WHERE user_id = :userId AND role_id = :roleId',
      {
        replacements: { userId, roleId: ADMIN_ROLE_ID },
        type: Sequelize.QueryTypes.SELECT,
      }
    )

    if (existingUserRoles.length === 0) {
      await queryInterface.bulkInsert('user_roles', [
        {
          id:      crypto.randomUUID(),
          user_id: userId,
          role_id: ADMIN_ROLE_ID,
        },
      ])
    }
  },

  async down(queryInterface, Sequelize) {
    // Hapus user_role admin
    await queryInterface.bulkDelete('user_roles', {
      role_id: ADMIN_ROLE_ID,
    })

    // Hapus akun admin
    await queryInterface.bulkDelete('users', {
      email: env.adminDefaultEmail,
    })
  },
}
