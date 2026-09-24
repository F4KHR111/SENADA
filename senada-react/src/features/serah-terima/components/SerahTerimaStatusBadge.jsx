import React from 'react'
import { Badge } from '../../../components/Badge'

/**
 * SerahTerimaStatusBadge — Status proses serah terima dan BAST
 * pending -> completed
 */
export function SerahTerimaStatusBadge({ status, size = 'md' }) {
  const configs = {
    pending: {
      variant: 'warning',
      label: 'Menunggu BAST (Pending)',
    },
    completed: {
      variant: 'success',
      label: 'BAST Terbit (Selesai)',
    },
  }

  const config = configs[status] || { variant: 'gray', label: status || 'Unknown' }

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  )
}

export default SerahTerimaStatusBadge
