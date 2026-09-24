import apiClient from '../../../services/apiClient'

/**
 * negosiasiService — API client untuk Modul 4: Negosiasi Harga (AGENTS.md §4 Tahap 4)
 */
export const negosiasiService = {
  /**
   * Mengajukan usulan ronde negosiasi baru oleh PBJ
   */
  async createUsulan(payload) {
    const response = await apiClient.post('/negosiasi', payload)
    return response.data
  },

  /**
   * Respon penyedia terhadap usulan harga negosiasi (accepted / rejected)
   */
  async respondUsulan(id, payload) {
    const response = await apiClient.patch(`/negosiasi/${id}/respond`, payload)
    return response.data
  },

  /**
   * Mengambil riwayat histori ronde negosiasi untuk satu penawaran
   */
  async getHistoryByPenawaranId(penawaranId) {
    const response = await apiClient.get(`/negosiasi/penawaran/${penawaranId}/history`)
    return response.data
  },

  /**
   * Mengambil detail satu ronde negosiasi
   */
  async getById(id) {
    const response = await apiClient.get(`/negosiasi/${id}`)
    return response.data
  },
}

export default negosiasiService
