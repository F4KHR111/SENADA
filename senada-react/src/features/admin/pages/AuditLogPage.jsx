import React, { useState } from 'react'
import { useAdminAuditLogs } from '../hooks/useAdmin'
import { Card, CardHeader, CardBody } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmpty,
  TablePagination,
} from '../../../components/Table'
import { formatDateTime } from '../../../utils/formatters'
import {
  History,
  Search,
  RotateCcw,
  Eye,
  Calendar,
  Filter,
  User,
  Activity,
  Loader2,
  AlertCircle,
  X,
  Code2,
} from 'lucide-react'

export function AuditLogPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(15)

  // Filter states
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data, isLoading, isError, error, refetch } = useAdminAuditLogs({
    page,
    limit,
    entity_type: entityType || undefined,
    action: action || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  })

  const logs = data?.data || []
  const pagination = data?.pagination || {
    totalData: 0,
    totalPages: 1,
    currentPage: 1,
  }

  const handleOpenDetail = (log) => {
    setSelectedLog(log)
    setIsModalOpen(true)
  }

  const getActionBadgeColor = (act) => {
    switch (act) {
      case 'create':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'update':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'approve':
      case 'verify':
      case 'sign':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200'
      case 'reject':
      case 'deactivate':
        return 'bg-red-50 text-danger border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-navy-900 text-white rounded-lg inline-flex">
              <History className="w-5 h-5 text-blue-300" />
            </span>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              Audit Log Sistem
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pencatatan jejak audit immutable seluruh tindakan krusial pengguna (siapa, kapan, apa yang diubah, IP address) sesuai AGENTS.md §6.6.
          </p>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <Card>
        <CardBody className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Filter Modul / Entity */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Modul / Entitas
              </label>
              <select
                value={entityType}
                onChange={(e) => {
                  setEntityType(e.target.value)
                  setPage(1)
                }}
                className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2 px-3 focus:outline-none focus:border-navy-500"
              >
                <option value="">Semua Modul</option>
                <option value="users">Users & Akun</option>
                <option value="vendor_profiles">Vendor Profiles</option>
                <option value="hps">HPS</option>
                <option value="undangan">Undangan</option>
                <option value="penawaran">Penawaran</option>
                <option value="negosiasi">Negosiasi</option>
                <option value="spk">SPK / Surat Pesanan</option>
                <option value="serah_terima">Serah Terima</option>
                <option value="laporan_realisasi">Laporan Realisasi</option>
                <option value="spm_references">SPM References</option>
              </select>
            </div>

            {/* Filter Action */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Aksi (Action)
              </label>
              <select
                value={action}
                onChange={(e) => {
                  setAction(e.target.value)
                  setPage(1)
                }}
                className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2 px-3 focus:outline-none focus:border-navy-500"
              >
                <option value="">Semua Aksi</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="sign">Sign (TTE)</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
              </select>
            </div>

            {/* Filter Tanggal Mulai */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPage(1)
                }}
                className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2 px-3 focus:outline-none focus:border-navy-500"
              />
            </div>

            {/* Filter Tanggal Sampai */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPage(1)
                }}
                className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2 px-3 focus:outline-none focus:border-navy-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Total riwayat log: <strong>{pagination.totalData || 0}</strong> entri
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEntityType('')
                setAction('')
                setStartDate('')
                setEndDate('')
                setPage(1)
                refetch()
              }}
              className="text-gray-500"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Filter
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* ── Table Data ─────────────────────────────────────────────── */}
      <Card>
        <CardBody noPadding>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-navy-700 mb-2" />
              <p className="text-xs font-medium text-gray-500">Memuat catatan audit log...</p>
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-danger text-xs">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              {error?.response?.data?.message || 'Gagal memuat audit log.'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead className="w-48">Waktu Kejadian</TableHead>
                  <TableHead className="w-52">Pelaku (User)</TableHead>
                  <TableHead align="center" className="w-28">Aksi</TableHead>
                  <TableHead className="w-44">Entitas / Modul</TableHead>
                  <TableHead>IP Address & Agen</TableHead>
                  <TableHead align="center" className="w-20">Detail</TableHead>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableEmpty message="Belum ada catatan audit log yang cocok dengan filter." colSpan={7} />
                  ) : (
                    logs.map((item, idx) => (
                      <TableRow key={item.id} isZebra={idx % 2 === 1}>
                        <TableCell align="center" className="text-gray-400 font-mono text-xs">
                          {(page - 1) * limit + idx + 1}
                        </TableCell>

                        <TableCell className="font-mono text-xs text-navy-900">
                          {formatDateTime(item.created_at)}
                        </TableCell>

                        <TableCell>
                          <p className="font-semibold text-navy-900 text-xs">
                            {item.user ? item.user.name : 'System / Otomatis'}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono">
                            {item.user ? item.user.email : '-'}
                          </p>
                        </TableCell>

                        <TableCell align="center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getActionBadgeColor(
                              item.action
                            )}`}
                          >
                            {item.action}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-navy-900 bg-gray-100 px-2 py-0.5 rounded">
                            {item.entity_type}
                          </span>
                          <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5 max-w-[150px]">
                            {item.entity_id}
                          </p>
                        </TableCell>

                        <TableCell>
                          <p className="font-mono text-[11px] text-gray-700">{item.ip_address || '-'}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-xs">{item.user_agent || '-'}</p>
                        </TableCell>

                        <TableCell align="center">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            className="p-1.5 text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-md transition-colors"
                            title="Tinjau Data Perubahan (Before/After)"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {logs.length > 0 && (
                <TablePagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalData={pagination.totalData}
                  limit={pagination.limit}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* ── Modal Detail JSON (Before / After Payload) ────────────────── */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-navy-900 text-white">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="font-bold text-base">Detail Catatan Audit Log</h3>
                  <p className="text-[11px] text-gray-300 font-mono">
                    ID: {selectedLog.id} • {formatDateTime(selectedLog.created_at)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-400 text-[11px]">Pelaku</span>
                  <p className="font-semibold text-navy-900 mt-0.5">
                    {selectedLog.user ? `${selectedLog.user.name} (${selectedLog.user.email})` : 'System'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px]">Aksi & Entitas</span>
                  <p className="font-mono font-bold text-navy-900 mt-0.5">
                    {selectedLog.action.toUpperCase()} : {selectedLog.entity_type}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px]">Target Entity ID</span>
                  <p className="font-mono text-navy-900 mt-0.5 truncate">{selectedLog.entity_id}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px]">IP Address</span>
                  <p className="font-mono text-navy-900 mt-0.5">{selectedLog.ip_address || '-'}</p>
                </div>
              </div>

              {/* Before Data */}
              <div>
                <span className="font-bold text-navy-900 uppercase tracking-wider text-[11px] block mb-1">
                  Data Sebelum Perubahan (Before):
                </span>
                <pre className="p-3 bg-navy-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-navy-800">
                  {selectedLog.before_data
                    ? JSON.stringify(selectedLog.before_data, null, 2)
                    : '// Tidak ada data sebelumnya (Entri Baru)'}
                </pre>
              </div>

              {/* After Data */}
              <div>
                <span className="font-bold text-navy-900 uppercase tracking-wider text-[11px] block mb-1">
                  Data Setelah Perubahan (After):
                </span>
                <pre className="p-3 bg-navy-900 text-blue-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-navy-800">
                  {selectedLog.after_data
                    ? JSON.stringify(selectedLog.after_data, null, 2)
                    : '// Null'}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditLogPage
