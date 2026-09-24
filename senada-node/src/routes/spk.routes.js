'use strict'

const { Router } = require('express')
const SpkController      = require('../controllers/spk.controller')
const authMiddleware     = require('../middlewares/auth.middleware')
const { rbacMiddleware }  = require('../middlewares/rbac.middleware')
const validateMiddleware = require('../middlewares/validate.middleware')
const {
  createSpkSchema,
  updateSpkSchema,
  querySpkSchema,
} = require('../validations/spk.validation')

const router = Router()

/**
 * @route   POST /api/spk
 * @desc    Menerbitkan SPK baru dari negosiasi yang disetujui
 * @access  Protected (PPK, Admin -> 'spk:create')
 */
router.post(
  '/',
  authMiddleware,
  rbacMiddleware('spk:create'),
  validateMiddleware(createSpkSchema),
  SpkController.create
)

/**
 * @route   GET /api/spk
 * @desc    Mendapatkan daftar SPK (terisolasi per vendor jika diakses penyedia)
 * @access  Protected (PPK, PBJ, PPSPM, Petugas Laporan, Penyedia, Admin -> 'spk:read')
 */
router.get(
  '/',
  authMiddleware,
  rbacMiddleware('spk:read'),
  validateMiddleware(querySpkSchema),
  SpkController.getAll
)

/**
 * @route   GET /api/spk/meta/available-negosiasi
 * @desc    Mendapatkan daftar hasil negosiasi disetujui yang siap diterbitkan SPK
 * @access  Protected (PPK, Admin -> 'spk:create')
 */
router.get(
  '/meta/available-negosiasi',
  authMiddleware,
  rbacMiddleware('spk:create'),
  SpkController.getAvailableNegosiasi
)

/**
 * @route   GET /api/spk/:id
 * @desc    Mendapatkan detail lengkap SPK
 * @access  Protected (PPK, PBJ, PPSPM, Petugas Laporan, Penyedia pemilik, Admin -> 'spk:read')
 */
router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware('spk:read'),
  SpkController.getById
)

/**
 * @route   PUT /api/spk/:id
 * @desc    Memperbarui informasi tanggal SPK (status 'draft')
 * @access  Protected (PPK pembuat, Admin -> 'spk:update')
 */
router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware('spk:update'),
  validateMiddleware(updateSpkSchema),
  SpkController.update
)

/**
 * @route   PATCH /api/spk/:id/sign
 * @desc    Menandatangani SPK oleh PPK (draft -> signed)
 * @access  Protected (PPK pembuat, Admin -> 'spk:sign')
 */
router.patch(
  '/:id/sign',
  authMiddleware,
  rbacMiddleware('spk:sign'),
  SpkController.sign
)

/**
 * @route   GET /api/spk/:id/pdf
 * @desc    Mengunduh dokumen SPK resmi dalam format PDF
 * @access  Protected (PPK, PBJ, PPSPM, Petugas Laporan, Penyedia pemilik, Admin -> 'spk:read')
 */
router.get(
  '/:id/pdf',
  authMiddleware,
  rbacMiddleware('spk:read'),
  SpkController.exportPdf
)

module.exports = router
