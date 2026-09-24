import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import penawaranService from '../services/penawaranService'

export const PENAWARAN_QUERY_KEY = 'penawaran'

export function usePenawaranList(params = {}) {
  return useQuery({
    queryKey: [PENAWARAN_QUERY_KEY, params],
    queryFn: () => penawaranService.getPenawaranList(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function usePenawaranDetail(id) {
  return useQuery({
    queryKey: [PENAWARAN_QUERY_KEY, id],
    queryFn: () => penawaranService.getPenawaranById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreatePenawaran() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData) => penawaranService.createPenawaran(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PENAWARAN_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['undangan'] })
    },
  })
}

export function useUpdatePenawaran() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }) => penawaranService.updatePenawaran(id, formData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [PENAWARAN_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [PENAWARAN_QUERY_KEY, id] })
    },
  })
}

export function useUploadPenawaranDoc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }) => penawaranService.uploadDocument(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [PENAWARAN_QUERY_KEY, id] })
    },
  })
}
