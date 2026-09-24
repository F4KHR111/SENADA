import apiClient from '../../../services/apiClient'

/**
 * hpsService — API client untuk Modul 1: Harga Perkiraan Sendiri (AGENTS.md §4 Tahap 1)
 */
export const hpsService = {
  /**
   * Mengambil daftar HPS dengan filter status, tahun anggaran, pencarian, dan pagination
   */
  async getHpsList(params = {}) {
    const response = await apiClient.get('/hps', { params })
    return response.data
  },

  /**
   * Mengambil detail HPS lengkap beserta item barang, dokumen pendukung, PPK, dan PBJ
   */
  async getHpsById(id) {
    const response = await apiClient.get(`/hps/${id}`)
    return response.data
  },

  /**
   * Membuat paket HPS baru beserta rincian barang (mendukung upload file pendukung)
   */
  async createHps(formData) {
    const isFormData = formData instanceof FormData
    const response = await apiClient.post('/hps', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
    return response.data
  },

  /**
   * Mengubah paket HPS (hanya boleh saat status masih 'draft')
   */
  async updateHps(id, data) {
    const isFormData = data instanceof FormData
    const response = await apiClient.put(`/hps/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
    return response.data
  },

  /**
   * Menghapus paket HPS (hanya boleh saat status masih 'draft')
   */
  async deleteHps(id) {
    const response = await apiClient.delete(`/hps/${id}`)
    return response.data
  },

  /**
   * Verifikasi HPS oleh Pejabat Pengadaan (PBJ) -> draft ke verified/fixed
   */
  async verifyHps(id, payload) {
    const response = await apiClient.patch(`/hps/${id}/verify`, payload)
    return response.data
  },

  /**
   * Mengunggah dokumen pendukung tambahan ke HPS
   */
  async uploadDocument(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(`/hps/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

export default hpsService
