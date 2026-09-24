import React from 'react'
import { Badge } from '../../../components/Badge'

/**
 * UndanganStatusBadge — Badge status paket undangan sesuai AGENTS.md §4 Tahap 2
 * draft -> sent -> closed
 */
export function UndanganStatusBadge({ status, size = 'md' }) {
  const configs = {
    draft: {
      variant: 'warning',
      label: 'Draft PBJ',
    },
    sent: {
      variant: 'info',
      label: 'Masa Penawaran Buka',
    },
    closed: {
      variant: 'gray',
      label: 'Penawaran Ditutup',
    },
  }

  const config = configs[status] || { variant: 'gray', label: status || 'Unknown' }

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  )
}

export function VendorInvitationStatusBadge({ status, size = 'md' }) {
  const configs = {
    invited: {
      variant: 'gray',
      label: 'Diundang (Belum Dilihat)',
    },
    viewed: {
      variant: 'info',
      label: 'Dilihat Rekanan',
    },
    submitted: {
      variant: 'success',
      label: 'Penawaran Masuk',
    },
    declined: {
      variant: 'danger',
      label: 'Menolak Undangan',
    },
  }

  const config = configs[status] || { variant: 'gray', label: status || 'Unknown' }

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  )
}

export default UndanganStatusBadge
