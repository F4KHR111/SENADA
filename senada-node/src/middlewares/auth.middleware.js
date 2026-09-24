'use strict'

const jwt = require('jsonwebtoken')
const { jwt: jwtConfig } = require('../config/env')
const { User, Role, Permission } = require('../models')

/**
 * Helper untuk mengambil list permission unik dari kumpulan roles
 */
function extractPermissions(roles) {
  const permSet = new Set()
  if (Array.isArray(roles)) {
    roles.forEach((r) => {
      if (Array.isArray(r.permissions)) {
        r.permissions.forEach((p) => {
          if (p && p.name) permSet.add(p.name)
        })
      }
    })
  }
  return Array.from(permSet)
}

/**
 * authMiddleware — verifikasi JWT access token dari header Authorization.
 * Token format: Bearer <accessToken>
 *
 * Mengambil data role & permission terkini dari DB (server-side truth)
 * sehingga pencabutan role/permission atau suspend user langsung aktif seketika (AGENTS.md §5 & §6.1).
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token otorisasi tidak ditemukan.',
    })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Format token otorisasi tidak valid.',
    })
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret)

    // Validasi keberadaan dan status user langsung dari DB
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'status'],
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] },
            },
          ],
        },
      ],
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak ditemukan atau sudah dihapus.',
      })
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda sedang dinonaktifkan atau disuspend.',
      })
    }

    const roles = user.roles.map((r) => r.name)
    const permissions = extractPermissions(user.roles)

    // Tempelkan data terverifikasi ke req.user
    req.user = {
      id:          user.id,
      name:        user.name,
      email:       user.email,
      roles:       roles,
      permissions: permissions,
    }

    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token otorisasi telah kadaluarsa.',
      })
    }
    return res.status(401).json({
      success: false,
      message: 'Token otorisasi tidak valid.',
    })
  }
}

module.exports = authMiddleware
