'use strict'

const AuthService = require('../services/auth.service')
const env = require('../config/env')

const isProduction = env.nodeEnv === 'production'

const COOKIE_NAME = 'refreshToken'

/**
 * Cookie options untuk refresh token (httpOnly, secure, sameSite) sesuai AGENTS.md §6.1
 */
const getRefreshTokenCookieOptions = (expiresAt) => ({
  httpOnly: true,
  secure:   isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  expires:  expiresAt,
  path:     '/',
})

class AuthController {
  /**
   * POST /api/auth/register
   * Khusus registrasi rekanan/vendor baru
   */
  static async register(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const result = await AuthService.registerVendor(req.body, meta)

      return res.status(201).json({
        success: true,
        data:    result,
        message: 'Registrasi penyedia berhasil. Akun Anda menunggu proses verifikasi.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/auth/login
   * Login pengguna & penyedia
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const { user, accessToken, rawRefreshToken, expiresAt } =
        await AuthService.login({ email, password, ...meta })

      // Simpan refresh token di httpOnly cookie
      res.cookie(
        COOKIE_NAME,
        rawRefreshToken,
        getRefreshTokenCookieOptions(expiresAt)
      )

      return res.status(200).json({
        success: true,
        data: {
          user,
          accessToken,
        },
        message: 'Login berhasil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/auth/refresh-token
   * Silent refresh access token & rotasi refresh token
   */
  static async refreshToken(req, res, next) {
    try {
      const rawRefreshToken =
        req.cookies?.[COOKIE_NAME] || req.body?.refreshToken

      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const { accessToken, newRawRefreshToken, expiresAt } =
        await AuthService.refreshAccessToken({ rawRefreshToken, ...meta })

      // Set cookie dengan refresh token baru yang sudah dirotasi
      res.cookie(
        COOKIE_NAME,
        newRawRefreshToken,
        getRefreshTokenCookieOptions(expiresAt)
      )

      return res.status(200).json({
        success: true,
        data: {
          accessToken,
        },
        message: 'Access token berhasil diperbarui.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/auth/logout
   * Logout dan revoke refresh token
   */
  static async logout(req, res, next) {
    try {
      const rawRefreshToken =
        req.cookies?.[COOKIE_NAME] || req.body?.refreshToken
      const userId = req.user?.id || null

      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      await AuthService.logout({ rawRefreshToken, userId, ...meta })

      // Hapus cookie refresh token
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure:   isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        path:     '/',
      })

      return res.status(200).json({
        success: true,
        message: 'Logout berhasil.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/auth/me
   * Mengambil data profil user saat ini
   */
  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getMe(req.user.id)

      return res.status(200).json({
        success: true,
        data:    user,
        message: 'Data profil pengguna berhasil didapatkan.',
      })
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/auth/vendor-profile
   * Mengubah data profil perusahaan penyedia (NPWP, rekening bank, alamat)
   */
  static async updateVendorProfile(req, res, next) {
    try {
      const meta = {
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
      }

      const updatedUser = await AuthService.updateVendorProfile(req.user.id, req.body, meta)

      return res.status(200).json({
        success: true,
        data:    updatedUser,
        message: 'Profil perusahaan rekanan berhasil diperbarui.',
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = AuthController
