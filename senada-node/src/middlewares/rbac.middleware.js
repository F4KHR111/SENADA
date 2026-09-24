'use strict'

/**
 * rbacMiddleware — cek permission granular per endpoint (AGENTS.md §5).
 * Dipanggil SETELAH authMiddleware (req.user sudah ada).
 *
 * Contoh penggunaan:
 *   router.post('/hps', authMiddleware, rbacMiddleware('hps:create'), hpsController.create)
 *   router.get('/spk', authMiddleware, rbacMiddleware(['spk:read', 'spk:create']), spkController.getAll)
 *
 * @param {string|string[]} requiredPermissions — satu atau lebih permission yang dibutuhkan
 * @param {'any'|'all'} mode — 'any' (default): punya salah satu, 'all': harus memiliki semua
 */
function rbacMiddleware(requiredPermissions, mode = 'any') {
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions]

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan sebelum pemeriksaan izin akses.',
      })
    }

    const userRoles = req.user.roles || []
    const userPermissions = req.user.permissions || []

    // Admin selalu memiliki akses penuh
    if (userRoles.includes('admin')) {
      return next()
    }

    const hasAccess =
      mode === 'all'
        ? permissions.every((p) => userPermissions.includes(p))
        : permissions.some((p) => userPermissions.includes(p))

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini.',
      })
    }

    next()
  }
}

/**
 * requireRole — helper middleware alternatif untuk memeriksa role langsung (opsional)
 * @param {string|string[]} requiredRoles
 */
function requireRole(requiredRoles) {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan.',
      })
    }

    const userRoles = req.user.roles || []
    const hasRole = userRoles.includes('admin') || roles.some((r) => userRoles.includes(r))

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak untuk peran (role) Anda.',
      })
    }

    next()
  }
}

module.exports = {
  rbacMiddleware,
  requireRole,
}
