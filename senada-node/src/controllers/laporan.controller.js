'use strict'

const LaporanService = require('../services/laporan.service')

class LaporanController {
  // ── Laporan Realisasi ─────────────────────────────────────────────────────

  static async createRealisasi(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await LaporanService.createLaporanRealisasi(req.body, req.user, meta)

      return res.status(201).json({
        success: true,
        data:    result,
        message: 'Laporan realisasi keuangan berhasil dibuat.',
      })
    } catch (err) {
      next(err)
    }
  }

  static async getAllRealisasi(req, res, next) {
    try {
      const result = await LaporanService.getLaporanRealisasiList(req.query, req.user)

      return res.status(200).json({
        success: true,
        data:    result.rows,
        pagination: result.pagination,
        message: 'Daftar laporan realisasi berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  static async getRealisasiById(req, res, next) {
    try {
      const result = await LaporanService.getLaporanRealisasiById(req.params.id, req.user)

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Detail laporan realisasi berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  static async updateRealisasi(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await LaporanService.updateLaporanRealisasi(
        req.params.id,
        req.body,
        req.user,
        meta
      )

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Laporan realisasi berhasil diperbarui.',
      })
    } catch (err) {
      next(err)
    }
  }

  // ── SPM Reference ─────────────────────────────────────────────────────────

  static async createSpm(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await LaporanService.createSpmReference(req.body, req.user, meta)

      return res.status(201).json({
        success: true,
        data:    result,
        message: 'Referensi nomor SPM SAKTI berhasil dicatat.',
      })
    } catch (err) {
      next(err)
    }
  }

  static async getAllSpm(req, res, next) {
    try {
      const result = await LaporanService.getSpmReferenceList(req.query, req.user)

      return res.status(200).json({
        success: true,
        data:    result.rows,
        pagination: result.pagination,
        message: 'Daftar referensi SPM SAKTI berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  static async getSpmById(req, res, next) {
    try {
      const result = await LaporanService.getSpmReferenceById(req.params.id, req.user)

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Detail referensi SPM berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }

  static async updateSpm(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await LaporanService.updateSpmReference(
        req.params.id,
        req.body,
        req.user,
        meta
      )

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Referensi nomor SPM berhasil diperbarui.',
      })
    } catch (err) {
      next(err)
    }
  }

  // ── Rekapitulasi ──────────────────────────────────────────────────────────

  static async getRekap(req, res, next) {
    try {
      const result = await LaporanService.getRekapPelaporan(req.user)

      return res.status(200).json({
        success: true,
        data:    result,
        message: 'Rekapitulasi pelaporan keuangan berhasil diambil.',
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = LaporanController
