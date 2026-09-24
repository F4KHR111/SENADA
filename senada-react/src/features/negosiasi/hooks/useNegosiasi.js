import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import negosiasiService from '../services/negosiasiService'

export const NEGOSIASI_QUERY_KEY = 'negosiasi'

export function useNegosiasiHistory(penawaranId) {
  return useQuery({
    queryKey: [NEGOSIASI_QUERY_KEY, 'penawaran', penawaranId],
    queryFn: () => negosiasiService.getHistoryByPenawaranId(penawaranId),
    enabled: !!penawaranId,
    staleTime: 1000 * 60 * 1,
  })
}

export function useNegosiasiDetail(id) {
  return useQuery({
    queryKey: [NEGOSIASI_QUERY_KEY, id],
    queryFn: () => negosiasiService.getById(id),
    enabled: !!id,
  })
}

export function useCreateUsulanNegosiasi() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => negosiasiService.createUsulan(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [NEGOSIASI_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['penawaran'] })
    },
  })
}

export function useRespondNegosiasi() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => negosiasiService.respondUsulan(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NEGOSIASI_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['penawaran'] })
    },
  })
}
