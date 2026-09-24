import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import penilaianService from '../services/penilaianService'

export const EVALUATION_QUERY_KEY = 'vendor-evaluations'

/**
 * Hook untuk mengambil evaluasi suatu SPK
 */
export function useSpkEvaluation(spkId) {
  return useQuery({
    queryKey: [EVALUATION_QUERY_KEY, 'spk', spkId],
    queryFn: () => penilaianService.getEvaluationBySpk(spkId),
    enabled: !!spkId,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook untuk mengambil seluruh review dan statistik rating suatu vendor
 */
export function useVendorEvaluationStats(vendorId) {
  return useQuery({
    queryKey: [EVALUATION_QUERY_KEY, 'vendor', vendorId],
    queryFn: () => penilaianService.getVendorEvaluations(vendorId),
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook mutasi submit evaluasi kinerja vendor oleh PPK
 */
export function useSubmitEvaluation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ spkId, payload }) =>
      penilaianService.submitEvaluation(spkId, payload),
    onSuccess: (_, { spkId }) => {
      queryClient.invalidateQueries({
        queryKey: [EVALUATION_QUERY_KEY, 'spk', spkId],
      })
      queryClient.invalidateQueries({
        queryKey: [EVALUATION_QUERY_KEY],
      })
      queryClient.invalidateQueries({
        queryKey: ['available-vendors'],
      })
      queryClient.invalidateQueries({
        queryKey: ['spk'],
      })
    },
  })
}
