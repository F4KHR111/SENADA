import apiClient from '../../../services/apiClient'

/**
 * serahTerimaService — API client untuk Modul 6: Serah Terima & BAST (AGENTS.md §4 Tahap 6)
 */
export const serahTerimaService = {
  /**
   * Mengunggah surat jalan / dokumen pengiriman / izin mulai kerja oleh rekanan
   */
  async uploadDokumen(spkId, file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(`/serah-terima/${spkId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Menyelesaikan proses serah terima dan menerbitkan BAST oleh PPK
   */
  async completeSerahTerima(spkId, payload) {
    const response = await apiClient.patch(`/serah-terima/${spkId}/complete`, payload)
    return response.data
  },

  /**
   * Mengambil data Resume SPK lengkap (untuk SAKTI / pelaporan keuangan)
   */
  async getResumeSpk(spkId) {
    const response = await apiClient.get(`/serah-terima/${spkId}/resume`)
    return response.data
  },
}

export default serahTerimaService
