import React from 'react'

/**
 * Card — Komponen wadah konten utama sesuai AGENTS.md §7
 * Radius: 16px (rounded-2xl), Border: 1px solid gray-200/80, Padding min 24px (p-6), Shadow: card-luxury
 */
export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200/85 shadow-[0_1px_3px_rgba(11,30,61,0.03),0_6px_16px_rgba(11,30,61,0.02)] overflow-hidden ${
        hover ? 'transition-all duration-200 hover:border-navy-500/30 hover:shadow-[0_4px_16px_rgba(11,30,61,0.06),0_12px_28px_rgba(11,30,61,0.03)] hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...props
}) {
  return (
    <div
      className={`px-6 py-5 border-b border-gray-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white ${className}`}
      {...props}
    >
      {children ? (
        children
      ) : (
        <>
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-bold text-navy-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </>
      )}
    </div>
  )
}

export function CardBody({ children, className = '', noPadding = false, ...props }) {
  return (
    <div className={`${noPadding ? '' : 'p-6 sm:p-7'} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex items-center justify-end gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card

