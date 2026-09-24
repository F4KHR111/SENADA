'use strict'

const { Router } = require('express')
const PenawaranController = require('../controllers/penawaran.controller')
const authMiddleware      = require('../middlewares/auth.middleware')
const { rbacMiddleware }   = require('../middlewares/rbac.middleware')
const validateMiddleware  = require('../middlewares/validate.middleware')
const upload              = require('../middlewares/upload.middleware')
const {
  createPenawaranSchema,
  updatePenawaranSchema,
  queryPenawaranSchema,
} = require('../validations/penawaran.validation')

const router = Router()

/**
 * @route   POST /api/penawaran
 * @desc    Mengajukan penawaran harga pengadaan (beserta opsional dokumen)
 * @access  Protected (Penyedia -> 'penawaran:create')
 */
router.post(
  '/',
  authMiddleware,
  rbacMiddleware('penawaran:create'),
  upload.single('file'),
  validateMiddleware(createPenawaranSchema),
  PenawaranController.create
)

/**
 * @route   GET /api/penawaran
 * @desc    Mendapatkan daftar penawaran harga (otomatis terisolasi per vendor)
 * @access  Protected (Penyedia, PBJ, PPK, Admin -> 'penawaran:read')
 */
router.get(
  '/',
  authMiddleware,
  rbacMiddleware('penawaran:read'),
  validateMiddleware(queryPenawaranSchema),
  PenawaranController.getAll
)

/**
 * @route   GET /api/penawaran/:id
 * @desc    Mendapatkan detail penawaran harga, rincian item, dan histori negosiasi
 * @access  Protected (Penyedia pemilik, PBJ, PPK, Admin -> 'penawaran:read')
 */
router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware('penawaran:read'),
  PenawaranController.getById
)

/**
 * @route   PUT /api/penawaran/:id
 * @desc    Memperbarui rincian harga penawaran (sebelum batas waktu & status 'submitted')
 * @access  Protected (Penyedia pemilik -> 'penawaran:update')
 */
router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware('penawaran:update'),
  upload.single('file'),
  validateMiddleware(updatePenawaranSchema),
  PenawaranController.update
)

/**
 * @route   POST /api/penawaran/:id/documents
 * @desc    Mengunggah dokumen penawaran bertandatangan / cap basah
 * @access  Protected (Penyedia pemilik -> 'penawaran:update')
 */
router.post(
  '/:id/documents',
  authMiddleware,
  rbacMiddleware('penawaran:update'),
  upload.single('file'),
  PenawaranController.uploadDocument
)

module.exports = router
