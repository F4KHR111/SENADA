import React from 'react'

/**
 * Badge — Komponen label status ringkas sesuai AGENTS.md §7
 * Varian: success (disetujui/selesai), warning (pending/menunggu), danger (ditolak/batal), navy/info, gray
 */
export function Badge({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center font-semibold rounded-full border tracking-wide select-none transition-colors'

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger:  'bg-red-50 text-red-700 border-red-200/80',
    info:    'bg-blue-50 text-navy-700 border-blue-200/80',
    navy:    'bg-navy-900/5 text-navy-900 border-navy-900/15',
    gray:    'bg-gray-100 text-gray-700 border-gray-200/80',
  }

  const dotColorStyles = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger:  'bg-red-500',
    info:    'bg-navy-500',
    navy:    'bg-navy-900',
    gray:    'bg-gray-400',
  }

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.gray} ${
        sizeStyles[size] || sizeStyles.md
      } ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotColorStyles[variant] || dotColorStyles.gray
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  )
}

export default Badge

