'use strict'

const AdminService = require('../services/admin.service')

class AdminController {
  /**
   * GET /api/admin/dashboard-stats
   */
  static async getDashboardStats(_req, res, next) {
    try {
      const stats = await AdminService.getDashboardStats()
      return res.status(200).json({
        success: true,
        data: stats,
        message: 'Statistik dashboard admin berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/admin/users
   */
  static async getUsers(req, res, next) {
    try {
      const result = await AdminService.getUsers(req.query)
      return res.status(200).json({
        success: true,
        data: result.rows,
        pagination: result.pagination,
        message: 'Daftar pengguna berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/admin/roles
   */
  static async getRoles(_req, res, next) {
    try {
      const roles = await AdminService.getRoles()
      return res.status(200).json({
        success: true,
        data: roles,
        message: 'Daftar role sistem berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/admin/users
   */
  static async createUser(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }
      const user = await AdminService.createUser(req.body, req.user, meta)
      return res.status(201).json({
        success: true,
        data: user,
        message: 'Pengguna baru berhasil dibuat.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/admin/users/:id
   */
  static async updateUser(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }
      const user = await AdminService.updateUser(req.params.id, req.body, req.user, meta)
      return res.status(200).json({
        success: true,
        data: user,
        message: 'Data pengguna berhasil diperbarui.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PATCH /api/admin/users/:id/status
   */
  static async toggleUserStatus(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }
      const result = await AdminService.toggleUserStatus(req.params.id, req.user, meta)
      return res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/admin/vendors
   */
  static async getVendors(req, res, next) {
    try {
      const result = await AdminService.getVendors(req.query)
      return res.status(200).json({
        success: true,
        data: result.rows,
        pagination: result.pagination,
        message: 'Daftar vendor berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PATCH /api/admin/vendors/:id/verify
   */
  static async verifyVendor(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }
      const result = await AdminService.verifyVendor(
        req.params.id,
        req.body.action, // 'verified' | 'rejected'
        req.user,
        meta
      )
      return res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/admin/audit-logs
   */
  static async getAuditLogs(req, res, next) {
    try {
      const result = await AdminService.getAuditLogs(req.query)
      return res.status(200).json({
        success: true,
        data: result.rows,
        pagination: result.pagination,
        message: 'Audit log sistem berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = AdminController
