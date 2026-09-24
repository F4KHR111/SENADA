import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePenawaranList } from '../../penawaran/hooks/usePenawaran'
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
import PenawaranStatusBadge from '../../penawaran/components/PenawaranStatusBadge'
import { formatRupiah, formatDateTime } from '../../../utils/formatters'
import {
  Scale,
  Building2,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react'

export function NegosiasiListPage() {
  const { user } = useAuthStore()

  // State filter status
  const [status, setStatus] = useState('negotiating')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const { data, isLoading, isError, error, refetch } = usePenawaranList({
    page,
    limit,
    status: status || undefined,
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
              <Scale className="w-5 h-5 text-blue-300" />
            </span>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              Negosiasi Harga Pengadaan
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isVendor
              ? 'Tinjau usulan harga dari Pejabat Pengadaan (PBJ) dan tentukan persetujuan atau penolakan harga per ronde negosiasi.'
              : 'Tahap 4: Klarifikasi teknis dan tawar-menawar harga antara PBJ dan Penyedia Rekanan (AGENTS.md §4 Tahap 4)'}
          </p>
        </div>
      </div>

      {/* ── Filter Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => {
            setStatus('negotiating')
            setPage(1)
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            status === 'negotiating'
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Sedang Negosiasi Aktif
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus('approved')
            setPage(1)
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            status === 'approved'
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Negosiasi Disetujui (Siap SPK)
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus('')
            setPage(1)
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            status === ''
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Semua Riwayat Penawaran
        </button>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error?.response?.data?.message || 'Gagal memuat data negosiasi.'}</span>
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
              <p className="text-xs font-medium text-gray-500">Memuat sesi negosiasi...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Paket Pengadaan & Undangan</TableHead>
                  {!isVendor && <TableHead className="w-52">Rekanan Penyedia</TableHead>}
                  <TableHead align="right" className="w-40">Tawaran Awal</TableHead>
                  <TableHead align="center" className="w-36">Status</TableHead>
                  <TableHead className="w-40">Waktu Masuk</TableHead>
                  <TableHead align="center" className="w-28">Aksi</TableHead>
                </TableHeader>
                <TableBody>
                  {penawaranList.length === 0 ? (
                    <TableEmpty
                      message={
                        status === 'negotiating'
                          ? 'Tidak ada proses negosiasi yang sedang aktif saat ini.'
                          : 'Belum ada data penawaran untuk kategori filter ini.'
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
                            <Link to={`/penawaran/${item.id}`}>
                              <Button variant="secondary" size="sm" className="px-2.5 py-1 text-xs">
                                Buka Sesi
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

export default NegosiasiListPage
