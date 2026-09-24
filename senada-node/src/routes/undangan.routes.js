'use strict'

const { Router } = require('express')
const UndanganController = require('../controllers/undangan.controller')
const authMiddleware     = require('../middlewares/auth.middleware')
const { rbacMiddleware }  = require('../middlewares/rbac.middleware')
const validateMiddleware = require('../middlewares/validate.middleware')
const {
  createUndanganSchema,
  updateUndanganSchema,
  respondUndanganSchema,
  queryUndanganSchema,
} = require('../validations/undangan.validation')

const router = Router()

/**
 * @route   POST /api/undangan
 * @desc    Membuat paket undangan baru dari HPS terverifikasi
 * @access  Protected (PBJ, Admin -> 'undangan:create')
 */
router.post(
  '/',
  authMiddleware,
  rbacMiddleware('undangan:create'),
  validateMiddleware(createUndanganSchema),
  UndanganController.create
)

/**
 * @route   GET /api/undangan
 * @desc    Mendapatkan daftar undangan (otomatis terfilter bila diakses vendor)
 * @access  Protected (PBJ, PPK, Penyedia, Admin -> 'undangan:read')
 */
router.get(
  '/',
  authMiddleware,
  rbacMiddleware('undangan:read'),
  validateMiddleware(queryUndanganSchema),
  UndanganController.getAll
)

/**
 * @route   GET /api/undangan/meta/vendors
 * @desc    Mengambil daftar penyedia terverifikasi untuk pilihan undangan
 * @access  Protected (PBJ, Admin -> 'undangan:create')
 */
router.get(
  '/meta/vendors',
  authMiddleware,
  rbacMiddleware('undangan:create'),
  UndanganController.getAvailableVendors
)

/**
 * @route   GET /api/undangan/meta/hps
 * @desc    Mengambil daftar HPS terverifikasi yang siap dibuatkan undangan
 * @access  Protected (PBJ, Admin -> 'undangan:create')
 */
router.get(
  '/meta/hps',
  authMiddleware,
  rbacMiddleware('undangan:create'),
  UndanganController.getAvailableHps
)

/**
 * @route   GET /api/undangan/:id
 * @desc    Mendapatkan detail undangan (otomatis update status 'viewed' untuk vendor)
 * @access  Protected (PBJ, PPK, Penyedia, Admin -> 'undangan:read')
 */
router.get(
  '/:id',
  authMiddleware,
  rbacMiddleware('undangan:read'),
  UndanganController.getById
)

/**
 * @route   PUT /api/undangan/:id
 * @desc    Mengubah draft undangan
 * @access  Protected (PBJ pembuat, Admin -> 'undangan:update')
 */
router.put(
  '/:id',
  authMiddleware,
  rbacMiddleware('undangan:update'),
  validateMiddleware(updateUndanganSchema),
  UndanganController.update
)

/**
 * @route   PATCH /api/undangan/:id/send
 * @desc    Menerbitkan / Mengirimkan undangan ke vendor (draft -> sent)
 * @access  Protected (PBJ pembuat, Admin -> 'undangan:update')
 */
router.patch(
  '/:id/send',
  authMiddleware,
  rbacMiddleware('undangan:update'),
  UndanganController.send
)

/**
 * @route   PATCH /api/undangan/:id/close
 * @desc    Menutup masa penawaran undangan (sent -> closed)
 * @access  Protected (PBJ pembuat, Admin -> 'undangan:update')
 */
router.patch(
  '/:id/close',
  authMiddleware,
  rbacMiddleware('undangan:update'),
  UndanganController.close
)

/**
 * @route   DELETE /api/undangan/:id
 * @desc    Menghapus draft undangan
 * @access  Protected (PBJ pembuat, Admin -> 'undangan:delete')
 */
router.delete(
  '/:id',
  authMiddleware,
  rbacMiddleware('undangan:delete'),
  UndanganController.delete
)

/**
 * @route   PATCH /api/undangan/:id/respond
 * @desc    Respon vendor terhadap undangan (mis. menolak/decline undangan)
 * @access  Protected (Penyedia -> 'undangan:read')
 */
router.patch(
  '/:id/respond',
  authMiddleware,
  rbacMiddleware('undangan:read'),
  validateMiddleware(respondUndanganSchema),
  UndanganController.respond
)

module.exports = router
