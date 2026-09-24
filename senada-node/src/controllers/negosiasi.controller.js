'use strict'

const NegosiasiService = require('../services/negosiasi.service')

class NegosiasiController {
  /**
   * POST /api/negosiasi
   * Mengajukan usulan harga negosiasi baru oleh PBJ (Role: PBJ / Admin)
   */
  static async create(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await NegosiasiService.createUsulanNegosiasi(
        req.body,
        req.user,
        meta
      )

      return res.status(201).json({
        success: true,
        data:    result,
        message: `Usulan negosiasi ronde #${result.round} berhasil diajukan kepada penyedia.`,
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PATCH /api/negosiasi/:id/respond
   * Respon penyedia terhadap usulan harga negosiasi (accepted / rejected)
   */
  static async respond(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await NegosiasiService.respondNegosiasi(
        req.params.id,
        req.body,
        req.user,
        meta
      )

      const statusText = result.status === 'accepted' ? 'disetujui' : 'ditolak'

      return res.status(200).json({
        success: true,
        data:    result,
        message: `Usulan harga negosiasi berhasil ${statusText} oleh penyedia.`,
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/negosiasi/penawaran/:penawaranId/history
   * Mengambil riwayat histori seluruh ronde negosiasi untuk penawaran tertentu
   */
  static async getHistory(req, res, next) {
    try {
      const result = await NegosiasiService.getNegosiasiHistory(
        req.params.penawaranId,
        req.user
      )

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Riwayat negosiasi berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/negosiasi/:id
   * Mengambil detail satu ronde negosiasi
   */
  static async getById(req, res, next) {
    try {
      const result = await NegosiasiService.getNegosiasiById(
        req.params.id,
        req.user
      )

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Detail negosiasi berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = NegosiasiController
