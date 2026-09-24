'use strict'

const { Router } = require('express')
const VendorEvaluationController = require('../controllers/vendorEvaluation.controller')
const authMiddleware             = require('../middlewares/auth.middleware')
const { rbacMiddleware }          = require('../middlewares/rbac.middleware')
const validateMiddleware         = require('../middlewares/validate.middleware')
const {
  createEvaluationSchema,
  getBySpkSchema,
  getByVendorSchema,
} = require('../validations/vendorEvaluation.validation')

const router = Router()

/**
 * @route   POST /api/evaluations/:spkId
 * @desc    Menginput penilaian kinerja vendor oleh PPK
 * @access  Protected (PPK pembuat SPK / Admin)
 */
router.post(
  '/:spkId',
  authMiddleware,
  rbacMiddleware(['spk:update', 'spk:sign']),
  validateMiddleware(createEvaluationSchema),
  VendorEvaluationController.create
)

/**
 * @route   GET /api/evaluations/spk/:spkId
 * @desc    Mendapatkan hasil penilaian untuk satu SPK
 * @access  Protected (PPK, PBJ, Penyedia, Admin)
 */
router.get(
  '/spk/:spkId',
  authMiddleware,
  rbacMiddleware(['spk:read', 'serah_terima:read', 'undangan:read']),
  validateMiddleware(getBySpkSchema),
  VendorEvaluationController.getBySpk
)

/**
 * @route   GET /api/evaluations/vendor/:vendorId
 * @desc    Mendapatkan agregasi rating dan seluruh review untuk satu vendor
 * @access  Protected (PPK, PBJ, Penyedia, Admin)
 */
router.get(
  '/vendor/:vendorId',
  authMiddleware,
  rbacMiddleware(['vendor:read', 'undangan:create', 'spk:read', 'undangan:read']),
  validateMiddleware(getByVendorSchema),
  VendorEvaluationController.getByVendor
)

module.exports = router
