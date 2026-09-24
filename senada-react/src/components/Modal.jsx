import React, { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * Modal — Komponen dialog popup profesional sesuai AGENTS.md §7
 * Radius: 12px (rounded-xl), Shadow: shadow-modal, Backdrop: navy-900/40 blur
 */
export function Modal({
  isOpen = false,
  onClose,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  className = '',
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  }[size] || 'max-w-lg'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => closeOnOverlayClick && onClose && onClose()}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 ${sizeStyles} ${className}`}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({
  title,
  subtitle,
  onClose,
  children,
  className = '',
}) {
  return (
    <div
      className={`px-6 py-5 border-b border-gray-200 flex items-start justify-between gap-4 bg-white ${className}`}
    >
      {children ? (
        children
      ) : (
        <>
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-navy-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-navy-900 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              title="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </>
      )}
    </div>
  )
}

export function ModalBody({ children, className = '', ...props }) {
  return (
    <div className={`p-6 max-h-[75vh] overflow-y-auto ${className}`} {...props}>
      {children}
    </div>
  )
}

export function ModalFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Modal
