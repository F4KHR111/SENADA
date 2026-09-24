'use strict'

const { Router } = require('express')
const NegosiasiController = require('../controllers/negosiasi.controller')
const authMiddleware      = require('../middlewares/auth.middleware')
const { rbacMiddleware }   = require('../middlewares/rbac.middleware')
const validateMiddleware  = require('../middlewares/validate.middleware')
const {
  createNegosiasiSchema,
  respondNegosiasiSchema,
} = require('../validations/negosiasi.validation')

const router = Router()

/**
 * @route   POST /api/negosiasi
 * @desc    Mengajukan ronde usulan harga negosiasi baru kepada penyedia
 * @access  Protected (PBJ, Admin -> 'negosiasi:create')
 */
router.post(
  '/',
  authMiddleware,
  rbacMiddleware('negosiasi:create'),
  validateMiddleware(createNegosiasiSchema),
  NegosiasiController.create
)

/**
 * @route   PATCH /api/negosiasi/:id/respond
 * @desc    Respon penyedia terhadap usulan harga negosiasi (setuju / tolak)
 * @access  Protected (Penyedia -> 'negosiasi:respond')
 */
router.patch(
  '/:id/respond',
  authMiddleware,
  rbacMiddleware('negosiasi:respond'),
  validateMiddleware(respondNegosiasiSchema),
  NegosiasiController.respond
)

/**
 * @route   GET /api/negosiasi/penawaran/:penawaranId/history
 * @desc    Mendapatkan seluruh riwayat ronde negosiasi untuk penawaran tertentu
 * @access  Protected (Penyedia pemilik, PBJ, PPK, Admin -> 'negosiasi:read')
 */
router.get(
  '/penawaran/:penawaranId/history',
  authMiddleware,
  rbacMiddleware('negosiasi:read'),
  NegosiasiController.getHistory
)

/**
 * @route   GET /api/negosiasi/:id
 * @desc    Mendapatkan detail satu ronde negosiasi
 * @access  Protected (Penyedia pemilik, PBJ, PPK, Admin -> 'negosiasi:read')
 */
router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware('negosiasi:read'),
  NegosiasiController.getById
)

module.exports = router
