import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import hpsService from '../services/hpsService'

export const HPS_QUERY_KEY = 'hps'

/**
 * Hook untuk mengambil daftar HPS dengan auto-caching dan filter
 */
export function useHpsList(params = {}) {
  return useQuery({
    queryKey: [HPS_QUERY_KEY, params],
    queryFn: () => hpsService.getHpsList(params),
    staleTime: 1000 * 60 * 2, // 2 menit
  })
}

/**
 * Hook untuk mengambil detail HPS berdasarkan UUID
 */
export function useHpsDetail(id) {
  return useQuery({
    queryKey: [HPS_QUERY_KEY, id],
    queryFn: () => hpsService.getHpsById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook mutasi untuk membuat HPS baru
 */
export function useCreateHps() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData) => hpsService.createHps(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HPS_QUERY_KEY] })
    },
  })
}

/**
 * Hook mutasi untuk mengubah HPS
 */
export function useUpdateHps() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => hpsService.updateHps(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [HPS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [HPS_QUERY_KEY, id] })
    },
  })
}

/**
 * Hook mutasi untuk menghapus HPS draft
 */
export function useDeleteHps() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => hpsService.deleteHps(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HPS_QUERY_KEY] })
    },
  })
}

/**
 * Hook mutasi untuk verifikasi HPS oleh PBJ
 */
export function useVerifyHps() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => hpsService.verifyHps(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [HPS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [HPS_QUERY_KEY, id] })
    },
  })
}

/**
 * Hook mutasi untuk mengunggah dokumen pendukung HPS
 */
export function useUploadHpsDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }) => hpsService.uploadDocument(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [HPS_QUERY_KEY, id] })
    },
  })
}
