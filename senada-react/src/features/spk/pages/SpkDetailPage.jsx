import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSpkDetail, useSignSpk } from '../hooks/useSpk'
import useAuthStore from '../../../store/authStore'
import { Card, CardHeader, CardBody } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../../../components/Table'
import SpkStatusBadge from '../components/SpkStatusBadge'
import SpkPrintDoc from '../components/SpkPrintDoc'
import { useSpkEvaluation } from '../../penilaian/hooks/usePenilaian'
import VendorEvaluationModal from '../../penilaian/components/VendorEvaluationModal'
import VendorEvaluationCard from '../../penilaian/components/VendorEvaluationCard'
import {
  formatRupiah,
  formatDate,
  formatDateTime,
  formatFileSize,
} from '../../../utils/formatters'
import spkService from '../services/spkService'
import {
  ArrowLeft,
  FileSignature,
  Printer,
  Download,
  Building2,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  CheckSquare,
  ArrowRight,
  Star,
  Award,
} from 'lucide-react'

export function SpkDetailPage() {
  const { id } = useParams()
  const { user, hasPermission } = useAuthStore()

  const { data, isLoading, isError, error, refetch } = useSpkDetail(id)
  const spk = data?.data

  const { data: evalData, refetch: refetchEval } = useSpkEvaluation(id)
  const evaluation = evalData?.data

  const signMutation = useSignSpk()

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 max-w-5xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-navy-700 mb-2" />
        <p className="text-xs font-medium">Memuat rincian kontrak SPK...</p>
      </div>
    )
  }

  if (isError || !spk) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-danger mx-auto" />
          <h2 className="text-base font-bold text-red-900">Gagal Memuat SPK</h2>
          <p className="text-xs text-red-700">
            {error?.response?.data?.message || 'Data SPK tidak ditemukan atau Anda tidak memiliki hak akses.'}
          </p>
          <div className="pt-2">
            <Link to="/spk">
              <Button variant="secondary" size="sm">
                Kembali ke Daftar SPK
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isPPK =
    hasPermission('spk:sign') &&
    (user?.roles?.includes('admin') || spk.ppk_id === user?.id)

  const items = spk.negosiasi?.penawaran?.items || []
  const hps = spk.negosiasi?.penawaran?.undanganVendor?.undangan?.hps
  const vendor = spk.vendor
  const ppk = spk.ppk

  const handleSign = async () => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menandatangani secara resmi dokumen SPK '${spk.nomor_spk}'?`
      )
    ) {
      try {
        await signMutation.mutateAsync(spk.id)
        refetch()
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menandatangani SPK.')
      }
    }
  }

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true)
    try {
      await spkService.downloadPdf(spk.id, spk.nomor_spk)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunduh file PDF SPK.')
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* ── Breadcrumb & Action Bar ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/spk"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar SPK</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tombol TTE PPK */}
          {isPPK && spk.status === 'draft' && (
            <Button
              variant="primary"
              size="sm"
              isLoading={signMutation.isPending}
              leftIcon={<FileSignature className="w-4 h-4 text-emerald-300" />}
              onClick={handleSign}
            >
              Tanda Tangani SPK (TTE PPK)
            </Button>
          )}

          {/* Unduh PDF Resmi */}
          <Button
            variant="secondary"
            size="sm"
            isLoading={isDownloadingPdf}
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleDownloadPdf}
          >
            Unduh PDF Resmi
          </Button>

          {/* Cetak / Print View */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => setIsPrintModalOpen(true)}
          >
            Pratinjau Cetak
          </Button>

          {/* Link ke Serah Terima */}
          <Link to={`/serah-terima/${spk.id}`}>
            <Button
              variant="navy"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Serah Terima (Tahap 6)
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Card 1: Informasi Pokok Kontrak SPK ──────────────────────── */}
      <Card>
        <CardBody className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-navy-900/5 text-navy-900 rounded-md border border-navy-900/15">
                  {spk.nomor_spk}
                </span>
                <SpkStatusBadge status={spk.status} />
                <Badge variant="navy" size="sm">
                  Tahun Anggaran {hps?.fiscal_year || '2026'}
                </Badge>
              </div>

              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
                {hps?.nama_paket || 'Paket Kontrak Pengadaan'}
              </h1>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Building2 className="w-4 h-4 text-navy-500 shrink-0" />
                <span className="font-semibold text-navy-900">{vendor?.company_name}</span>
                <span>• NPWP: {vendor?.npwp}</span>
              </div>
            </div>

            {/* Nilai Kontrak Box */}
            <div className="p-4 bg-navy-900 text-white rounded-xl text-right shrink-0 shadow-sm border border-navy-700 min-w-[240px]">
              <p className="text-[11px] font-medium text-gray-300 uppercase tracking-wider">
                Total Nilai Kontrak SPK
              </p>
              <p className="text-xl font-bold font-mono text-white mt-0.5">
                {formatRupiah(spk.nilai_kontrak)}
              </p>
              <p className="text-[10px] text-gray-300 mt-1">
                Termasuk seluruh kewajiban perpajakan
              </p>
            </div>
          </div>

          {/* Grid Metadata Pihak & Jadwal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-200 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-navy-500" />
                Pejabat Pembuat Komitmen (PPK)
              </span>
              <p className="font-bold text-navy-900 text-sm">{ppk?.name || '-'}</p>
              <p className="text-gray-500 font-mono text-[11px]">NIP: {ppk?.employee_id || '-'}</p>
              <p className="text-gray-400 text-[11px]">{ppk?.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-navy-500" />
                Jangka Waktu Pelaksanaan
              </span>
              <p className="font-semibold text-navy-900 text-sm">
                {formatDate(spk.tanggal_mulai)} s.d. {formatDate(spk.tanggal_selesai)}
              </p>
              <p className="text-gray-400 text-[11px]">
                Diterbitkan pada {formatDate(spk.tanggal_spk)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-navy-500" />
                Status Serah Terima & BAST
              </span>
              <p className="font-bold text-sm">
                {spk.serahTerima?.status === 'completed' ? (
                  <span className="text-success flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> BAST Selesai Terbit
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">
                    Menunggu Penyelesaian Pekerjaan / BAST
                  </span>
                )}
              </p>
              <p className="text-gray-400 text-[11px]">
                {spk.serahTerima?.tanggal_serah_terima
                  ? `Tanggal: ${formatDate(spk.serahTerima.tanggal_serah_terima)}`
                  : 'Pekerjaan sedang berlangsung'}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Card 2: Rincian Barang Kontrak ──────────────────────────── */}
      <Card>
        <CardHeader
          title="Rincian Barang & Nilai Kesepakatan Kontrak"
          subtitle="Daftar barang dan jasa yang harus diserahkan penyedia sesuai hasil negosiasi harga resmi"
        />
        <CardBody noPadding>
          <Table>
            <TableHeader>
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead>Nama Barang / Pekerjaan</TableHead>
              <TableHead>Spesifikasi Teknis</TableHead>
              <TableHead align="center" className="w-20">Satuan</TableHead>
              <TableHead align="right" className="w-20">Volume</TableHead>
              <TableHead align="right" className="w-36">Harga Satuan (Rp)</TableHead>
              <TableHead align="right" className="w-40">Subtotal (Rp)</TableHead>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id} isZebra={index % 2 === 1}>
                  <TableCell align="center" className="text-gray-400 font-mono text-xs">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-navy-900">
                    {item.hpsItem?.nama_barang}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {item.hpsItem?.spesifikasi || '-'}
                  </TableCell>
                  <TableCell align="center" className="text-xs text-gray-700">
                    {item.hpsItem?.satuan}
                  </TableCell>
                  <TableCell align="right" className="font-mono text-xs font-semibold text-navy-900">
                    {parseFloat(item.hpsItem?.volume || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell align="right" className="font-mono text-xs text-gray-700">
                    {formatRupiah(item.harga_satuan)}
                  </TableCell>
                  <TableCell align="right" className="font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                    {formatRupiah(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-4">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Total Nilai Kontrak SPK:
            </span>
            <span className="text-base font-bold font-mono text-navy-900">
              {formatRupiah(spk.nilai_kontrak)}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* ── Card 3: Penilaian Kinerja Vendor Pasca Serah Terima ─────── */}
      {(spk.status === 'completed' || spk.serahTerima?.status === 'completed') && (
        <>
          {evaluation ? (
            <VendorEvaluationCard evaluation={evaluation} />
          ) : isPPK ? (
            <Card className="border-amber-200 bg-amber-50/40 shadow-xs">
              <CardBody className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy-900">
                        Evaluasi Kinerja Rekanan Belum Dilakukan
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5 max-w-xl leading-relaxed">
                        Serah terima hasil pekerjaan telah selesai. Sesuai regulasi LKPP, Pejabat Pembuat Komitmen (PPK) berwenang memberikan penilaian kinerja penyedia atas aspek kualitas barang/jasa, ketepatan waktu pengiriman, dan responsivitas layanan.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="shrink-0"
                    leftIcon={<Star className="w-4 h-4 text-amber-300 fill-amber-300" />}
                    onClick={() => setIsEvalModalOpen(true)}
                  >
                    Beri Penilaian Kinerja
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="border-gray-200 bg-gray-50/60">
              <CardBody className="p-4 text-xs text-gray-500 flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-400" />
                <span>
                  Penilaian kinerja rekanan sedang menunggu input evaluasi resmi dari Pejabat Pembuat Komitmen (PPK).
                </span>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* ── Modal Pratinjau Dokumen SPK Siap Cetak ──────────────────── */}
      {isPrintModalOpen && (
        <SpkPrintDoc
          spk={spk}
          onDownloadPdf={handleDownloadPdf}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* ── Modal Form Penilaian Kinerja Vendor oleh PPK ─────────────── */}
      {isEvalModalOpen && (
        <VendorEvaluationModal
          spk={spk}
          isOpen={isEvalModalOpen}
          onClose={() => setIsEvalModalOpen(false)}
          onSuccess={() => {
            refetchEval()
            refetch()
          }}
        />
      )}
    </div>
  )
}

export default SpkDetailPage
