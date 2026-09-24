import React from 'react'
import { AlertCircle } from 'lucide-react'

/**
 * Input — Komponen input teks profesional sesuai AGENTS.md §7
 * Terintegrasi penuh dengan React Hook Form melalui forwardRef
 */
export const Input = React.forwardRef(function Input(
  {
    label,
    error,
    helperText,
    required = false,
    leftIcon = null,
    rightIcon = null,
    className = '',
    id,
    type = 'text',
    disabled = false,
    ...props
  },
  ref
) {
  const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={generatedId}
          className="text-xs font-semibold text-gray-700 tracking-wide select-none"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={generatedId}
          type={type}
          disabled={disabled}
          className={`w-full text-sm bg-white text-navy-900 placeholder:text-gray-400 rounded-xl border transition-all duration-150 py-2.5 px-3.5 focus:outline-none focus:ring-4 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon || error ? 'pr-10' : ''} ${
            error
              ? 'border-danger focus:border-danger focus:ring-danger/10'
              : 'border-gray-200/90 hover:border-gray-300 focus:border-navy-500 focus:ring-navy-500/10'
          } ${className}`}
          {...props}
        />

        {error ? (
          <div className="absolute right-3 flex items-center pointer-events-none text-danger">
            <AlertCircle className="w-4 h-4" />
          </div>
        ) : (
          rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )
        )}
      </div>

      {error ? (
        <p className="text-xs text-danger font-medium flex items-center gap-1 mt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  )
})

export const Textarea = React.forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    required = false,
    className = '',
    id,
    rows = 3,
    disabled = false,
    ...props
  },
  ref
) {
  const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={generatedId}
          className="text-xs font-semibold text-gray-700 tracking-wide select-none"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={generatedId}
        rows={rows}
        disabled={disabled}
        className={`w-full text-sm bg-white text-navy-900 placeholder:text-gray-400 rounded-xl border transition-all duration-150 py-2.5 px-3.5 focus:outline-none focus:ring-4 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed resize-y ${
          error
            ? 'border-danger focus:border-danger focus:ring-danger/10'
            : 'border-gray-200/90 hover:border-gray-300 focus:border-navy-500 focus:ring-navy-500/10'
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-danger font-medium mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  )
})

export default Input
