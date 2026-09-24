import React from 'react'
import { Badge } from '../../../components/Badge'

export function LaporanRealisasiStatusBadge({ status, size = 'md' }) {
  const configs = {
    draft: {
      variant: 'warning',
      label: 'Draft Laporan',
    },
    submitted: {
      variant: 'success',
      label: 'Telah Dilaporkan',
    },
  }

  const config = configs[status] || { variant: 'gray', label: status || 'Unknown' }

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  )
}

export function SpmStatusBadge({ status, size = 'md' }) {
  const configs = {
    pending: {
      variant: 'warning',
      label: 'Menunggu SAKTI',
    },
    processed: {
      variant: 'success',
      label: 'SPM Terbit di SAKTI',
    },
  }

  const config = configs[status] || { variant: 'gray', label: status || 'Unknown' }

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  )
}

export default LaporanRealisasiStatusBadge
