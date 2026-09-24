import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useHpsList, useDeleteHps } from '../hooks/useHps'
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
import HpsStatusBadge from '../components/HpsStatusBadge'
import { formatRupiah, formatDate } from '../../../utils/formatters'
import {
  Plus,
  Search,
  FileSpreadsheet,
  Trash2,
  Eye,
  RotateCcw,
  Loader2,
  AlertCircle,
  Edit2,
  Lock,
  CheckCircle2,
} from 'lucide-react'

export function HpsListPage() {
  const navigate = useNavigate()
  const { user, hasPermission } = useAuthStore()

  // State filter & pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [fiscalYear, setFiscalYear] = useState('')

  // Query API
  const { data, isLoading, isError, error, refetch } = useHpsList({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    fiscal_year: fiscalYear || undefined,
  })

  const deleteMutation = useDeleteHps()
  const [deletingId, setDeletingId] = useState(null)

  // Backend HpsController.getAll sends: { success: true, data: result.rows, pagination: result.pagination }
  const hpsList = Array.isArray(data?.data)
    ? data.data
    : (data?.data?.rows || [])

  const pagination = data?.pagination || data?.data?.pagination || {
    totalData: 0,
    totalPages: 1,
    currentPage: 1,
  }

  const handleDelete = async (id, nomorHps) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus draf HPS '${nomorHps}'?`)) {
      setDeletingId(id)
      try {
        await deleteMutation.mutateAsync(id)
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus paket HPS.')
      } finally {
        setDeletingId(null)
      }
    }
  }

  const handleResetFilter = () => {
    setSearch('')
    setStatus('')
    setFiscalYear('')
    setPage(1)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-navy-900 text-white rounded-lg inline-flex">
              <FileSpreadsheet className="w-5 h-5 text-blue-300" />
            </span>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              {user?.roles?.includes('pbj') ? 'Verifikasi Paket HPS' : 'HPS (Harga Perkiraan Sendiri)'}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {user?.roles?.includes('pbj')
              ? 'Pemeriksaan rincian barang, volume, dan penetapan status fixed sebelum diterbitkan undangan (AGENTS.md §4 Tahap 1).'
              : 'Tahap 1: Penyusunan paket pengadaan oleh PPK dan verifikasi oleh PBJ (AGENTS.md §4).'}
          </p>
        </div>

        {/* Tombol Buat HPS baru — Hanya untuk PPK atau Admin */}
        {hasPermission('hps:create') && (
          <Link to="/hps/create">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Buat Paket HPS Baru
            </Button>
          </Link>
        )}
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="md:col-span-2">
              <Input
                placeholder="Cari nomor HPS atau nama paket pengadaan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Filter Status */}
            <div>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
                className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/15"
              >
                <option value="">Semua Status</option>
                <option value="draft">Draft PPK</option>
                <option value="verified">Diverifikasi PBJ</option>
                <option value="fixed">Fixed (Terkunci)</option>
              </select>
            </div>

            {/* Filter Tahun Anggaran & Reset */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Tahun (mis. 2026)"
                value={fiscalYear}
                onChange={(e) => {
                  setFiscalYear(e.target.value)
                  setPage(1)
                }}
                className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/15"
              />

              {(search || status || fiscalYear) && (
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

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>
              {error?.response?.data?.message || 'Gagal memuat daftar HPS dari server.'}
            </span>
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
              <p className="text-xs font-medium text-gray-500">Memuat data paket HPS...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableHead className="w-36">Nomor HPS</TableHead>
                  <TableHead>Nama Paket Pengadaan</TableHead>
                  <TableHead className="w-24 text-center">Tahun</TableHead>
                  <TableHead align="right" className="w-40">Total HPS</TableHead>
                  <TableHead align="center" className="w-32">Status</TableHead>
                  <TableHead className="w-44">PPK Pembuat</TableHead>
                  <TableHead align="center" className="w-28">Aksi</TableHead>
                </TableHeader>
                <TableBody>
                  {hpsList.length === 0 ? (
                    <TableEmpty
                      message={
                        search || status || fiscalYear
                          ? 'Tidak ada paket HPS yang cocok dengan kriteria pencarian.'
                          : 'Belum ada paket HPS yang dibuat. Klik tombol "Buat Paket HPS Baru" untuk memulai.'
                      }
                      colSpan={7}
                    />
                  ) : (
                    hpsList.map((item, idx) => {
                      const canDelete =
                        item.status === 'draft' &&
                        hasPermission('hps:delete') &&
                        (user?.roles?.includes('admin') || item.ppk_id === user?.id)

                      return (
                        <TableRow key={item.id} isZebra={idx % 2 === 1}>
                          <TableCell className="font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                            <Link
                              to={`/hps/${item.id}`}
                              className="text-navy-500 hover:text-navy-900 hover:underline"
                            >
                              {item.nomor_hps}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-navy-900 line-clamp-1">
                              {item.nama_paket}
                            </p>
                            {item.deskripsi && (
                              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                {item.deskripsi}
                              </p>
                            )}
                          </TableCell>
                          <TableCell align="center" className="text-xs text-gray-600 font-mono">
                            {item.fiscal_year}
                          </TableCell>
                          <TableCell align="right" className="font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                            {formatRupiah(item.total_harga)}
                          </TableCell>
                          <TableCell align="center">
                            <HpsStatusBadge status={item.status} size="sm" />
                          </TableCell>
                          <TableCell className="text-xs text-gray-600">
                            <p className="font-medium text-navy-900 truncate">
                              {item.ppk?.name || '-'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono truncate">
                              {item.ppk?.employee_id || item.ppk?.email}
                            </p>
                          </TableCell>
                          <TableCell align="center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Tombol Verifikasi HPS (Khusus PBJ saat status draft) */}
                              {item.status === 'draft' &&
                                (user?.roles?.includes('pbj') || user?.roles?.includes('admin')) &&
                                hasPermission('hps:verify') && (
                                  <Link to={`/hps/${item.id}`} title="Verifikasi & Kunci HPS (PBJ)">
                                    <button
                                      type="button"
                                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors font-medium text-xs flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    </button>
                                  </Link>
                                )}

                              {/* Tombol Detail (Read-only view) */}
                              <Link to={`/hps/${item.id}`} title="Lihat Detail HPS (Read-Only)">
                                <Button variant="ghost" size="sm" className="p-1.5 text-navy-500">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>

                              {/* Tombol Edit Draf (HANYA jika status masih draft) */}
                              {item.status === 'draft' &&
                                hasPermission('hps:update') &&
                                (user?.roles?.includes('admin') || item.ppk_id === user?.id) && (
                                  <Link to={`/hps/${item.id}/edit`} title="Edit Draf HPS">
                                    <button
                                      type="button"
                                      className="p-1.5 text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-md transition-colors"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  </Link>
                                )}

                              {/* Tombol Hapus (Hanya draft) */}
                              {canDelete && (
                                <button
                                  type="button"
                                  disabled={deletingId === item.id}
                                  onClick={() => handleDelete(item.id, item.nomor_hps)}
                                  className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-md transition-colors"
                                  title="Hapus Draft HPS"
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

              {/* Pagination */}
              {hpsList.length > 0 && (
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

export default HpsListPage
