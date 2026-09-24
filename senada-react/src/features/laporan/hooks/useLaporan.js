import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import laporanService from '../services/laporanService'

export const LAPORAN_QUERY_KEY = 'laporan'
export const SPM_QUERY_KEY = 'spm'

export function useLaporanRekap() {
  return useQuery({
    queryKey: [LAPORAN_QUERY_KEY, 'rekap'],
    queryFn: () => laporanService.getRekap(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useRealisasiList(params = {}) {
  return useQuery({
    queryKey: [LAPORAN_QUERY_KEY, 'realisasi', params],
    queryFn: () => laporanService.getRealisasiList(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateRealisasi() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => laporanService.createRealisasi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LAPORAN_QUERY_KEY] })
    },
  })
}

export function useSpmList(params = {}) {
  return useQuery({
    queryKey: [SPM_QUERY_KEY, params],
    queryFn: () => laporanService.getSpmList(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateSpm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => laporanService.createSpm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SPM_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [LAPORAN_QUERY_KEY] })
    },
  })
}
