import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  useLaporanRekap,
  useRealisasiList,
  useCreateRealisasi,
  useSpmList,
  useCreateSpm,
} from '../hooks/useLaporan'
import { useSpkList } from '../../spk/hooks/useSpk'
import useAuthStore from '../../../store/authStore'
import { Card, CardHeader, CardBody } from '../../../components/Card'
import { Button } from '../../../components/Button'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmpty,
} from '../../../components/Table'
import {
  LaporanRealisasiStatusBadge,
  SpmStatusBadge,
} from '../components/LaporanStatusBadge'
import {
  SpmExportModal,
  InputSpmModal,
  InputRealisasiModal,
} from '../components/SpmModals'
import { formatRupiah, formatDate } from '../../../utils/formatters'
import {
  PieChart,
  DollarSign,
  FileSpreadsheet,
  Building2,
  Calendar,
  FileCheck2,
  Plus,
  Copy,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'

export function LaporanDashboardPage() {
  const { user, hasPermission } = useAuthStore()
  const primaryRole = user?.roles?.[0] || 'petugas_laporan'
  const isPPSPM = user?.roles?.includes('ppspm')
  const isPetugasLaporan = user?.roles?.includes('petugas_laporan') && !user?.roles?.includes('admin')

  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'rekap'
  const initialSpkId = searchParams.get('spk_id') || ''

  // Tabs: 'rekap' | 'realisasi' | 'spm'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Modals state
  const [exportModalSpk, setExportModalSpk] = useState(null)
  const [isInputSpmOpen, setIsInputSpmOpen] = useState(!!initialSpkId && initialTab === 'spm')
  const [selectedSpkIdForSpm, setSelectedSpkIdForSpm] = useState(initialSpkId)
  const [isInputRealisasiOpen, setIsInputRealisasiOpen] = useState(!!initialSpkId && initialTab === 'realisasi')
  const [selectedSpkIdForRealisasi, setSelectedSpkIdForRealisasi] = useState(initialSpkId)

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['rekap', 'realisasi', 'spm'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
    const spkParam = searchParams.get('spk_id')
    if (spkParam) {
      if (tabParam === 'spm') {
        setSelectedSpkIdForSpm(spkParam)
        setIsInputSpmOpen(true)
      } else if (tabParam === 'realisasi') {
        setSelectedSpkIdForRealisasi(spkParam)
        setIsInputRealisasiOpen(true)
      }
    }
  }, [searchParams])

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey)
    setSearchParams({ tab: tabKey })
  }

  const handleOpenSpmModal = (spkId = '') => {
    setSelectedSpkIdForSpm(spkId)
    setIsInputSpmOpen(true)
  }

  const handleOpenRealisasiModal = (spkId = '') => {
    setSelectedSpkIdForRealisasi(spkId)
    setIsInputRealisasiOpen(true)
  }

  // API Queries
  const { data: rekapData, isLoading: isRekapLoading } = useLaporanRekap()
  const { data: spkData, isLoading: isSpkLoading } = useSpkList({ limit: 50 })
  const { data: realisasiData, isLoading: isRealisasiLoading } = useRealisasiList()
  const { data: spmData, isLoading: isSpmLoading } = useSpmList()

  // Mutations
  const createRealisasiMutation = useCreateRealisasi()
  const createSpmMutation = useCreateSpm()

  const rekap = rekapData?.data || {
    rekap_kontrak: { total_spk: 0, total_nilai_kontrak: 0 },
    rekap_realisasi: { total_realisasi_submitted: 0, persentase_realisasi: 0 },
    rekap_spm_sakti: { processed: 0, pending: 0 },
  }

  const spkList = spkData?.data || []
  const realisasiList = realisasiData?.data || []
  const spmList = spmData?.data || []

  // Permissions
  const canInputRealisasi = hasPermission('laporan:create')
  const canInputSpm = hasPermission('spm:create')

  // Handlers
  const handleCreateRealisasi = async (payload) => {
    try {
      await createRealisasiMutation.mutateAsync(payload)
      setIsInputRealisasiOpen(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan laporan realisasi.')
    }
  }

  const handleCreateSpm = async (payload) => {
    try {
      await createSpmMutation.mutateAsync(payload)
      setIsInputSpmOpen(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mencatat nomor SPM dari SAKTI.')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-navy-900 text-white rounded-lg inline-flex">
              <PieChart className="w-5 h-5 text-blue-300" />
            </span>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              {isPetugasLaporan
                ? 'Laporan Realisasi Anggaran Pengadaan'
                : isPPSPM
                ? 'Resume SPK & Integrasi SPM SAKTI'
                : 'Pelaporan Keuangan & Referensi SPM SAKTI'}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isPetugasLaporan
              ? 'Tahap 7: Monitoring Resume SPK dan penginputan realisasi anggaran pengadaan instansi (AGENTS.md §4 Tahap 7)'
              : isPPSPM
              ? 'Tahap 7: Monitoring Resume SPK dan integrasi pencatatan nomor SPM aplikasi SAKTI (AGENTS.md §4 Tahap 7)'
              : 'Rekapitulasi Resume SPK, integrasi data pembayaran ke aplikasi SAKTI Kemenkeu, dan pelaporan realisasi keuangan instansi'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {canInputRealisasi && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsInputRealisasiOpen(true)}
            >
              Input Realisasi
            </Button>
          )}

          {canInputSpm && !isPetugasLaporan && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsInputSpmOpen(true)}
            >
              Catat SPM SAKTI
            </Button>
          )}
        </div>
      </div>

      {/* ── KPI Summary Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Kontrak */}
        <Card>
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Total Komitmen Kontrak (SPK)
              </span>
              <p className="text-lg font-bold font-mono text-navy-900">
                {formatRupiah(rekap.rekap_kontrak.total_nilai_kontrak)}
              </p>
              <p className="text-[11px] text-gray-500">
                Dari {rekap.rekap_kontrak.total_spk} paket kontrak diterbitkan
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-navy-900/5 text-navy-900 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>

        {/* Card 2: Total Realisasi */}
        <Card>
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Realisasi Anggaran Internal
              </span>
              <p className="text-lg font-bold font-mono text-emerald-800">
                {formatRupiah(rekap.rekap_realisasi.total_realisasi_submitted)}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-success font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{rekap.rekap_realisasi.persentase_realisasi}% dari total pagu</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-success flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>

        {/* Card 3: SPM SAKTI (untuk PPSPM/Admin) atau SPK Selesai (untuk Petugas Laporan) */}
        <Card>
          <CardBody className="p-5 flex items-center justify-between">
            {isPetugasLaporan ? (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Berkas Realisasi
                </span>
                <p className="text-lg font-bold font-mono text-navy-900">
                  {realisasiList.length}{' '}
                  <span className="text-xs font-normal text-gray-500">Laporan</span>
                </p>
                <p className="text-[11px] text-blue-600 font-medium">
                  {realisasiList.filter((r) => r.status === 'submitted').length} tersubmit • {realisasiList.filter((r) => r.status === 'draft').length} draf
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Status SPM pada SAKTI
                </span>
                <p className="text-lg font-bold text-navy-900">
                  {rekap.rekap_spm_sakti.processed}{' '}
                  <span className="text-xs font-normal text-gray-500">SPM Terbit</span>
                </p>
                <p className="text-[11px] text-amber-700 font-medium">
                  {rekap.rekap_spm_sakti.pending} SPM menunggu proses
                </p>
              </div>
            )}
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-navy-500 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────── */}
      <div className="border-b border-gray-200 flex items-center gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleTabChange('rekap')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'rekap'
              ? 'text-navy-900 border-b-2 border-navy-900 font-bold'
              : 'text-gray-500 hover:text-navy-900'
          }`}
        >
          Resume SPK (View-Only)
        </button>

        {/* Tab Laporan Realisasi: Tampil untuk Petugas Laporan & Admin (disembunyikan untuk PPSPM murni) */}
        {!isPPSPM && (
          <button
            type="button"
            onClick={() => handleTabChange('realisasi')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'realisasi'
                ? 'text-navy-900 border-b-2 border-navy-900 font-bold'
                : 'text-gray-500 hover:text-navy-900'
            }`}
          >
            Laporan Realisasi ({realisasiList.length})
          </button>
        )}

        {/* Tab SPM Reference: Tampil untuk PPSPM & Admin (disembunyikan untuk Petugas Laporan) */}
        {!isPetugasLaporan && (
          <button
            type="button"
            onClick={() => handleTabChange('spm')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'spm'
                ? 'text-navy-900 border-b-2 border-navy-900 font-bold'
                : 'text-gray-500 hover:text-navy-900'
            }`}
          >
            Pencatatan Nomor SPM SAKTI ({spmList.length})
          </button>
        )}
      </div>

      {/* ── Tab Content 1: Resume SPK (View-Only) ───────────────────── */}
      {activeTab === 'rekap' && (
        <Card>
          <CardHeader
            title="Resume SPK (View-Only)"
            subtitle="Ringkasan kontrak kerja untuk referensi penginputan SPM di aplikasi SAKTI (tanpa opsi edit/hapus dokumen)"
          />
          <CardBody noPadding>
            {isSpkLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-navy-700 mb-2" />
                <p className="text-xs">Memuat data Resume SPK...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableHead className="w-48">Nomor SPK</TableHead>
                  <TableHead>Penyedia / Rekanan</TableHead>
                  <TableHead align="right" className="w-44">Nilai Kontrak</TableHead>
                  <TableHead className="w-36">Tanggal SPK</TableHead>
                  <TableHead align="center" className="w-36">Status BAST</TableHead>
                  <TableHead align="center" className="w-40">
                    {isPetugasLaporan ? 'Aksi Pelaporan' : 'Integrasi SAKTI'}
                  </TableHead>
                </TableHeader>
                <TableBody>
                  {spkList.length === 0 ? (
                    <TableEmpty
                      message="Belum ada data kontrak SPK yang terbit."
                      colSpan={6}
                    />
                  ) : (
                    spkList.map((item, idx) => (
                      <TableRow key={item.id} isZebra={idx % 2 === 1}>
                        <TableCell className="font-mono text-xs font-bold text-navy-900">
                          <Link
                            to={`/serah-terima/${item.id}`}
                            className="hover:text-navy-500 hover:underline"
                            title="Buka Lembar Resume SPK"
                          >
                            {item.nomor_spk}
                          </Link>
                          <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                            Status Kontrak: <span className="font-semibold text-navy-700 capitalize">{item.status}</span>
                          </p>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 font-semibold text-navy-900 text-xs">
                            <Building2 className="w-3.5 h-3.5 text-navy-500 shrink-0" />
                            <span>{item.vendor?.company_name || '-'}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            NPWP: {item.vendor?.npwp || '-'}
                          </p>
                        </TableCell>

                        <TableCell align="right" className="font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                          {formatRupiah(item.nilai_kontrak)}
                        </TableCell>

                        <TableCell className="text-xs text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{formatDate(item.tanggal_spk)}</span>
                          </div>
                          {item.tanggal_selesai && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Selesai: {formatDate(item.tanggal_selesai)}
                            </p>
                          )}
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
                            {isPetugasLaporan ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="px-2.5 py-1 text-xs"
                                leftIcon={<Plus className="w-3.5 h-3.5 text-navy-500" />}
                                onClick={() => handleOpenRealisasiModal(item.id)}
                                title="Catat Realisasi Anggaran"
                              >
                                Lapor Realisasi
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="px-2.5 py-1 text-xs"
                                leftIcon={<Copy className="w-3.5 h-3.5 text-navy-500" />}
                                onClick={() => setExportModalSpk(item)}
                                title="Salin Parameter SAKTI"
                              >
                                Data SAKTI
                              </Button>
                            )}

                            <Link to={`/serah-terima/${item.id}`} title="Buka Resume SPK Lengkap">
                              <Button variant="ghost" size="sm" className="p-1.5 text-navy-500">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      )}

      {/* ── Tab Content 2: Laporan Realisasi Keuangan ────────────────── */}
      {activeTab === 'realisasi' && (
        <Card>
          <CardHeader
            title="Daftar Realisasi Anggaran Pengadaan"
            subtitle="Dicatat oleh Petugas Laporan Realisasi berdasarkan dokumen pertanggungjawaban fisik dan BAST"
            action={
              canInputRealisasi && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsInputRealisasiOpen(true)}
                >
                  Tambah Realisasi
                </Button>
              )
            }
          />
          <CardBody noPadding>
            {isRealisasiLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-navy-700 mb-2" />
                <p className="text-xs">Memuat data realisasi...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableHead className="w-36">Nomor SPK</TableHead>
                  <TableHead>Penyedia</TableHead>
                  <TableHead align="right" className="w-36">Nilai Kontrak</TableHead>
                  <TableHead align="right" className="w-40">Nilai Realisasi</TableHead>
                  <TableHead className="w-28">Tgl Realisasi</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead align="center" className="w-32">Status</TableHead>
                </TableHeader>
                <TableBody>
                  {realisasiList.length === 0 ? (
                    <TableEmpty
                      message="Belum ada data realisasi keuangan yang diinput."
                      colSpan={7}
                    />
                  ) : (
                    realisasiList.map((item, idx) => (
                      <TableRow key={item.id} isZebra={idx % 2 === 1}>
                        <TableCell className="font-mono text-xs font-bold text-navy-900">
                          {item.spk?.nomor_spk}
                        </TableCell>

                        <TableCell className="text-xs font-semibold text-navy-900">
                          {item.spk?.vendor?.company_name || '-'}
                        </TableCell>

                        <TableCell align="right" className="font-mono text-xs text-gray-500 whitespace-nowrap">
                          {formatRupiah(item.spk?.nilai_kontrak)}
                        </TableCell>

                        <TableCell align="right" className="font-mono text-xs font-bold text-emerald-800 whitespace-nowrap">
                          {formatRupiah(item.nilai_realisasi)}
                        </TableCell>

                        <TableCell className="text-xs text-gray-600">
                          {formatDate(item.tanggal_realisasi)}
                        </TableCell>

                        <TableCell className="text-xs text-gray-600 max-w-xs truncate">
                          {item.keterangan || '-'}
                        </TableCell>

                        <TableCell align="center">
                          <LaporanRealisasiStatusBadge status={item.status} size="sm" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      )}

      {/* ── Tab Content 3: Referensi SPM SAKTI ───────────────────────── */}
      {activeTab === 'spm' && (
        <Card>
          <CardHeader
            title="Daftar Referensi Nomor SPM (Aplikasi SAKTI)"
            subtitle="Dicatat oleh PPSPM setelah menerbitkan Surat Perintah Membayar (SPM) pada aplikasi SAKTI Kemenkeu"
            action={
              canInputSpm && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsInputSpmOpen(true)}
                >
                  Catat Nomor SPM
                </Button>
              )
            }
          />
          <CardBody noPadding>
            {isSpmLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-navy-700 mb-2" />
                <p className="text-xs">Memuat data referensi SPM...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableHead className="w-48">Nomor SPM SAKTI</TableHead>
                  <TableHead className="w-36">Nomor Kontrak SPK</TableHead>
                  <TableHead>Penerima & Rekening Bank</TableHead>
                  <TableHead align="right" className="w-36">Nilai SPM</TableHead>
                  <TableHead className="w-28">Tgl Terbit</TableHead>
                  <TableHead align="center" className="w-36">Status</TableHead>
                </TableHeader>
                <TableBody>
                  {spmList.length === 0 ? (
                    <TableEmpty
                      message="Belum ada nomor SPM yang dicatat dari aplikasi SAKTI."
                      colSpan={6}
                    />
                  ) : (
                    spmList.map((item, idx) => (
                      <TableRow key={item.id} isZebra={idx % 2 === 1}>
                        <TableCell className="font-mono text-xs font-bold text-navy-900">
                          {item.nomor_spm}
                        </TableCell>

                        <TableCell className="font-mono text-xs text-navy-500">
                          {item.spk?.nomor_spk}
                        </TableCell>

                        <TableCell className="text-xs">
                          <p className="font-semibold text-navy-900">
                            {item.spk?.vendor?.company_name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {item.spk?.vendor?.bank_name} • {item.spk?.vendor?.bank_account_number}
                          </p>
                        </TableCell>

                        <TableCell align="right" className="font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                          {formatRupiah(item.spk?.nilai_kontrak)}
                        </TableCell>

                        <TableCell className="text-xs text-gray-600">
                          {formatDate(item.tanggal_spm)}
                        </TableCell>

                        <TableCell align="center">
                          <SpmStatusBadge status={item.status} size="sm" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      )}

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {exportModalSpk && (
        <SpmExportModal
          isOpen={!!exportModalSpk}
          spk={exportModalSpk}
          onClose={() => setExportModalSpk(null)}
        />
      )}

      {isInputSpmOpen && (
        <InputSpmModal
          isOpen={isInputSpmOpen}
          spkList={spkList}
          initialSpkId={selectedSpkIdForSpm}
          isSubmitting={createSpmMutation.isPending}
          onClose={() => {
            setIsInputSpmOpen(false)
            setSelectedSpkIdForSpm('')
          }}
          onSubmit={handleCreateSpm}
        />
      )}

      {isInputRealisasiOpen && (
        <InputRealisasiModal
          isOpen={isInputRealisasiOpen}
          spkList={spkList}
          initialSpkId={selectedSpkIdForRealisasi}
          isSubmitting={createRealisasiMutation.isPending}
          onClose={() => {
            setIsInputRealisasiOpen(false)
            setSelectedSpkIdForRealisasi('')
          }}
          onSubmit={handleCreateRealisasi}
        />
      )}
    </div>
  )
}

export default LaporanDashboardPage
