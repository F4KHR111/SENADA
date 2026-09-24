import React from 'react'
import { Badge } from '../../../components/Badge'

/**
 * HpsStatusBadge — Badge status HPS sesuai state machine AGENTS.md §4 Tahap 1
 * draft -> verified -> fixed
 */
export function HpsStatusBadge({ status, size = 'md' }) {
  const configs = {
    draft: {
      variant: 'warning',
      label: 'Draft PPK',
    },
    verified: {
      variant: 'info',
      label: 'Diverifikasi PBJ',
    },
    fixed: {
      variant: 'success',
      label: 'Fixed (Terkunci)',
    },
  }

  const config = configs[status] || { variant: 'gray', label: status || 'Unknown' }

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  )
}

export default HpsStatusBadge
