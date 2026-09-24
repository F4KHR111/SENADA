import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import undanganService from '../services/undanganService'

export const UNDANGAN_QUERY_KEY = 'undangan'

/**
 * Hook untuk daftar undangan
 */
export function useUndanganList(params = {}) {
  return useQuery({
    queryKey: [UNDANGAN_QUERY_KEY, params],
    queryFn: () => undanganService.getUndanganList(params),
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook untuk detail undangan
 */
export function useUndanganDetail(id) {
  return useQuery({
    queryKey: [UNDANGAN_QUERY_KEY, id],
    queryFn: () => undanganService.getUndanganById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook mutasi create undangan
 */
export function useCreateUndangan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => undanganService.createUndangan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UNDANGAN_QUERY_KEY] })
    },
  })
}

/**
 * Hook mutasi kirim / publish undangan
 */
export function useSendUndangan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => undanganService.sendUndangan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [UNDANGAN_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [UNDANGAN_QUERY_KEY, id] })
    },
  })
}

/**
 * Hook mutasi tutup penawaran undangan
 */
export function useCloseUndangan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => undanganService.closeUndangan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [UNDANGAN_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [UNDANGAN_QUERY_KEY, id] })
    },
  })
}

/**
 * Hook mutasi hapus draft undangan
 */
export function useDeleteUndangan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => undanganService.deleteUndangan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UNDANGAN_QUERY_KEY] })
    },
  })
}

/**
 * Hook mutasi respon vendor terhadap undangan
 */
export function useRespondUndangan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => undanganService.respondUndangan(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [UNDANGAN_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [UNDANGAN_QUERY_KEY, id] })
    },
  })
}

/**
 * Hook query meta penyedia terverifikasi
 */
export function useAvailableVendors() {
  return useQuery({
    queryKey: ['available-vendors'],
    queryFn: () => undanganService.getAvailableVendors(),
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook query meta HPS terverifikasi
 */
export function useAvailableHps() {
  return useQuery({
    queryKey: ['available-hps-for-undangan'],
    queryFn: () => undanganService.getAvailableHps(),
    staleTime: 1000 * 60 * 2,
  })
}
