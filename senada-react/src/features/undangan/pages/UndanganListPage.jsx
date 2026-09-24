import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUndanganList, useDeleteUndangan } from '../hooks/useUndangan'
import useAuthStore from '../../../store/authStore'
import { Card, CardBody } from '../../../components/Card'
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
import UndanganStatusBadge from '../components/UndanganStatusBadge'
import { formatRupiah, formatDateTime, formatDate } from '../../../utils/formatters'
import {
  Plus,
  Search,
  Mail,
  Trash2,
  Eye,
  Send,
  RotateCcw,
  Loader2,
  AlertCircle,
  Clock,
  Building2,
} from 'lucide-react'

export function UndanganListPage() {
  const { user, hasPermission } = useAuthStore()

  // Filter & pagination state
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  // Query list
  const { data, isLoading, isError, error, refetch } = useUndanganList({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
  })

  const deleteMutation = useDeleteUndangan()
  const [deletingId, setDeletingId] = useState(null)

  const undanganList = data?.data || []
  const pagination = data?.pagination || {
    totalData: 0,
    totalPages: 1,
    currentPage: 1,
  }

  const handleDelete = async (id, nomorUndangan) => {
    if (window.confirm(`Hapus draf undangan '${nomorUndangan}'?`)) {
      setDeletingId(id)
      try {
        await deleteMutation.mutateAsync(id)
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus draf undangan.')
      } finally {
        setDeletingId(null)
      }
    }
  }

  const handleResetFilter = () => {
    setSearch('')
    setStatus('')
    setPage(1)
  }

  const isVendor = user?.roles?.includes('penyedia')

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-navy-900 text-white rounded-lg inline-flex">
              <Mail className="w-5 h-5 text-blue-300" />
            </span>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              {isVendor ? 'Undangan Pengadaan Masuk' : 'Undangan Pengadaan Penyedia'}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isVendor
              ? 'Daftar undangan pengadaan barang/jasa yang ditujukan kepada perusahaan Anda. Silakan pelajari rincian kebutuhan dan ajukan penawaran harga.'
              : 'Tahap 2: Menerbitkan undangan ke rekanan dari HPS terverifikasi (AGENTS.md §4 Tahap 2)'}
          </p>
        </div>

        {/* Tombol Buat Undangan (Khusus PBJ & Admin) */}
        {hasPermission('undangan:create') && (
          <Link to="/undangan/create">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Buat Undangan Baru
            </Button>
          </Link>
        )}
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <Input
                placeholder="Cari nomor undangan atau nama paket pengadaan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
                className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500"
              >
                <option value="">Semua Status</option>
                {!isVendor && <option value="draft">Draft PBJ</option>}
                <option value="sent">Penawaran Dibuka</option>
                <option value="closed">Penawaran Ditutup</option>
              </select>

              {(search || status) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilter}
                  title="Reset filter pencarian"
                >
                  <RotateCcw className="w-4 h-4 text-gray-500" />
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Error State ────────────────────────────────────────────── */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error?.response?.data?.message || 'Gagal memuat daftar undangan.'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* ── Data Table ─────────────────────────────────────────────── */}
      <Card>
        <CardBody noPadding>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-navy-700 mb-2" />
              <p className="text-xs font-medium text-gray-500">Memuat data paket undangan...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableHead className="w-36">Nomor Undangan</TableHead>
                  <TableHead>Paket Pengadaan</TableHead>
                  {!isVendor && <TableHead align="right" className="w-36">Total HPS</TableHead>}
                  <TableHead className="w-44">Batas Akhir Penawaran</TableHead>
                  {!isVendor && <TableHead align="center" className="w-32">Rekanan</TableHead>}
                  <TableHead align="center" className="w-36">Status</TableHead>
                  <TableHead align="center" className="w-32">Aksi</TableHead>
                </TableHeader>
                <TableBody>
                  {undanganList.length === 0 ? (
                    <TableEmpty
                      message={
                        isVendor
                          ? 'Belum ada undangan pengadaan yang ditujukan untuk perusahaan Anda.'
                          : 'Belum ada paket undangan pengadaan. Klik "Buat Undangan Baru" untuk memulai.'
                      }
                      colSpan={!isVendor ? 7 : 5}
                    />
                  ) : (
                    undanganList.map((item, idx) => {
                      const isExpired =
                        item.batas_waktu_penawaran &&
                        new Date() > new Date(item.batas_waktu_penawaran)

                      const canDelete =
                        item.status === 'draft' &&
                        hasPermission('undangan:delete') &&
                        (user?.roles?.includes('admin') || item.pbj_id === user?.id)

                      return (
                        <TableRow key={item.id} isZebra={idx % 2 === 1}>
                          <TableCell className="font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                            <Link
                              to={`/undangan/${item.id}`}
                              className="text-navy-500 hover:text-navy-900 hover:underline"
                            >
                              {item.nomor_undangan}
                            </Link>
                          </TableCell>

                          <TableCell>
                            <p className="font-semibold text-navy-900 line-clamp-1">
                              {item.hps?.nama_paket || '-'}
                            </p>
                            {!isVendor && item.hps?.nomor_hps && (
                              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                                {item.hps?.nomor_hps}
                              </p>
                            )}
                          </TableCell>

                          {!isVendor && (
                            <TableCell align="right" className="font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                              {formatRupiah(item.hps?.total_harga)}
                            </TableCell>
                          )}

                          <TableCell className="text-xs">
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{formatDate(item.batas_waktu_penawaran)}</span>
                            </div>
                            <p className={`text-[10px] mt-0.5 font-medium ${isExpired ? 'text-red-500' : 'text-gray-400'}`}>
                              {isExpired ? 'Batas waktu berakhir' : formatDateTime(item.batas_waktu_penawaran)}
                            </p>
                          </TableCell>

                          {!isVendor && (
                            <TableCell align="center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                <Building2 className="w-3 h-3 text-gray-500" />
                                <span>{item.undanganVendors?.length || 0} Vendor</span>
                              </span>
                            </TableCell>
                          )}

                          <TableCell align="center">
                            <UndanganStatusBadge status={item.status} size="sm" />
                          </TableCell>

                          <TableCell align="center">
                            <div className="flex items-center justify-center gap-1.5">
                              {isVendor && item.status === 'sent' && !isExpired ? (
                                <Link
                                  to={`/penawaran/create?undangan_id=${item.id}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-700 transition-colors shadow-xs"
                                  title="Ajukan Penawaran"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Tawar</span>
                                </Link>
                              ) : null}

                              <Link to={`/undangan/${item.id}`} title="Lihat Detail Undangan">
                                <Button variant="ghost" size="sm" className="p-1.5 text-navy-500">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>

                              {canDelete && (
                                <button
                                  type="button"
                                  disabled={deletingId === item.id}
                                  onClick={() => handleDelete(item.id, item.nomor_undangan)}
                                  className="p-1.5 text-gray-400 hover:text-danger rounded-md hover:bg-red-50 transition-colors"
                                  title="Hapus Draft Undangan"
                                >
                                  {deletingId === item.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-danger" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>

              {undanganList.length > 0 && (
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

export default UndanganListPage
