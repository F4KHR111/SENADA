'use strict'

const UndanganService = require('../services/undangan.service')

class UndanganController {
  /**
   * POST /api/undangan
   * Menerbitkan paket undangan baru untuk penyedia (Role: PBJ / Admin)
   */
  static async create(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await UndanganService.createUndangan(req.body, req.user, meta)

      return res.status(201).json({
        success: true,
        data:    result,
        message: 'Paket undangan pengadaan berhasil dibuat dengan status draft.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/undangan
   * Mengambil daftar undangan (terfilter otomatis untuk vendor)
   */
  static async getAll(req, res, next) {
    try {
      const result = await UndanganService.getUndanganList(req.query, req.user)

      return res.status(200).json({
        success: true,
        data:    result.rows,
        pagination: result.pagination,
        message: 'Daftar undangan pengadaan berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/undangan/:id
   * Mengambil detail undangan (otomatis set status vendor 'viewed')
   */
  static async getById(req, res, next) {
    try {
      const result = await UndanganService.getUndanganById(req.params.id, req.user)

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Detail undangan pengadaan berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/undangan/:id
   * Mengubah draft undangan (Role: PBJ / Admin)
   */
  static async update(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await UndanganService.updateUndangan(
        req.params.id,
        req.body,
        req.user,
        meta
      )

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Data undangan pengadaan berhasil diperbarui.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PATCH /api/undangan/:id/send
   * Mengirim / Menerbitkan undangan ke vendor (draft -> sent)
   */
  static async send(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await UndanganService.sendUndangan(req.params.id, req.user, meta)

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Undangan pengadaan berhasil dikirimkan kepada penyedia.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PATCH /api/undangan/:id/close
   * Menutup masa berlaku penawaran undangan (sent -> closed)
   */
  static async close(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await UndanganService.closeUndangan(req.params.id, req.user, meta)

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Masa penawaran undangan pengadaan telah ditutup.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * DELETE /api/undangan/:id
   * Menghapus draft undangan
   */
  static async delete(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      await UndanganService.deleteUndangan(req.params.id, req.user, meta)

      return res.status(200).json({
        success: true,
        message: 'Undangan pengadaan berhasil dihapus.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PATCH /api/undangan/:id/respond
   * Respon penyedia terhadap undangan (mis. decline)
   */
  static async respond(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await UndanganService.respondUndangan(
        req.params.id,
        req.body,
        req.user,
        meta
      )

      return res.status(200).json({
        success: true,
        data:    result,
        message: `Respon undangan berhasil dicatat dengan status '${result.status}'.`,
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/undangan/meta/vendors
   * Mengambil daftar penyedia terverifikasi untuk formulir undangan (Role: PBJ / Admin)
   */
  static async getAvailableVendors(req, res, next) {
    try {
      const vendors = await UndanganService.getAvailableVendors()
      return res.status(200).json({
        success: true,
        data: vendors,
        message: 'Daftar penyedia terverifikasi berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/undangan/meta/hps
   * Mengambil daftar HPS terverifikasi yang siap diundang (Role: PBJ / Admin)
   */
  static async getAvailableHps(req, res, next) {
    try {
      const hpsList = await UndanganService.getAvailableHps()
      return res.status(200).json({
        success: true,
        data: hpsList,
        message: 'Daftar HPS terverifikasi berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = UndanganController
