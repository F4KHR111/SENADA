'use strict'

const VendorEvaluationService = require('../services/vendorEvaluation.service')

class VendorEvaluationController {
  /**
   * POST /api/evaluations/:spkId
   * Input penilaian kinerja vendor oleh PPK
   */
  static async create(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      }

      const result = await VendorEvaluationService.createEvaluation(
        req.params.spkId,
        req.body,
        req.user,
        meta
      )

      return res.status(201).json({
        success: true,
        data:    result,
        message: 'Penilaian kinerja penyedia berhasil disimpan dan tercatat di sistem.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/evaluations/spk/:spkId
   * Mengambil data evaluasi untuk SPK tertentu
   */
  static async getBySpk(req, res, next) {
    try {
      const result = await VendorEvaluationService.getBySpkId(req.params.spkId, req.user)

      return res.status(200).json({
        success: true,
        data:    result,
        message: result ? 'Data penilaian SPK berhasil diambil.' : 'SPK ini belum memiliki penilaian.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/evaluations/vendor/:vendorId
   * Mengambil agregasi rating dan histori ulasan vendor
   */
  static async getByVendor(req, res, next) {
    try {
      const result = await VendorEvaluationService.getByVendorId(req.params.vendorId, req.user)

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Data reputasi kinerja vendor berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = VendorEvaluationController
