import React from 'react'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'

/**
 * Table — Komponen tabel data profesional sesuai AGENTS.md §7
 * Desain: Zebra-row minimal (gray-50), border tipis gray-200, tipografi bersih
 */
export function Table({ children, className = '', ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(11,30,61,0.03),0_6px_16px_rgba(11,30,61,0.02)]">
      <table className={`w-full text-left border-collapse text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className = '', ...props }) {
  return (
    <thead className={`bg-gray-50/80 border-b border-gray-100 text-[11px] text-gray-500 font-semibold uppercase tracking-wider ${className}`} {...props}>
      {children}
    </thead>
  )
}

export function TableHead({ children, className = '', align = 'left', ...props }) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align] || 'text-left'

  return (
    <th scope="col" className={`py-4 px-5 font-bold ${alignClass} ${className}`} {...props}>
      {children}
    </th>
  )
}

export function TableBody({ children, className = '', ...props }) {
  return (
    <tbody className={`divide-y divide-gray-100/90 bg-white ${className}`} {...props}>
      {children}
    </tbody>
  )
}

export function TableRow({ children, isZebra = false, className = '', hover = true, ...props }) {
  return (
    <tr
      className={`transition-colors duration-150 ${
        isZebra ? 'bg-gray-50/40' : 'bg-white'
      } ${hover ? 'hover:bg-[#F8FAFC]' : ''} ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className = '', align = 'left', ...props }) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align] || 'text-left'

  return (
    <td className={`py-4 px-5 text-navy-900 ${alignClass} ${className}`} {...props}>
      {children}
    </td>
  )
}

export function TableEmpty({
  message = 'Tidak ada data ditemukan.',
  colSpan = 1,
  icon = null,
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 px-4 text-center">
        <div className="flex flex-col items-center justify-center text-gray-400">
          {icon || <Inbox className="w-10 h-10 mb-2 stroke-1 text-gray-300" />}
          <p className="text-sm font-medium text-gray-500">{message}</p>
        </div>
      </td>
    </tr>
  )
}

export function TablePagination({
  currentPage = 1,
  totalPages = 1,
  totalData = 0,
  limit = 10,
  onPageChange = () => {},
}) {
  const from = totalData === 0 ? 0 : (currentPage - 1) * limit + 1
  const to = Math.min(currentPage * limit, totalData)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-white text-xs text-gray-500">
      <div>
        Menampilkan <span className="font-semibold text-navy-900">{from}</span> -{' '}
        <span className="font-semibold text-navy-900">{to}</span> dari{' '}
        <span className="font-semibold text-navy-900">{totalData}</span> data
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center justify-center p-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2 font-medium text-navy-900">
          Halaman {currentPage} dari {Math.max(totalPages, 1)}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center justify-center p-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Table
