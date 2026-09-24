'use strict'

const HpsService = require('../services/hps.service')

class HpsController {
  /**
   * POST /api/hps
   * Membuat paket HPS baru (Role: PPK / Admin)
   */
  static async create(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await HpsService.createHps(req.body, req.user, req.file, meta)

      return res.status(201).json({
        success: true,
        data:    result,
        message: 'Paket HPS berhasil dibuat dengan status draft.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/hps
   * Mengambil daftar HPS dengan pagination & filter
   */
  static async getAll(req, res, next) {
    try {
      const result = await HpsService.getHpsList(req.query, req.user)

      return res.status(200).json({
        success: true,
        data:    result.rows,
        pagination: result.pagination,
        message: 'Daftar HPS berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/hps/:id
   * Mengambil rincian paket HPS berdasarkan ID
   */
  static async getById(req, res, next) {
    try {
      const result = await HpsService.getHpsById(req.params.id)

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Detail paket HPS berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/hps/:id
   * Mengubah data draft HPS (Role: PPK / Admin)
   */
  static async update(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await HpsService.updateHps(
        req.params.id,
        req.body,
        req.user,
        req.file,
        meta
      )

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Paket HPS berhasil diperbarui.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * DELETE /api/hps/:id
   * Menghapus draft HPS (Role: PPK / Admin)
   */
  static async delete(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      await HpsService.deleteHps(req.params.id, req.user, meta)

      return res.status(200).json({
        success: true,
        message: 'Paket HPS berhasil dihapus.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PATCH /api/hps/:id/verify
   * Verifikasi HPS oleh PBJ (Role: PBJ / Admin)
   */
  static async verify(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await HpsService.verifyHps(
        req.params.id,
        req.body,
        req.user,
        meta
      )

      return res.status(200).json({
        success: true,
        data:    result,
        message: `Paket HPS berhasil diverifikasi dengan status '${result.status}'.`,
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/hps/:id/documents
   * Unggah dokumen pendukung tambahan untuk HPS
   */
  static async uploadDocument(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await HpsService.uploadDocument(
        req.params.id,
        req.file,
        req.user,
        meta
      )

      return res.status(201).json({
        success: true,
        data:    result,
        message: 'Dokumen pendukung HPS berhasil diunggah.',
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = HpsController
