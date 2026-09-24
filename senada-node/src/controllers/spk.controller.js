'use strict'

const SpkService = require('../services/spk.service')

class SpkController {
  /**
   * POST /api/spk
   * Menerbitkan SPK baru dari negosiasi yang disetujui (Role: PPK / Admin)
   */
  static async create(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await SpkService.createSpk(req.body, req.user, meta)

      return res.status(201).json({
        success: true,
        data:    result,
        message: 'Surat Perintah Kerja (SPK) berhasil diterbitkan dengan status draft.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/spk
   * Mengambil daftar SPK
   */
  static async getAll(req, res, next) {
    try {
      const result = await SpkService.getSpkList(req.query, req.user)

      return res.status(200).json({
        success: true,
        data:    result.rows,
        pagination: result.pagination,
        message: 'Daftar SPK berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/spk/:id
   * Mengambil detail lengkap SPK
   */
  static async getById(req, res, next) {
    try {
      const result = await SpkService.getSpkById(req.params.id, req.user)

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Detail SPK berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/spk/:id
   * Memperbarui informasi tanggal SPK (status 'draft')
   */
  static async update(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await SpkService.updateSpk(req.params.id, req.body, req.user, meta)

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Data SPK berhasil diperbarui.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PATCH /api/spk/:id/sign
   * Menandatangani SPK oleh PPK (draft -> signed)
   */
  static async sign(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await SpkService.signSpk(req.params.id, req.user, meta)

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Surat Perintah Kerja (SPK) berhasil ditandatangani.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/spk/:id/pdf
   * Mengunduh dokumen SPK resmi dalam format PDF
   */
  static async exportPdf(req, res, next) {
    try {
      const pdfBuffer = await SpkService.generateSpkPdf(req.params.id, req.user)

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="SPK-${req.params.id}.pdf"`
      )

      return res.send(pdfBuffer)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/spk/meta/available-negosiasi
   * Mengambil daftar hasil negosiasi disetujui yang siap diterbitkan SPK (Role: PPK / Admin)
   */
  static async getAvailableNegosiasi(req, res, next) {
    try {
      const list = await SpkService.getAvailableNegosiasi()
      return res.status(200).json({
        success: true,
        data: list,
        message: 'Daftar hasil negosiasi yang siap dibuatkan SPK berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = SpkController
