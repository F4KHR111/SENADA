import apiClient from '../../../services/apiClient'

/**
 * spkService — API client untuk Modul 5: Surat Pesanan / SPK (AGENTS.md §4 Tahap 5)
 */
export const spkService = {
  /**
   * Mengambil daftar SPK
   */
  async getSpkList(params = {}) {
    const response = await apiClient.get('/spk', { params })
    return response.data
  },

  /**
   * Mengambil detail lengkap SPK beserta rantai pengadaan
   */
  async getSpkById(id) {
    const response = await apiClient.get(`/spk/${id}`)
    return response.data
  },

  /**
   * Menerbitkan SPK baru dari hasil negosiasi yang disetujui (Role: PPK / Admin)
   */
  async createSpk(payload) {
    const response = await apiClient.post('/spk', payload)
    return response.data
  },

  /**
   * Mengubah draf SPK
   */
  async updateSpk(id, payload) {
    const response = await apiClient.put(`/spk/${id}`, payload)
    return response.data
  },

  /**
   * Menandatangani SPK oleh PPK (draft -> signed)
   */
  async signSpk(id) {
    const response = await apiClient.patch(`/spk/${id}/sign`)
    return response.data
  },

  /**
   * Mengunduh file PDF resmi SPK
   */
  async downloadPdf(id, nomorSpk) {
    const response = await apiClient.get(`/spk/${id}/pdf`, {
      responseType: 'blob',
    })

    // Buat URL blob dan trigger download otomatis
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `SPK-${nomorSpk ? nomorSpk.replace(/[\/\\]/g, '_') : id}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)

    return true
  },

  /**
   * Mengambil daftar hasil negosiasi yang disetujui dan siap diterbitkan SPK
   */
  async getAvailableNegosiasi() {
    const response = await apiClient.get('/spk/meta/available-negosiasi')
    return response.data
  },
}

export default spkService
