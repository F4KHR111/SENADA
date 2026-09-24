'use strict'

const { Router } = require('express')
const SerahTerimaController = require('../controllers/serahTerima.controller')
const authMiddleware        = require('../middlewares/auth.middleware')
const { rbacMiddleware }     = require('../middlewares/rbac.middleware')
const validateMiddleware    = require('../middlewares/validate.middleware')
const upload                = require('../middlewares/upload.middleware')
const {
  completeSerahTerimaSchema,
  querySerahTerimaSchema,
} = require('../validations/serahTerima.validation')

const router = Router()

/**
 * @route   GET /api/serah-terima
 * @desc    Mendapatkan daftar serah terima (terisolasi per vendor jika penyedia)
 * @access  Protected (PPK, PBJ, PPSPM, Petugas Laporan, Penyedia, Admin -> 'serah_terima:read')
 */
router.get(
  '/',
  authMiddleware,
  rbacMiddleware('serah_terima:read'),
  validateMiddleware(querySerahTerimaSchema),
  SerahTerimaController.getAll
)

/**
 * @route   GET /api/serah-terima/:spkId
 * @desc    Mendapatkan detail serah terima berdasarkan ID SPK
 * @access  Protected (PPK, PBJ, PPSPM, Petugas Laporan, Penyedia, Admin -> 'serah_terima:read')
 */
router.get(
  '/:spkId',
  authMiddleware,
  rbacMiddleware('serah_terima:read'),
  SerahTerimaController.getById
)

/**
 * @route   POST /api/serah-terima/:spkId/documents
 * @desc    Mengunggah surat jalan / dokumen pengiriman barang oleh vendor
 * @access  Protected (Penyedia pelaksana -> 'serah_terima:update' atau 'undangan:read')
 */
router.post(
  '/:spkId/documents',
  authMiddleware,
  rbacMiddleware('document:upload'),
  upload.single('file'),
  SerahTerimaController.uploadDokumen
)

/**
 * @route   PATCH /api/serah-terima/:spkId/complete
 * @desc    Menyelesaikan proses serah terima oleh PPK (pending -> completed)
 * @access  Protected (PPK, Admin -> 'serah_terima:update')
 */
router.patch(
  '/:spkId/complete',
  authMiddleware,
  rbacMiddleware('serah_terima:update'),
  validateMiddleware(completeSerahTerimaSchema),
  SerahTerimaController.complete
)

/**
 * @route   GET /api/serah-terima/:spkId/resume
 * @desc    Mendapatkan Resume SPK dan Berita Acara lengkap (untuk PPSPM / SAKTI dan Laporan Realisasi)
 * @access  Protected (PPK, PBJ, PPSPM, Petugas Laporan, Penyedia, Admin -> 'serah_terima:read' atau 'spk:read')
 */
router.get(
  '/:spkId/resume',
  authMiddleware,
  rbacMiddleware('serah_terima:read'),
  SerahTerimaController.getResume
)

module.exports = router
