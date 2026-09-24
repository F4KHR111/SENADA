'use strict'

const SerahTerimaService = require('../services/serahTerima.service')

class SerahTerimaController {
  /**
   * POST /api/serah-terima/:spkId/documents
   * Upload surat jalan / dokumen pengiriman / izin mulai kerja oleh rekanan
   */
  static async uploadDokumen(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await SerahTerimaService.uploadDokumenPengiriman(
        req.params.spkId,
        req.file,
        req.user,
        meta
      )

      return res.status(201).json({
        success: true,
        data:    result,
        message: 'Dokumen pengiriman / surat jalan berhasil diunggah.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PATCH /api/serah-terima/:spkId/complete
   * Menyelesaikan proses serah terima barang/jasa oleh PPK
   */
  static async complete(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await SerahTerimaService.completeSerahTerima(
        req.params.spkId,
        req.body,
        req.user,
        meta
      )

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Proses serah terima barang/jasa telah selesai diverifikasi.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/serah-terima/:spkId/resume
   * Mengambil Resume SPK lengkap (untuk PPSPM / SAKTI dan Laporan Realisasi)
   */
  static async getResume(req, res, next) {
    try {
      const result = await SerahTerimaService.getResumeSpk(
        req.params.spkId,
        req.user
      )

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Resume SPK dan Berita Acara berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }
  /**
   * GET /api/serah-terima
   * Mendapatkan daftar serah terima (terisolasi per vendor jika penyedia)
   */
  static async getAll(req, res, next) {
    try {
      const result = await SerahTerimaService.getList(req.query, req.user)
      return res.status(200).json({
        success: true,
        data:    result.rows,
        meta:    result.pagination,
        message: 'Daftar serah terima berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/serah-terima/:spkId
   * Mendapatkan detail serah terima berdasarkan ID SPK
   */
  static async getById(req, res, next) {
    try {
      const result = await SerahTerimaService.getBySpkId(req.params.spkId, req.user)
      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Detail serah terima berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = SerahTerimaController
