'use strict'

const { Router } = require('express')
const LaporanController  = require('../controllers/laporan.controller')
const authMiddleware     = require('../middlewares/auth.middleware')
const { rbacMiddleware }  = require('../middlewares/rbac.middleware')
const validateMiddleware = require('../middlewares/validate.middleware')
const {
  createLaporanRealisasiSchema,
  updateLaporanRealisasiSchema,
  createSpmReferenceSchema,
  updateSpmReferenceSchema,
  queryLaporanSchema,
} = require('../validations/laporan.validation')

const router = Router()

/**
 * @route   GET /api/laporan/rekap
 * @desc    Mendapatkan rekapitulasi pelaporan keuangan (kontrak, realisasi, SPM)
 * @access  Protected (PPSPM, Petugas Laporan, Admin -> 'laporan:read' atau 'spm:read')
 */
router.get(
  '/rekap',
  authMiddleware,
  rbacMiddleware('laporan:read'),
  LaporanController.getRekap
)

// ── Rute Laporan Realisasi (Petugas Laporan Realisasi) ───────────────────────

/**
 * @route   POST /api/laporan/realisasi
 * @desc    Menginput data laporan realisasi keuangan
 * @access  Protected (Petugas Laporan Realisasi, Admin -> 'laporan:create')
 */
router.post(
  '/realisasi',
  authMiddleware,
  rbacMiddleware('laporan:create'),
  validateMiddleware(createLaporanRealisasiSchema),
  LaporanController.createRealisasi
)

/**
 * @route   GET /api/laporan/realisasi
 * @desc    Mendapatkan daftar laporan realisasi keuangan
 * @access  Protected (Petugas Laporan, PPSPM, Admin -> 'laporan:read')
 */
router.get(
  '/realisasi',
  authMiddleware,
  rbacMiddleware('laporan:read'),
  validateMiddleware(queryLaporanSchema),
  LaporanController.getAllRealisasi
)

/**
 * @route   GET /api/laporan/realisasi/:id
 * @desc    Mendapatkan detail laporan realisasi keuangan
 * @access  Protected (Petugas Laporan, PPSPM, Admin -> 'laporan:read')
 */
router.get(
  '/realisasi/:id',
  authMiddleware,
  rbacMiddleware('laporan:read'),
  LaporanController.getRealisasiById
)

/**
 * @route   PUT /api/laporan/realisasi/:id
 * @desc    Memperbarui laporan realisasi keuangan
 * @access  Protected (Petugas Laporan, Admin -> 'laporan:update')
 */
router.put(
  '/realisasi/:id',
  authMiddleware,
  rbacMiddleware('laporan:update'),
  validateMiddleware(updateLaporanRealisasiSchema),
  LaporanController.updateRealisasi
)

// ── Rute SPM Reference (PPSPM / Integrasi SAKTI) ────────────────────────────

/**
 * @route   POST /api/laporan/spm
 * @desc    Mencatat nomor SPM hasil pemrosesan di aplikasi SAKTI
 * @access  Protected (PPSPM, Admin -> 'spm:create')
 */
router.post(
  '/spm',
  authMiddleware,
  rbacMiddleware('spm:create'),
  validateMiddleware(createSpmReferenceSchema),
  LaporanController.createSpm
)

/**
 * @route   GET /api/laporan/spm
 * @desc    Mendapatkan daftar referensi SPM
 * @access  Protected (PPSPM, Petugas Laporan, Admin -> 'spm:read')
 */
router.get(
  '/spm',
  authMiddleware,
  rbacMiddleware('spm:read'),
  validateMiddleware(queryLaporanSchema),
  LaporanController.getAllSpm
)

/**
 * @route   GET /api/laporan/spm/:id
 * @desc    Mendapatkan detail referensi SPM
 * @access  Protected (PPSPM, Petugas Laporan, Admin -> 'spm:read')
 */
router.get(
  '/spm/:id',
  authMiddleware,
  rbacMiddleware('spm:read'),
  LaporanController.getSpmById
)

/**
 * @route   PUT /api/laporan/spm/:id
 * @desc    Memperbarui nomor atau status SPM
 * @access  Protected (PPSPM, Admin -> 'spm:update')
 */
router.put(
  '/spm/:id',
  authMiddleware,
  rbacMiddleware('spm:update'),
  validateMiddleware(updateSpmReferenceSchema),
  LaporanController.updateSpm
)

module.exports = router
