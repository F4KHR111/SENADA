import React from 'react'
import { Badge } from '../../../components/Badge'

/**
 * SpkStatusBadge — Status dokumen SPK / Surat Pesanan
 * draft -> signed -> active -> completed / cancelled
 */
export function SpkStatusBadge({ status, size = 'md' }) {
  const configs = {
    draft: {
      variant: 'warning',
      label: 'Draft PPK',
    },
    signed: {
      variant: 'info',
      label: 'Ditandatangani PPK',
    },
    active: {
      variant: 'navy',
      label: 'Pekerjaan Aktif',
    },
    completed: {
      variant: 'success',
      label: 'Kontrak Selesai',
    },
    cancelled: {
      variant: 'danger',
      label: 'Dibatalkan',
    },
  }

  const config = configs[status] || { variant: 'gray', label: status || 'Unknown' }

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  )
}

export default SpkStatusBadge
