import React from 'react'
import { Badge } from '../../../components/Badge'

/**
 * NegosiasiStatusBadge — Status satu ronde negosiasi
 * pending -> accepted / rejected
 */
export function NegosiasiStatusBadge({ status, size = 'md' }) {
  const configs = {
    pending: {
      variant: 'warning',
      label: 'Menunggu Respon Rekanan',
    },
    accepted: {
      variant: 'success',
      label: 'Disetujui (Sepakat)',
    },
    rejected: {
      variant: 'danger',
      label: 'Ditolak Rekanan',
    },
  }

  const config = configs[status] || { variant: 'gray', label: status || 'Unknown' }

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  )
}

export default NegosiasiStatusBadge
