import apiClient from '../../../services/apiClient'

/**
 * penilaianService — API client untuk evaluasi kinerja vendor pasca serah terima
 */
export const penilaianService = {
  /**
   * Memberikan penilaian kinerja vendor oleh PPK
   */
  async submitEvaluation(spkId, payload) {
    const response = await apiClient.post(`/evaluations/${spkId}`, payload)
    return response.data
  },

  /**
   * Mengambil hasil penilaian untuk satu SPK
   */
  async getEvaluationBySpk(spkId) {
    const response = await apiClient.get(`/evaluations/spk/${spkId}`)
    return response.data
  },

  /**
   * Mengambil ringkasan reputasi dan ulasan suatu vendor
   */
  async getVendorEvaluations(vendorId) {
    const response = await apiClient.get(`/evaluations/vendor/${vendorId}`)
    return response.data
  },
}

export default penilaianService
