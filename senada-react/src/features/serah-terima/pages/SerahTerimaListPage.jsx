import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSpkList } from '../../spk/hooks/useSpk'
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
import SerahTerimaStatusBadge from '../components/SerahTerimaStatusBadge'
import { formatRupiah, formatDate } from '../../../utils/formatters'
import {
  CheckSquare,
  Building2,
  Calendar,
  Eye,
  Search,
  Loader2,
  AlertCircle,
  ArrowRight,
  FileCheck2,
} from 'lucide-react'

export function SerahTerimaListPage() {
  const { user } = useAuthStore()

  // State
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')

  // Ambil SPK yang sudah ditandatangani / aktif / selesai
  const { data, isLoading, isError, error, refetch } = useSpkList({
    page,
    limit,
    search: search || undefined,
  })

  const spkList = data?.data || []
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
              <CheckSquare className="w-5 h-5 text-blue-300" />
            </span>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              {isVendor ? 'Pengiriman & Surat Jalan' : 'Serah Terima Pekerjaan & Berita Acara (BAST)'}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isVendor
              ? 'Kelola pengiriman barang/jasa, unggah dokumen surat jalan atau izin mulai kerja, dan pantau penyelesaian Berita Acara Serah Terima (BAST).'
              : 'Tahap 6: Unggah surat jalan/pengiriman barang, penerbitan BAST oleh PPK, dan penyusunan Resume SPK (AGENTS.md §4 Tahap 6)'}
          </p>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <Card>
        <CardBody className="p-4">
          <Input
            placeholder="Cari nomor SPK atau nama penyedia rekanan..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </CardBody>
      </Card>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error?.response?.data?.message || 'Gagal memuat daftar serah terima.'}</span>
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
              <p className="text-xs font-medium text-gray-500">Memuat data serah terima...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Nomor Dokumen SPK</TableHead>
                  {!isVendor && <TableHead className="w-52">Penyedia Rekanan</TableHead>}
                  <TableHead align="right" className="w-40">Nilai Kontrak</TableHead>
                  <TableHead className="w-44">Target Selesai</TableHead>
                  <TableHead align="center" className="w-44">Status BAST</TableHead>
                  <TableHead align="center" className="w-32">Aksi</TableHead>
                </TableHeader>
                <TableBody>
                  {spkList.length === 0 ? (
                    <TableEmpty
                      message="Belum ada kontrak SPK yang terbit untuk proses serah terima."
                      colSpan={!isVendor ? 7 : 6}
                    />
                  ) : (
                    spkList.map((item, idx) => (
                      <TableRow key={item.id} isZebra={idx % 2 === 1}>
                        <TableCell align="center" className="text-gray-400 font-mono text-xs">
                          {(page - 1) * limit + idx + 1}
                        </TableCell>

                        <TableCell>
                          <Link
                            to={`/serah-terima/${item.id}`}
                            className="font-bold text-navy-900 hover:text-navy-500 hover:underline font-mono text-xs"
                          >
                            {item.nomor_spk}
                          </Link>
                          <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                            Kontrak terbit: {formatDate(item.tanggal_spk)}
                          </p>
                        </TableCell>

                        {!isVendor && (
                          <TableCell>
                            <div className="flex items-center gap-1.5 font-semibold text-navy-900 text-xs">
                              <Building2 className="w-3.5 h-3.5 text-navy-500 shrink-0" />
                              <span className="truncate">{item.vendor?.company_name || '-'}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                              NPWP: {item.vendor?.npwp || '-'}
                            </p>
                          </TableCell>
                        )}

                        <TableCell align="right" className="font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                          {formatRupiah(item.nilai_kontrak)}
                        </TableCell>

                        <TableCell className="text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{formatDate(item.tanggal_selesai)}</span>
                          </div>
                        </TableCell>

                        <TableCell align="center">
                          <SerahTerimaStatusBadge
                            status={item.serahTerima?.status || 'pending'}
                            size="sm"
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Link to={`/serah-terima/${item.id}`}>
                            <Button variant="secondary" size="sm" className="px-3 py-1 text-xs">
                              {isVendor ? 'Unggah Surat Jalan' : 'Proses BAST'}
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {spkList.length > 0 && (
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

export default SerahTerimaListPage
