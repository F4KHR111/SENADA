'use strict'

const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt    = require('jsonwebtoken')
const { Op } = require('sequelize')
const {
  User,
  Role,
  Permission,
  UserRole,
  VendorProfile,
  RefreshToken,
  sequelize,
} = require('../models')
const env          = require('../config/env')
const { auditLog } = require('../audit/auditLogger')

/**
 * Hash raw token string menggunakan SHA-256 untuk disimpan di DB
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Generate Access Token JWT (umur pendek: 15 menit)
 */
function generateAccessToken(user, roleNames, permissions) {
  return jwt.sign(
    {
      id:          user.id,
      email:       user.email,
      name:        user.name,
      roles:       roleNames,
      permissions: permissions,
    },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpires || '15m' }
  )
}

/**
 * Helper untuk mengambil list permission unik dari kumpulan roles user
 */
function extractUserPermissions(roles) {
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
 * Helper untuk fetch user lengkap beserta roles dan permissions dari DB
 */
async function fetchUserWithRolesAndPermissions(userIdOrEmail) {
  const whereClause = typeof userIdOrEmail === 'string' && userIdOrEmail.includes('@')
    ? { email: userIdOrEmail }
    : { id: userIdOrEmail }

  return User.findOne({
    where: whereClause,
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
      {
        model: VendorProfile,
        as: 'vendorProfile',
      },
    ],
  })
}

class AuthService {
  /**
   * Register akun Vendor (Penyedia)
   * Otomatis membuat User dengan role 'penyedia' dan VendorProfile dalam 1 transaksi DB.
   */
  static async registerVendor(data, meta = {}) {
    const {
      name,
      email,
      password,
      company_name,
      npwp,
      address,
      city,
      phone,
      bank_name,
      bank_account_number,
      bank_account_holder,
    } = data

    // 1. Cek duplikasi email
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      const err = new Error('Email sudah terdaftar.')
      err.statusCode = 409
      throw err
    }

    // 2. Cek duplikasi NPWP
    const existingVendor = await VendorProfile.findOne({ where: { npwp } })
    if (existingVendor) {
      const err = new Error('NPWP sudah terdaftar pada akun lain.')
      err.statusCode = 409
      throw err
    }

    // 3. Ambil role 'penyedia'
    const penyediaRole = await Role.findOne({ where: { name: 'penyedia' } })
    if (!penyediaRole) {
      const err = new Error("Role 'penyedia' belum dikonfigurasi di sistem.")
      err.statusCode = 500
      throw err
    }

    // 4. Hash password (minimal 10 salt rounds sesuai AGENTS.md §2 & §6.1)
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 5. Eksekusi transaksi DB
    const result = await sequelize.transaction(async (t) => {
      const newUser = await User.create(
        {
          name,
          email,
          password_hash: passwordHash,
          phone: phone || null,
          status: 'active',
        },
        { transaction: t }
      )

      await UserRole.create(
        {
          user_id: newUser.id,
          role_id: penyediaRole.id,
        },
        { transaction: t }
      )

      const newVendorProfile = await VendorProfile.create(
        {
          user_id:             newUser.id,
          company_name,
          npwp,
          address:             address || null,
          city:                city || null,
          phone:               phone || null,
          bank_name:           bank_name || null,
          bank_account_number: bank_account_number || null,
          bank_account_holder: bank_account_holder || null,
          verification_status: 'pending',
        },
        { transaction: t }
      )

      return { user: newUser, vendorProfile: newVendorProfile }
    })

    // Audit Log
    await auditLog({
      userId:     result.user.id,
      action:     'register_vendor',
      entityType: 'users',
      entityId:   result.user.id,
      after: {
        email,
        company_name,
        npwp,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return {
      id:            result.user.id,
      name:          result.user.name,
      email:         result.user.email,
      phone:         result.user.phone,
      status:        result.user.status,
      vendorProfile: result.vendorProfile,
    }
  }

  /**
   * Login user (email + password)
   */
  static async login({ email, password, ipAddress, userAgent }) {
    const user = await fetchUserWithRolesAndPermissions(email)

    if (!user) {
      const err = new Error('Email atau password salah.')
      err.statusCode = 401
      throw err
    }

    if (user.status !== 'active') {
      const err = new Error('Akun Anda sedang dinonaktifkan atau disuspend.')
      err.statusCode = 403
      throw err
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      const err = new Error('Email atau password salah.')
      err.statusCode = 401
      throw err
    }

    // Role & permissions
    const roleNames = user.roles.map((r) => r.name)
    const permissions = extractUserPermissions(user.roles)

    // Generate tokens
    const accessToken = generateAccessToken(user, roleNames, permissions)
    const rawRefreshToken = crypto.randomBytes(40).toString('hex')
    const tokenHash = hashToken(rawRefreshToken)

    // Hitung expires_at untuk refresh token (7 hari)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Simpan hash refresh token di DB
    await RefreshToken.create({
      user_id:    user.id,
      token_hash: tokenHash,
      user_agent: userAgent || null,
      ip_address: ipAddress || null,
      expires_at: expiresAt,
    })

    // Update last login
    user.last_login_at = new Date()
    await user.save()

    // Audit log login
    await auditLog({
      userId:     user.id,
      action:     'login',
      entityType: 'users',
      entityId:   user.id,
      ipAddress,
      userAgent,
    })

    return {
      user: {
        id:            user.id,
        name:          user.name,
        email:         user.email,
        employee_id:   user.employee_id,
        avatar_url:    user.avatar_url,
        roles:         roleNames,
        permissions:   permissions,
        vendorProfile: user.vendorProfile || null,
      },
      accessToken,
      rawRefreshToken,
      expiresAt,
    }
  }

  /**
   * Refresh Token (Rotasi token refresh setiap kali digunakan)
   */
  static async refreshAccessToken({ rawRefreshToken, ipAddress, userAgent }) {
    if (!rawRefreshToken) {
      const err = new Error('Refresh token tidak ditemukan.')
      err.statusCode = 401
      throw err
    }

    const tokenHash = hashToken(rawRefreshToken)

    const storedToken = await RefreshToken.findOne({
      where: {
        token_hash: tokenHash,
        revoked_at: null,
        expires_at: { [Op.gt]: new Date() },
      },
    })

    if (!storedToken) {
      const err = new Error('Refresh token tidak valid atau sudah kadaluarsa.')
      err.statusCode = 401
      throw err
    }

    const user = await fetchUserWithRolesAndPermissions(storedToken.user_id)
    if (!user || user.status !== 'active') {
      const err = new Error('Akun pengguna tidak aktif.')
      err.statusCode = 403
      throw err
    }

    // 1. Revoke token lama (rotasi token)
    storedToken.revoked_at = new Date()
    await storedToken.save()

    // 2. Generate token baru
    const roleNames = user.roles.map((r) => r.name)
    const permissions = extractUserPermissions(user.roles)
    const newAccessToken = generateAccessToken(user, roleNames, permissions)

    const newRawRefreshToken = crypto.randomBytes(40).toString('hex')
    const newTokenHash = hashToken(newRawRefreshToken)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await RefreshToken.create({
      user_id:    user.id,
      token_hash: newTokenHash,
      user_agent: userAgent || null,
      ip_address: ipAddress || null,
      expires_at: expiresAt,
    })

    return {
      accessToken:     newAccessToken,
      rawRefreshToken: newRawRefreshToken,
      expiresAt,
    }
  }

  /**
   * Logout (Revoke refresh token)
   */
  static async logout({ rawRefreshToken, userId, ipAddress, userAgent }) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken)
      await RefreshToken.update(
        { revoked_at: new Date() },
        {
          where: {
            token_hash: tokenHash,
            revoked_at: null,
          },
        }
      )
    }

    if (userId) {
      await auditLog({
        userId,
        action:     'logout',
        entityType: 'users',
        entityId:   userId,
        ipAddress,
        userAgent,
      })
    }

    return true
  }

  /**
   * Get Current Authenticated User profile
   */
  static async getMe(userId) {
    const user = await fetchUserWithRolesAndPermissions(userId)
    if (!user) {
      const err = new Error('User tidak ditemukan.')
      err.statusCode = 404
      throw err
    }

    const roleNames = user.roles.map((r) => r.name)
    const permissions = extractUserPermissions(user.roles)

    return {
      id:            user.id,
      name:          user.name,
      email:         user.email,
      employee_id:   user.employee_id,
      phone:         user.phone,
      avatar_url:    user.avatar_url,
      status:        user.status,
      last_login_at: user.last_login_at,
      roles:         roleNames,
      permissions:   permissions,
      vendorProfile: user.vendorProfile || null,
    }
  }

  /**
   * Update Vendor Profile (NPWP, Alamat, Rekening Bank, dll)
   * AGENTS.md §4 Tahap 3 & §10.2: Profil Perusahaan
   */
  static async updateVendorProfile(userId, data, meta = {}) {
    const user = await User.findByPk(userId, {
      include: [{ model: VendorProfile, as: 'vendorProfile' }],
    })

    if (!user || !user.vendorProfile) {
      const err = new Error('Profil perusahaan penyedia tidak ditemukan.')
      err.statusCode = 404
      throw err
    }

    const vp = user.vendorProfile
    const beforeData = vp.toJSON()

    // Cek keunikan NPWP bila diubah
    if (data.npwp && data.npwp !== vp.npwp) {
      const dup = await VendorProfile.findOne({
        where: {
          npwp: data.npwp,
          id: { [Op.ne]: vp.id },
        },
      })
      if (dup) {
        const err = new Error(`Nomor NPWP '${data.npwp}' sudah terdaftar pada perusahaan lain.`)
        err.statusCode = 409
        throw err
      }
      vp.npwp = data.npwp
    }

    if (data.company_name) vp.company_name = data.company_name
    if (data.address !== undefined) vp.address = data.address
    if (data.city !== undefined) vp.city = data.city
    if (data.phone !== undefined) vp.phone = data.phone
    if (data.bank_name !== undefined) vp.bank_name = data.bank_name
    if (data.bank_account_number !== undefined) vp.bank_account_number = data.bank_account_number
    if (data.bank_account_holder !== undefined) vp.bank_account_holder = data.bank_account_holder

    // Jika user juga mengupdate nama PIC atau nomor telepon akun
    if (data.pic_name) user.name = data.pic_name
    if (data.phone) user.phone = data.phone

    await sequelize.transaction(async (t) => {
      await vp.save({ transaction: t })
      await user.save({ transaction: t })
    })

    // Audit Log
    await auditLog({
      userId,
      action:     'update_vendor_profile',
      entityType: 'vendor_profiles',
      entityId:   vp.id,
      before:     beforeData,
      after:      vp.toJSON(),
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return this.getMe(userId)
  }
}

module.exports = AuthService
