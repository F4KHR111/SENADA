import apiClient from './apiClient'

/**
 * authService — API client methods untuk autentikasi pengguna dan penyedia (AGENTS.md §6 & §8)
 */
export const authService = {
  /**
   * Login pengguna & dapatkan Access Token + simpan cookie Refresh Token
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  /**
   * Registrasi akun rekanan / penyedia baru
   */
  async register(vendorData) {
    const response = await apiClient.post('/auth/register', vendorData)
    return response.data
  },

  /**
   * Perbarui access token secara manual / silent
   */
  async refreshToken() {
    const response = await apiClient.post('/auth/refresh-token')
    return response.data
  },

  /**
   * Logout dan revoke refresh token di server
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout')
      return response.data
    } catch {
      // Abaikan error saat logout di sisi server agar proses logout frontend tetap selesai
      return { success: true }
    }
  },

  /**
   * Mengambil data profil dan permission pengguna saat ini
   */
  async getMe() {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  /**
   * Memperbarui profil legalitas & rekening bank rekanan (Penyedia)
   */
  async updateVendorProfile(payload) {
    const response = await apiClient.put('/auth/vendor-profile', payload)
    return response.data
  },
}

export default authService
