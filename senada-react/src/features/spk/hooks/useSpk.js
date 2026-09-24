import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import spkService from '../services/spkService'

export const SPK_QUERY_KEY = 'spk'

export function useSpkList(params = {}) {
  return useQuery({
    queryKey: [SPK_QUERY_KEY, params],
    queryFn: () => spkService.getSpkList(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useSpkDetail(id) {
  return useQuery({
    queryKey: [SPK_QUERY_KEY, id],
    queryFn: () => spkService.getSpkById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateSpk() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => spkService.createSpk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SPK_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['negosiasi'] })
    },
  })
}

export function useSignSpk() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => spkService.signSpk(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [SPK_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [SPK_QUERY_KEY, id] })
    },
  })
}

export function useAvailableNegosiasi() {
  return useQuery({
    queryKey: ['available-negosiasi-for-spk'],
    queryFn: () => spkService.getAvailableNegosiasi(),
    staleTime: 1000 * 60 * 1,
  })
}
