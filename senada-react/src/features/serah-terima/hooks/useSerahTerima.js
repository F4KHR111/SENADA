import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import serahTerimaService from '../services/serahTerimaService'

export const RESUME_SPK_QUERY_KEY = 'resume-spk'

export function useResumeSpk(spkId) {
  return useQuery({
    queryKey: [RESUME_SPK_QUERY_KEY, spkId],
    queryFn: () => serahTerimaService.getResumeSpk(spkId),
    enabled: !!spkId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUploadSerahTerimaDoc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ spkId, file }) => serahTerimaService.uploadDokumen(spkId, file),
    onSuccess: (_, { spkId }) => {
      queryClient.invalidateQueries({ queryKey: [RESUME_SPK_QUERY_KEY, spkId] })
      queryClient.invalidateQueries({ queryKey: ['spk', spkId] })
    },
  })
}

export function useCompleteSerahTerima() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ spkId, payload }) => serahTerimaService.completeSerahTerima(spkId, payload),
    onSuccess: (_, { spkId }) => {
      queryClient.invalidateQueries({ queryKey: [RESUME_SPK_QUERY_KEY, spkId] })
      queryClient.invalidateQueries({ queryKey: ['spk', spkId] })
      queryClient.invalidateQueries({ queryKey: ['spk'] })
    },
  })
}
