'use strict'

const { Router } = require('express')
const AuthController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const validateMiddleware = require('../middlewares/validate.middleware')
const { loginRateLimiter } = require('../middlewares/rateLimiter.middleware')
const {
  registerVendorSchema,
  loginSchema,
  refreshTokenSchema,
} = require('../validations/auth.validation')

const router = Router()

/**
 * @route   POST /api/auth/register
 * @desc    Registrasi akun penyedia/vendor baru
 * @access  Public
 */
router.post(
  '/register',
  validateMiddleware(registerVendorSchema),
  AuthController.register
)

/**
 * @route   POST /api/auth/login
 * @desc    Autentikasi pengguna & terbitkan JWT + Refresh Token
 * @access  Public (dengan brute-force rate limiter)
 */
router.post(
  '/login',
  loginRateLimiter,
  validateMiddleware(loginSchema),
  AuthController.login
)

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Perbarui access token dengan rotasi refresh token
 * @access  Public (via httpOnly cookie atau request body)
 */
router.post(
  '/refresh-token',
  validateMiddleware(refreshTokenSchema),
  AuthController.refreshToken
)

/**
 * @route   POST /api/auth/logout
 * @desc    Logout dan batalkan refresh token
 * @access  Public / Optional Auth
 */
router.post('/logout', AuthController.logout)

/**
 * @route   GET /api/auth/me
 * @desc    Mendapatkan profil dan permission pengguna saat ini
 * @access  Authenticated
 */
router.get('/me', authMiddleware, AuthController.getMe)

/**
 * @route   PUT /api/auth/vendor-profile
 * @desc    Mengubah profil perusahaan rekanan (NPWP, bank, alamat, dll)
 * @access  Authenticated (Penyedia)
 */
router.put('/vendor-profile', authMiddleware, AuthController.updateVendorProfile)

module.exports = router
