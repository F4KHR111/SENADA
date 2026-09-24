import apiClient from '../../../services/apiClient'

/**
 * penawaranService — API client untuk Modul 3: Penawaran Harga Penyedia (AGENTS.md §4 Tahap 3)
 */
export const penawaranService = {
  /**
   * Mengambil daftar penawaran harga
   */
  async getPenawaranList(params = {}) {
    const response = await apiClient.get('/penawaran', { params })
    return response.data
  },

  /**
   * Mengambil detail satu penawaran harga beserta item dan histori negosiasi
   */
  async getPenawaranById(id) {
    const response = await apiClient.get(`/penawaran/${id}`)
    return response.data
  },

  /**
   * Mengajukan penawaran harga baru (beserta opsional berkas surat)
   */
  async createPenawaran(formData) {
    const response = await apiClient.post('/penawaran', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Memperbarui rincian harga penawaran (status 'submitted')
   */
  async updatePenawaran(id, formData) {
    const response = await apiClient.put(`/penawaran/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Mengunggah dokumen penawaran bertandatangan & cap basah
   */
  async uploadDocument(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(`/penawaran/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

export default penawaranService
