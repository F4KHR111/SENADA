'use strict'
const crypto = require('crypto')

const ROLE_PERMISSIONS_MAP = {
  admin: '*', // All permissions
  ppk: [
    'hps:create', 'hps:read', 'hps:update', 'hps:delete',
    'undangan:read',
    'penawaran:read',
    'negosiasi:read',
    'spk:create', 'spk:read', 'spk:update', 'spk:sign',
    'serah_terima:create', 'serah_terima:read', 'serah_terima:update',
    'laporan:read',
    'spm:read',
    'vendor:read',
    'document:read', 'document:upload',
    'audit:read',
  ],
  pbj: [
    'hps:read', 'hps:verify',
    'undangan:create', 'undangan:read', 'undangan:update', 'undangan:delete',
    'vendor:read', 'vendor:verify',
    'penawaran:read',
    'negosiasi:create', 'negosiasi:read', 'negosiasi:update',
    'spk:read',
    'serah_terima:read',
    'document:read', 'document:upload',
  ],
  penyedia: [
    'undangan:read',
    'penawaran:create', 'penawaran:read', 'penawaran:update',
    'negosiasi:read', 'negosiasi:respond',
    'spk:read',
    'serah_terima:read',
    'document:read', 'document:upload',
  ],
  ppspm: [
    'spk:read',
    'serah_terima:read',
    'spm:create', 'spm:read', 'spm:update',
    'laporan:read',
    'document:read',
  ],
  petugas_laporan: [
    'spk:read',
    'serah_terima:read',
    'laporan:create', 'laporan:read', 'laporan:update',
    'spm:read',
    'document:read',
  ],
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles',
      { type: Sequelize.QueryTypes.SELECT }
    )
    const permissions = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions',
      { type: Sequelize.QueryTypes.SELECT }
    )

    const roleMap = new Map(roles.map((r) => [r.name, r.id]))
    const permMap = new Map(permissions.map((p) => [p.name, p.id]))

    const pivotRows = []

    for (const [roleName, permList] of Object.entries(ROLE_PERMISSIONS_MAP)) {
      const roleId = roleMap.get(roleName)
      if (!roleId) continue

      if (permList === '*') {
        // Berikan semua permission untuk role admin
        for (const perm of permissions) {
          pivotRows.push({
            id:            crypto.randomUUID(),
            role_id:       roleId,
            permission_id: perm.id,
          })
        }
      } else {
        for (const pName of permList) {
          const permId = permMap.get(pName)
          if (permId) {
            pivotRows.push({
              id:            crypto.randomUUID(),
              role_id:       roleId,
              permission_id: permId,
            })
          }
        }
      }
    }

    if (pivotRows.length > 0) {
      await queryInterface.bulkInsert('role_permissions', pivotRows, {
        ignoreDuplicates: true,
      })
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('role_permissions', null, {})
  },
}
