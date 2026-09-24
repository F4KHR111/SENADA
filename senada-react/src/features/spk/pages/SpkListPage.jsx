import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSpkList, useAvailableNegosiasi } from '../hooks/useSpk'
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
import SpkStatusBadge from '../components/SpkStatusBadge'
import { formatRupiah, formatDate } from '../../../utils/formatters'
import spkService from '../services/spkService'
import {
  FileSignature,
  Building2,
  Calendar,
  Download,
  Eye,
  Plus,
  Search,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckSquare,
} from 'lucide-react'

export function SpkListPage() {
  const { user, hasPermission } = useAuthStore()

  // State filter
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)

  const { data, isLoading, isError, error, refetch } = useSpkList({
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
  })

  const spkList = data?.data || []
  const pagination = data?.pagination || {
    totalData: 0,
    totalPages: 1,
    currentPage: 1,
  }

  const isVendor = user?.roles?.includes('penyedia')
  const isPPK = hasPermission('spk:create') && (user?.roles?.includes('ppk') || user?.roles?.includes('admin'))

  // Ambil data negosiasi yang berstatus 'accepted' dan belum dibuatkan SPK
  const { data: negoData } = useAvailableNegosiasi()
  const availableNegoList = negoData?.data || []
  const hasAcceptedNego = availableNegoList.length > 0

  const handleDownloadPdf = async (id, nomorSpk) => {
    setDownloadingId(id)
    try {
      await spkService.downloadPdf(id, nomorSpk)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunduh dokumen PDF SPK.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-navy-900 text-white rounded-lg inline-flex">
              <FileSignature className="w-5 h-5 text-blue-300" />
            </span>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              {isVendor ? 'SPK Saya (Kontrak Kerja)' : 'Surat Perintah Kerja (SPK) / Surat Pesanan'}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isVendor
              ? 'Daftar Surat Perintah Kerja (SPK) dan Surat Pesanan resmi yang diterbitkan oleh Pejabat Pembuat Komitmen (PPK) untuk perusahaan Anda.'
              : 'Tahap 5: Penerbitan perikatan kontrak kerja dari hasil negosiasi harga yang disetujui (AGENTS.md §4 Tahap 5)'}
          </p>
        </div>

        {/* Tombol 'Buat SPK' HANYA muncul untuk hasil negosiasi berstatus accepted */}
        {isPPK && hasAcceptedNego && (
          <Link to="/spk/create">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Buat SPK ({availableNegoList.length} Siap Terbit)
            </Button>
          </Link>
        )}
      </div>

      {/* Alert jika ada negosiasi yang siap dibuatkan SPK */}
      {isPPK && hasAcceptedNego && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs text-navy-900">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-navy-600 shrink-0" />
            <div>
              <p className="font-bold">
                Terdapat {availableNegoList.length} hasil negosiasi berstatus disetujui (accepted).
              </p>
              <p className="text-gray-600 text-[11px] mt-0.5">
                Silakan terbitkan Surat Perintah Kerja (SPK) / Surat Pesanan resmi untuk memulai pekerjaan penyedia.
              </p>
            </div>
          </div>
          <Link to="/spk/create">
            <Button variant="primary" size="sm">
              Terbitkan Sekarang
            </Button>
          </Link>
        </div>
      )}

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <Input
                placeholder="Cari nomor SPK atau nama penyedia..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
                className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500"
              >
                <option value="">Semua Status SPK</option>
                <option value="draft">Draft PPK</option>
                <option value="signed">Ditandatangani PPK</option>
                <option value="active">Pekerjaan Aktif</option>
                <option value="completed">Kontrak Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error?.response?.data?.message || 'Gagal memuat daftar SPK.'}</span>
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
              <p className="text-xs font-medium text-gray-500">Memuat berkas SPK...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableHead className="w-40">Nomor SPK</TableHead>
                  {!isVendor && <TableHead className="w-52">Penyedia Rekanan</TableHead>}
                  <TableHead align="right" className="w-40">Nilai Kontrak</TableHead>
                  <TableHead className="w-48">Masa Pelaksanaan</TableHead>
                  <TableHead align="center" className="w-36">Status SPK</TableHead>
                  <TableHead align="center" className="w-36">Serah Terima</TableHead>
                  <TableHead align="center" className="w-28">Aksi</TableHead>
                </TableHeader>
                <TableBody>
                  {spkList.length === 0 ? (
                    <TableEmpty
                      message="Belum ada data dokumen SPK yang terbit untuk filter ini."
                      colSpan={!isVendor ? 7 : 6}
                    />
                  ) : (
                    spkList.map((item, idx) => (
                      <TableRow key={item.id} isZebra={idx % 2 === 1}>
                        <TableCell className="font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                          <Link
                            to={`/spk/${item.id}`}
                            className="text-navy-500 hover:text-navy-900 hover:underline"
                          >
                            {item.nomor_spk}
                          </Link>
                          <p className="text-[10px] text-gray-400 font-sans font-normal mt-0.5">
                            Tanggal: {formatDate(item.tanggal_spk)}
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

                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>
                              {formatDate(item.tanggal_mulai)} s.d. {formatDate(item.tanggal_selesai)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell align="center">
                          <SpkStatusBadge status={item.status} size="sm" />
                        </TableCell>

                        <TableCell align="center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                              item.serahTerima?.status === 'completed'
                                ? 'bg-emerald-50 text-success border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.serahTerima?.status === 'completed'
                              ? 'BAST Selesai'
                              : 'Menunggu BAST'}
                          </span>
                        </TableCell>

                        <TableCell align="center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link to={`/spk/${item.id}`} title="Buka Detail SPK">
                              <Button variant="ghost" size="sm" className="p-1.5 text-navy-500">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>

                            <button
                              type="button"
                              disabled={downloadingId === item.id}
                              onClick={() => handleDownloadPdf(item.id, item.nomor_spk)}
                              className="p-1.5 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-md transition-colors"
                              title="Unduh PDF Resmi SPK"
                            >
                              {downloadingId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-navy-700" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                          </div>
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

export default SpkListPage
