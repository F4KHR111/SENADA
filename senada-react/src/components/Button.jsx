import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Button — Komponen tombol profesional sesuai AGENTS.md §7
 * Palet: navy-900 (primary), navy-700 (hover), white, gray-200
 */
export const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    pill = false,
    isLoading = false,
    disabled = false,
    leftIcon = null,
    rightIcon = null,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  // Base styling: radius, font weight, smooth transition, micro-shadow
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-navy-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none'

  const shapeStyles = pill ? 'rounded-full' : 'rounded-xl'

  // Varian tombol sesuai design system §7
  const variantStyles = {
    primary:
      'bg-navy-900 text-white hover:bg-navy-700 active:bg-navy-900 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 border border-transparent',
    secondary:
      'bg-white text-navy-900 hover:bg-gray-50 active:bg-gray-100 border border-gray-200/90 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0',
    outline:
      'bg-transparent text-navy-700 hover:bg-navy-50 active:bg-navy-100 border border-navy-300 hover:border-navy-500',
    ghost:
      'bg-transparent text-gray-700 hover:text-navy-900 hover:bg-gray-100/80 active:bg-gray-200 border border-transparent',
    danger:
      'bg-danger text-white hover:bg-danger/90 active:bg-danger shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 border border-transparent',
    success:
      'bg-success text-white hover:bg-success/90 active:bg-success shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 border border-transparent',
  }

  // Ukuran tombol
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  }

  const combinedClasses = `${baseStyles} ${shapeStyles} ${variantStyles[variant] || variantStyles.primary} ${
    sizeStyles[size] || sizeStyles.md
  } ${className}`

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={combinedClasses}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </button>
  )
})

export default Button
