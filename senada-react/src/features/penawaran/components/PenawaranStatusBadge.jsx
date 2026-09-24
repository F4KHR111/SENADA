import React from 'react'
import { Badge } from '../../../components/Badge'

/**
 * PenawaranStatusBadge — Status penawaran harga sesuai AGENTS.md §4 Tahap 3-4
 * submitted -> negotiating -> approved / rejected
 */
export function PenawaranStatusBadge({ status, size = 'md' }) {
  const configs = {
    submitted: {
      variant: 'info',
      label: 'Diajukan Rekanan',
    },
    negotiating: {
      variant: 'warning',
      label: 'Proses Negosiasi',
    },
    approved: {
      variant: 'success',
      label: 'Disetujui (Siap SPK)',
    },
    rejected: {
      variant: 'danger',
      label: 'Ditolak',
    },
  }

  const config = configs[status] || { variant: 'gray', label: status || 'Unknown' }

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  )
}

export default PenawaranStatusBadge
