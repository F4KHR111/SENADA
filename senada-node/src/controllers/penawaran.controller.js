'use strict'

const PenawaranService = require('../services/penawaran.service')

class PenawaranController {
  /**
   * POST /api/penawaran
   * Mengajukan rincian harga penawaran oleh rekanan (Role: Penyedia)
   */
  static async create(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await PenawaranService.createPenawaran(
        req.body,
        req.user,
        req.file,
        meta
      )

      return res.status(201).json({
        success: true,
        data:    result,
        message: 'Penawaran harga berhasil diajukan.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/penawaran
   * Mengambil daftar penawaran harga
   */
  static async getAll(req, res, next) {
    try {
      const result = await PenawaranService.getPenawaranList(req.query, req.user)

      return res.status(200).json({
        success: true,
        data:    result.rows,
        pagination: result.pagination,
        message: 'Daftar penawaran harga berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/penawaran/:id
   * Mengambil detail penawaran harga dan histori negosiasi
   */
  static async getById(req, res, next) {
    try {
      const result = await PenawaranService.getPenawaranById(req.params.id, req.user)

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Detail penawaran harga berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/penawaran/:id
   * Memperbarui rincian harga penawaran (status: 'submitted')
   */
  static async update(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await PenawaranService.updatePenawaran(
        req.params.id,
        req.body,
        req.user,
        req.file,
        meta
      )

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Penawaran harga berhasil diperbarui.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/penawaran/:id/documents
   * Mengunggah dokumen penawaran bertandatangan / cap basah
   */
  static async uploadDocument(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await PenawaranService.uploadDocument(
        req.params.id,
        req.file,
        req.user,
        meta
      )

      return res.status(201).json({
        success: true,
        data:    result,
        message: 'Dokumen penawaran berhasil diunggah.',
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = PenawaranController
