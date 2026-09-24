'use strict'

const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')
const { User, Role, UserRole, VendorProfile, AuditLog, sequelize } = require('../models')
const { auditLog } = require('../audit/auditLogger')

class AdminService {
  /**
   * 1. Dashboard Stats
   * Ringkasan jumlah user per role, total user, dan jumlah vendor status pending
   */
  static async getDashboardStats() {
    // Hitung total user per role
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'label'],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'status'],
          through: { attributes: [] },
        },
      ],
    })

    const usersByRole = roles.map((role) => ({
      id: role.id,
      name: role.name,
      label: role.label,
      total: role.users ? role.users.length : 0,
      active: role.users ? role.users.filter((u) => u.status === 'active').length : 0,
    }))

    // Total seluruh user aktif & nonaktif
    const totalUsers = await User.count()
    const activeUsers = await User.count({ where: { status: 'active' } })
    const inactiveUsers = await User.count({ where: { status: { [Op.ne]: 'active' } } })

    // Hitung vendor status
    const pendingVendors = await VendorProfile.count({ where: { verification_status: 'pending' } })
    const verifiedVendors = await VendorProfile.count({ where: { verification_status: 'verified' } })
    const rejectedVendors = await VendorProfile.count({ where: { verification_status: 'rejected' } })

    // Total audit logs
    const totalAuditLogs = await AuditLog.count()

    return {
      users_by_role: usersByRole,
      total_users: totalUsers,
      active_users: activeUsers,
      inactive_users: inactiveUsers,
      vendors: {
        pending: pendingVendors,
        verified: verifiedVendors,
        rejected: rejectedVendors,
        total: pendingVendors + verifiedVendors + rejectedVendors,
      },
      total_audit_logs: totalAuditLogs,
    }
  }

  /**
   * 2. User Management
   */
  static async getUsers(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10))
    const offset = (page - 1) * limit

    const where = {}
    if (query.status) {
      where.status = query.status
    }
    if (query.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${query.search}%` } },
        { email: { [Op.like]: `%${query.search}%` } },
        { employee_id: { [Op.like]: `%${query.search}%` } },
      ]
    }

    const roleInclude = {
      model: Role,
      as: 'roles',
      through: { attributes: [] },
      attributes: ['id', 'name', 'label'],
    }
    if (query.role) {
      roleInclude.where = { name: query.role }
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: [
        'id',
        'name',
        'email',
        'employee_id',
        'phone',
        'status',
        'last_login_at',
        'created_at',
        'updated_at',
      ],
      include: [
        roleInclude,
        {
          model: VendorProfile,
          as: 'vendorProfile',
          attributes: ['id', 'company_name', 'npwp', 'verification_status'],
        },
      ],
      order: [['created_at', 'DESC']],
      distinct: true,
      limit,
      offset,
    })

    return {
      rows,
      pagination: {
        totalData: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit,
      },
    }
  }

  static async getRoles() {
    return await Role.findAll({
      attributes: ['id', 'name', 'label', 'description'],
      order: [['name', 'ASC']],
    })
  }

  static async createUser(data, adminUser, meta = {}) {
    const { name, email, password, employee_id, phone, status = 'active', role_ids = [] } = data

    // Cek email duplikat
    const existing = await User.findOne({ where: { email } })
    if (existing) {
      const err = new Error(`Email ${email} sudah terdaftar dalam sistem.`)
      err.statusCode = 400
      throw err
    }

    if (employee_id) {
      const existingNip = await User.findOne({ where: { employee_id } })
      if (existingNip) {
        const err = new Error(`NIP / ID Pegawai ${employee_id} sudah terdaftar.`)
        err.statusCode = 400
        throw err
      }
    }

    const password_hash = await bcrypt.hash(password || 'Admin#SENADA2026', 10)

    const t = await sequelize.transaction()
    try {
      const user = await User.create(
        {
          name,
          email,
          password_hash,
          employee_id: employee_id || null,
          phone: phone || null,
          status,
        },
        { transaction: t }
      )

      if (Array.isArray(role_ids) && role_ids.length > 0) {
        const roleRecords = await Role.findAll({ where: { id: role_ids }, transaction: t })
        await user.setRoles(roleRecords, { transaction: t })
      }

      await t.commit()

      await auditLog({
        userId: adminUser.id,
        action: 'create',
        entityType: 'users',
        entityId: user.id,
        after: { name, email, employee_id, status, role_ids },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      })

      return await User.findByPk(user.id, {
        attributes: ['id', 'name', 'email', 'employee_id', 'phone', 'status', 'created_at'],
        include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
      })
    } catch (err) {
      await t.rollback()
      throw err
    }
  }

  static async updateUser(id, data, adminUser, meta = {}) {
    const user = await User.findByPk(id, {
      include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
    })
    if (!user) {
      const err = new Error('Pengguna tidak ditemukan.')
      err.statusCode = 404
      throw err
    }

    const beforeData = {
      name: user.name,
      email: user.email,
      employee_id: user.employee_id,
      phone: user.phone,
      status: user.status,
      roles: user.roles?.map((r) => r.id),
    }

    const { name, email, employee_id, phone, status, password, role_ids } = data

    // Cek duplikasi email jika diubah
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email, id: { [Op.ne]: id } } })
      if (existing) {
        const err = new Error(`Email ${email} sudah dipakai akun lain.`)
        err.statusCode = 400
        throw err
      }
      user.email = email
    }

    if (name) user.name = name
    if (employee_id !== undefined) user.employee_id = employee_id || null
    if (phone !== undefined) user.phone = phone || null
    if (status) user.status = status
    if (password) {
      user.password_hash = await bcrypt.hash(password, 10)
    }

    const t = await sequelize.transaction()
    try {
      await user.save({ transaction: t })

      if (Array.isArray(role_ids)) {
        const roleRecords = await Role.findAll({ where: { id: role_ids }, transaction: t })
        await user.setRoles(roleRecords, { transaction: t })
      }

      await t.commit()

      await auditLog({
        userId: adminUser.id,
        action: 'update',
        entityType: 'users',
        entityId: user.id,
        before: beforeData,
        after: { name: user.name, email: user.email, employee_id: user.employee_id, status: user.status, role_ids },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      })

      return await User.findByPk(user.id, {
        attributes: ['id', 'name', 'email', 'employee_id', 'phone', 'status', 'created_at', 'updated_at'],
        include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
      })
    } catch (err) {
      await t.rollback()
      throw err
    }
  }

  static async toggleUserStatus(id, adminUser, meta = {}) {
    const user = await User.findByPk(id)
    if (!user) {
      const err = new Error('Pengguna tidak ditemukan.')
      err.statusCode = 404
      throw err
    }

    // Jangan nonaktifkan diri sendiri
    if (user.id === adminUser.id) {
      const err = new Error('Anda tidak dapat menonaktifkan akun Anda sendiri.')
      err.statusCode = 400
      throw err
    }

    const oldStatus = user.status
    const newStatus = oldStatus === 'active' ? 'inactive' : 'active'
    user.status = newStatus
    await user.save()

    await auditLog({
      userId: adminUser.id,
      action: newStatus === 'active' ? 'activate' : 'deactivate',
      entityType: 'users',
      entityId: user.id,
      before: { status: oldStatus },
      after: { status: newStatus },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return {
      id: user.id,
      status: user.status,
      message: `Status pengguna berhasil diubah menjadi ${newStatus}.`,
    }
  }

  /**
   * 3. Vendor Verification
   */
  static async getVendors(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10))
    const offset = (page - 1) * limit

    const where = {}
    if (query.verification_status) {
      where.verification_status = query.verification_status
    }
    if (query.search) {
      where[Op.or] = [
        { company_name: { [Op.like]: `%${query.search}%` } },
        { npwp: { [Op.like]: `%${query.search}%` } },
        { city: { [Op.like]: `%${query.search}%` } },
      ]
    }

    const { count, rows } = await VendorProfile.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'status', 'created_at'],
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [
        // Prioritaskan pending di atas
        sequelize.literal("CASE WHEN verification_status = 'pending' THEN 0 ELSE 1 END"),
        ['created_at', 'DESC'],
      ],
      limit,
      offset,
    })

    return {
      rows,
      pagination: {
        totalData: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit,
      },
    }
  }

  static async verifyVendor(vendorId, action, adminUser, meta = {}) {
    const vendor = await VendorProfile.findByPk(vendorId, {
      include: [{ model: User, as: 'user' }],
    })
    if (!vendor) {
      const err = new Error('Data profil vendor tidak ditemukan.')
      err.statusCode = 404
      throw err
    }

    if (!['verified', 'rejected'].includes(action)) {
      const err = new Error("Aksi verifikasi harus 'verified' atau 'rejected'.")
      err.statusCode = 400
      throw err
    }

    const oldStatus = vendor.verification_status
    vendor.verification_status = action
    vendor.verified_by = adminUser.id
    vendor.verified_at = new Date()
    await vendor.save()

    await auditLog({
      userId: adminUser.id,
      action: action === 'verified' ? 'approve' : 'reject',
      entityType: 'vendor_profiles',
      entityId: vendor.id,
      before: { verification_status: oldStatus },
      after: {
        verification_status: action,
        verified_by: adminUser.id,
        verified_at: vendor.verified_at,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return {
      id: vendor.id,
      company_name: vendor.company_name,
      verification_status: vendor.verification_status,
      verified_at: vendor.verified_at,
      message:
        action === 'verified'
          ? 'Perusahaan rekanan berhasil diverifikasi.'
          : 'Perusahaan rekanan ditolak verifikasinya.',
    }
  }

  /**
   * 4. Audit Logs
   */
  static async getAuditLogs(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 15))
    const offset = (page - 1) * limit

    const where = {}

    if (query.entity_type) {
      where.entity_type = query.entity_type
    }
    if (query.action) {
      where.action = query.action
    }
    if (query.user_id) {
      where.user_id = query.user_id
    }

    // Filter tanggal
    if (query.start_date && query.end_date) {
      where.created_at = {
        [Op.between]: [new Date(`${query.start_date}T00:00:00Z`), new Date(`${query.end_date}T23:59:59Z`)],
      }
    } else if (query.start_date) {
      where.created_at = {
        [Op.gte]: new Date(`${query.start_date}T00:00:00Z`),
      }
    } else if (query.end_date) {
      where.created_at = {
        [Op.lte]: new Date(`${query.end_date}T23:59:59Z`),
      }
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    })

    return {
      rows,
      pagination: {
        totalData: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit,
      },
    }
  }
}

module.exports = AdminService
