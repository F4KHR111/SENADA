import apiClient from '../../../services/apiClient'

/**
 * undanganService — API client untuk Modul 2: Undangan Pengadaan (AGENTS.md §4 Tahap 2)
 */
export const undanganService = {
  /**
   * Mengambil daftar undangan (terfilter otomatis sesuai role user)
   */
  async getUndanganList(params = {}) {
    const response = await apiClient.get('/undangan', { params })
    return response.data
  },

  /**
   * Mengambil detail lengkap undangan (otomatis set status viewed untuk vendor)
   */
  async getUndanganById(id) {
    const response = await apiClient.get(`/undangan/${id}`)
    return response.data
  },

  /**
   * Menerbitkan paket undangan baru untuk penyedia (Role: PBJ / Admin)
   */
  async createUndangan(payload) {
    const response = await apiClient.post('/undangan', payload)
    return response.data
  },

  /**
   * Mengubah draf undangan
   */
  async updateUndangan(id, payload) {
    const response = await apiClient.put(`/undangan/${id}`, payload)
    return response.data
  },

  /**
   * Menerbitkan / Mengirim undangan ke para vendor rekanan (draft -> sent)
   */
  async sendUndangan(id) {
    const response = await apiClient.patch(`/undangan/${id}/send`)
    return response.data
  },

  /**
   * Menutup masa penawaran undangan (sent -> closed)
   */
  async closeUndangan(id) {
    const response = await apiClient.patch(`/undangan/${id}/close`)
    return response.data
  },

  /**
   * Menghapus draf undangan
   */
  async deleteUndangan(id) {
    const response = await apiClient.delete(`/undangan/${id}`)
    return response.data
  },

  /**
   * Respon penyedia terhadap undangan (mis. menolak/decline)
   */
  async respondUndangan(id, payload) {
    const response = await apiClient.patch(`/undangan/${id}/respond`, payload)
    return response.data
  },

  /**
   * Mengambil daftar penyedia terverifikasi yang siap diundang
   */
  async getAvailableVendors() {
    const response = await apiClient.get('/undangan/meta/vendors')
    return response.data
  },

  /**
   * Mengambil daftar HPS terverifikasi yang belum memiliki undangan
   */
  async getAvailableHps() {
    const response = await apiClient.get('/undangan/meta/hps')
    return response.data
  },
}

export default undanganService
