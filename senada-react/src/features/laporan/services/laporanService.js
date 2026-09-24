import apiClient from '../../../services/apiClient'

/**
 * laporanService — API client untuk Modul 7: Pelaporan Keuangan & SPM SAKTI (AGENTS.md §4 Tahap 7)
 */
export const laporanService = {
  /**
   * Mengambil rekapitulasi statistik pelaporan keuangan
   */
  async getRekap() {
    const response = await apiClient.get('/laporan/rekap')
    return response.data
  },

  /**
   * Mengambil daftar laporan realisasi anggaran
   */
  async getRealisasiList(params = {}) {
    const response = await apiClient.get('/laporan/realisasi', { params })
    return response.data
  },

  /**
   * Menginput data laporan realisasi (Role: Petugas Laporan / Admin)
   */
  async createRealisasi(payload) {
    const response = await apiClient.post('/laporan/realisasi', payload)
    return response.data
  },

  /**
   * Mengubah data laporan realisasi
   */
  async updateRealisasi(id, payload) {
    const response = await apiClient.put(`/laporan/realisasi/${id}`, payload)
    return response.data
  },

  /**
   * Mengambil daftar referensi nomor SPM SAKTI
   */
  async getSpmList(params = {}) {
    const response = await apiClient.get('/laporan/spm', { params })
    return response.data
  },

  /**
   * Mencatat nomor SPM hasil pemrosesan di aplikasi SAKTI (Role: PPSPM / Admin)
   */
  async createSpm(payload) {
    const response = await apiClient.post('/laporan/spm', payload)
    return response.data
  },

  /**
   * Mengubah data referensi SPM
   */
  async updateSpm(id, payload) {
    const response = await apiClient.put(`/laporan/spm/${id}`, payload)
    return response.data
  },
}

export default laporanService
