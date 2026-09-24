'use strict'

const { Router } = require('express')
const HpsController     = require('../controllers/hps.controller')
const authMiddleware    = require('../middlewares/auth.middleware')
const { rbacMiddleware } = require('../middlewares/rbac.middleware')
const validateMiddleware = require('../middlewares/validate.middleware')
const upload             = require('../middlewares/upload.middleware')
const {
  createHpsSchema,
  updateHpsSchema,
  verifyHpsSchema,
  queryHpsSchema,
} = require('../validations/hps.validation')

const router = Router()

/**
 * @route   POST /api/hps
 * @desc    Membuat paket HPS baru (beserta rincian barang & opsional dokumen)
 * @access  Protected (PPK, Admin -> 'hps:create')
 */
router.post(
  '/',
  authMiddleware,
  rbacMiddleware('hps:create'),
  upload.single('file'),
  validateMiddleware(createHpsSchema),
  HpsController.create
)

/**
 * @route   GET /api/hps
 * @desc    Mendapatkan daftar paket HPS dengan filter & pagination
 * @access  Protected (PPK, PBJ, Admin -> 'hps:read')
 */
router.get(
  '/',
  authMiddleware,
  rbacMiddleware('hps:read'),
  validateMiddleware(queryHpsSchema),
  HpsController.getAll
)

/**
 * @route   GET /api/hps/:id
 * @desc    Mendapatkan detail paket HPS lengkap beserta item & dokumen
 * @access  Protected (PPK, PBJ, Admin -> 'hps:read')
 */
router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware('hps:read'),
  HpsController.getById
)

/**
 * @route   PUT /api/hps/:id
 * @desc    Mengubah paket HPS (Hanya boleh saat status masih 'draft')
 * @access  Protected (PPK pembuat, Admin -> 'hps:update')
 */
router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware('hps:update'),
  upload.single('file'),
  validateMiddleware(updateHpsSchema),
  HpsController.update
)

/**
 * @route   DELETE /api/hps/:id
 * @desc    Menghapus paket HPS (Hanya boleh saat status masih 'draft')
 * @access  Protected (PPK pembuat, Admin -> 'hps:delete')
 */
router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware('hps:delete'),
  HpsController.delete
)

/**
 * @route   PATCH /api/hps/:id/verify
 * @desc    Verifikasi HPS oleh Pejabat Pengadaan (draft -> verified / fixed)
 * @access  Protected (PBJ, Admin -> 'hps:verify')
 */
router.patch(
  '/:id/verify',
  authMiddleware,
  rbacMiddleware('hps:verify'),
  validateMiddleware(verifyHpsSchema),
  HpsController.verify
)

/**
 * @route   POST /api/hps/:id/documents
 * @desc    Mengunggah dokumen pendukung tambahan untuk HPS
 * @access  Protected (PPK pembuat, Admin -> 'hps:update')
 */
router.post(
  '/:id/documents',
  authMiddleware,
  rbacMiddleware('hps:update'),
  upload.single('file'),
  HpsController.uploadDocument
)

module.exports = router
