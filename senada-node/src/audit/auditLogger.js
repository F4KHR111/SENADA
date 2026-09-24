const logger = require('../utils/logger')
const { AuditLog } = require('../models')

/**
 * auditLogger — mencatat aksi krusial ke tabel audit_logs di DB (AGENTS.md §6.6).
 * Dipanggil dari service layer, bukan langsung dari controller.
 *
 * @param {Object} params
 * @param {string|null} params.userId     — UUID user pelaku (null jika aksi anonim/system)
 * @param {string} params.action         — 'create'|'update'|'approve'|'sign'|'reject'|'login'|'logout'|...
 * @param {string} params.entityType     — nama tabel/entitas (mis. 'users', 'hps', 'spk')
 * @param {string} params.entityId       — UUID entitas
 * @param {Object} [params.before]       — data sebelum perubahan (JSON)
 * @param {Object} [params.after]        — data sesudah perubahan (JSON)
 * @param {string} [params.ipAddress]
 * @param {string} [params.userAgent]
 */
async function auditLog({
  userId = null,
  action,
  entityType,
  entityId,
  before = null,
  after = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    if (AuditLog) {
      await AuditLog.create({
        user_id:     userId,
        action,
        entity_type: entityType,
        entity_id:   entityId,
        before_data: before,
        after_data:  after,
        ip_address:  ipAddress,
        user_agent:  userAgent,
      })
    }

    logger.info(
      `AUDIT | user=${userId || 'anonymous'} action=${action} entity=${entityType}:${entityId}`
    )
  } catch (err) {
    // Jangan throw — kegagalan audit log tidak boleh menggagalkan flow request utama
    logger.error('auditLog error:', err)
  }
}

module.exports = { auditLog }
