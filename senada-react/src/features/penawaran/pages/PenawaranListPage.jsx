import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { usePenawaranList } from '../hooks/usePenawaran'
import { useUndanganList } from '../../undangan/hooks/useUndangan'
import useAuthStore from '../../../store/authStore'
import { Card, CardBody } from '../../../components/Card'
import { Button } from '../../../components/Button'
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
import PenawaranStatusBadge from '../components/PenawaranStatusBadge'
import { formatRupiah, formatDateTime } from '../../../utils/formatters'
import {
  Send,
  Building2,
  Scale,
  Eye,
  Plus,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react'

export function PenawaranListPage() {
  const { user, hasPermission } = useAuthStore()

  const [searchParams, setSearchParams] = useSearchParams()
  const initialUndanganId = searchParams.get('undangan_id') || ''

  // State
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [status, setStatus] = useState('')
  const [selectedUndanganId, setSelectedUndanganId] = useState(initialUndanganId)

  // Query options paket undangan untuk filter perbandingan PBJ
  const { data: undanganData } = useUndanganList({ limit: 100 })
  const availableUndangan = undanganData?.data || []

  const { data, isLoading, isError, error, refetch } = usePenawaranList({
    page,
    limit,
    status: status || undefined,
    undangan_id: selectedUndanganId || undefined,
  })

  const penawaranList = data?.data || []
  const pagination = data?.pagination || {
    totalData: 0,
    totalPages: 1,
    currentPage: 1,
  }

  const isVendor = user?.roles?.includes('penyedia')

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-navy-900 text-white rounded-lg inline-flex">
              <Send className="w-5 h-5 text-blue-300" />
            </span>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              {isVendor ? 'Penawaran Saya' : 'Penawaran Harga Penyedia'}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isVendor
              ? 'Daftar seluruh berkas penawaran harga yang telah diajukan perusahaan Anda ke instansi.'
              : 'Tahap 3: Pemasukan rincian harga penawaran oleh rekanan berdasarkan volume HPS (AGENTS.md §4 Tahap 3)'}
          </p>
        </div>

        {isVendor && hasPermission('penawaran:create') && (
          <Link to="/undangan">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Lihat Undangan & Ajukan Penawaran
            </Button>
          </Link>
        )}
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <Card>
        <CardBody className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Filter Paket Undangan (Khusus PBJ/Admin untuk Perbandingan Penawaran) */}
            {!isVendor && (
              <div className="w-full sm:w-80">
                <select
                  value={selectedUndanganId}
                  onChange={(e) => {
                    setSelectedUndanganId(e.target.value)
                    setSearchParams(e.target.value ? { undangan_id: e.target.value } : {})
                    setPage(1)
                  }}
                  className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500 font-medium"
                >
                  <option value="">-- Semua Paket Undangan --</option>
                  {availableUndangan.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nomor_undangan} — {u.hps?.nama_paket}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter Status */}
            <div className="w-full sm:w-56">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
                className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500"
              >
                <option value="">Semua Status Penawaran</option>
                <option value="submitted">Diajukan Rekanan</option>
                <option value="negotiating">Dalam Proses Negosiasi</option>
                <option value="approved">Disetujui (Siap SPK)</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400">
              Total: <strong>{pagination.totalData || 0}</strong> berkas penawaran
            </p>
            {selectedUndanganId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedUndanganId('')
                  setSearchParams({})
                  setPage(1)
                }}
                className="text-gray-500 text-xs"
              >
                Reset Paket
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error?.response?.data?.message || 'Gagal memuat daftar penawaran.'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* ── Table Data ─────────────────────────────────────────────── */}
      <Card>
        <CardBody noPadding>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-navy-700 mb-2" />
              <p className="text-xs font-medium text-gray-500">Memuat berkas penawaran harga...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Paket Pengadaan & Undangan</TableHead>
                  {!isVendor && <TableHead className="w-52">Rekanan Penyedia</TableHead>}
                  <TableHead align="right" className="w-44">Total Penawaran</TableHead>
                  <TableHead align="center" className="w-40">Status</TableHead>
                  <TableHead className="w-40">Waktu Masuk</TableHead>
                  <TableHead align="center" className="w-24">Aksi</TableHead>
                </TableHeader>
                <TableBody>
                  {penawaranList.length === 0 ? (
                    <TableEmpty
                      message={
                        isVendor
                          ? 'Perusahaan Anda belum pernah mengajukan penawaran harga. Buka menu Undangan untuk memilih paket aktif.'
                          : 'Belum ada berkas penawaran harga yang masuk untuk filter ini.'
                      }
                      colSpan={!isVendor ? 7 : 6}
                    />
                  ) : (
                    penawaranList.map((item, idx) => {
                      const hps = item.undanganVendor?.undangan?.hps
                      const vendor = item.undanganVendor?.vendor

                      return (
                        <TableRow key={item.id} isZebra={idx % 2 === 1}>
                          <TableCell align="center" className="text-gray-400 font-mono text-xs">
                            {(page - 1) * limit + idx + 1}
                          </TableCell>

                          <TableCell>
                            <Link
                              to={`/penawaran/${item.id}`}
                              className="font-semibold text-navy-900 hover:text-navy-500 hover:underline line-clamp-1"
                            >
                              {hps?.nama_paket || 'Paket Pengadaan'}
                            </Link>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                              Undangan: {item.undanganVendor?.undangan?.nomor_undangan}
                            </p>
                          </TableCell>

                          {!isVendor && (
                            <TableCell>
                              <div className="flex items-center gap-1.5 font-medium text-navy-900 text-xs">
                                <Building2 className="w-3.5 h-3.5 text-navy-500 shrink-0" />
                                <span className="truncate">{vendor?.company_name || '-'}</span>
                              </div>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                NPWP: {vendor?.npwp || '-'}
                              </p>
                            </TableCell>
                          )}

                          <TableCell align="right" className="font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                            {formatRupiah(item.total_penawaran)}
                          </TableCell>

                          <TableCell align="center">
                            <PenawaranStatusBadge status={item.status} size="sm" />
                          </TableCell>

                          <TableCell className="text-xs text-gray-500">
                            {formatDateTime(item.submitted_at)}
                          </TableCell>

                          <TableCell align="center">
                            <Link to={`/penawaran/${item.id}`} title="Buka Detail & Negosiasi">
                              <Button variant="ghost" size="sm" className="p-1.5 text-navy-500">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>

              {penawaranList.length > 0 && (
                <TablePagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalData={pagination.totalData}
                  limit={pagination.limit}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default PenawaranListPage
