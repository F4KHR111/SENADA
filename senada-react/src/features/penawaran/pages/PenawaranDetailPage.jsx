import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  usePenawaranDetail,
  useUploadPenawaranDoc,
} from '../hooks/usePenawaran'
import {
  useCreateUsulanNegosiasi,
  useRespondNegosiasi,
} from '../../negosiasi/hooks/useNegosiasi'
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
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../../../components/Modal'
import PenawaranStatusBadge from '../components/PenawaranStatusBadge'
import PenawaranPrintDoc from '../components/PenawaranPrintDoc'
import NegosiasiTimeline from '../../negosiasi/components/NegosiasiTimeline'
import {
  formatRupiah,
  formatDate,
  formatDateTime,
  formatFileSize,
} from '../../../utils/formatters'
import {
  ArrowLeft,
  Printer,
  Upload,
  Download,
  FileText,
  Building2,
  AlertCircle,
  Loader2,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react'

export function PenawaranDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()

  // Queries & Mutations
  const { data, isLoading, isError, error, refetch } = usePenawaranDetail(id)
  const penawaran = data?.data

  const uploadMutation = useUploadPenawaranDoc()
  const proposeMutation = useCreateUsulanNegosiasi()
  const respondMutation = useRespondNegosiasi()

  // States
  const [isPrintDocOpen, setIsPrintDocOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 max-w-5xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-navy-700 mb-2" />
        <p className="text-xs font-medium">Memuat detail penawaran harga...</p>
      </div>
    )
  }

  if (isError || !penawaran) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-danger mx-auto" />
          <h2 className="text-base font-bold text-red-900">Gagal Memuat Penawaran</h2>
          <p className="text-xs text-red-700">
            {error?.response?.data?.message || 'Data penawaran tidak ditemukan atau Anda tidak memiliki akses.'}
          </p>
          <div className="pt-2">
            <Link to="/penawaran">
              <Button variant="secondary" size="sm">
                Kembali ke Daftar Penawaran
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isVendor = user?.roles?.includes('penyedia')
  const vendor = penawaran.undanganVendor?.vendor
  const undangan = penawaran.undanganVendor?.undangan
  const hps = undangan?.hps
  const items = penawaran.items || []

  const totalHps = parseFloat(hps?.total_harga) || 0
  const totalPenawaran = parseFloat(penawaran.total_penawaran) || 0
  const selisih = totalPenawaran - totalHps
  const persentase = totalHps > 0 ? (selisih / totalHps) * 100 : 0

  // Upload handler
  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!uploadFile) return

    try {
      await uploadMutation.mutateAsync({
        id: penawaran.id,
        file: uploadFile,
      })
      setIsUploadModalOpen(false)
      setUploadFile(null)
      refetch()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunggah dokumen penawaran.')
    }
  }

  // Negosiasi handlers
  const handleProposeRound = async (payload) => {
    try {
      await proposeMutation.mutateAsync(payload)
      refetch()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengajukan ronde negosiasi.')
    }
  }

  const handleRespondRound = async (negosiasiId, payload) => {
    try {
      await respondMutation.mutateAsync({ id: negosiasiId, payload })
      refetch()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal merespon usulan negosiasi.')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* ── Breadcrumb & Actions ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/penawaran"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Penawaran</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {/* Cetak Format Surat Penawaran */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="w-4 h-4 text-navy-500" />}
            onClick={() => setIsPrintDocOpen(true)}
          >
            Cetak Format Surat Penawaran
          </Button>

          {/* Unggah Dokumen Bertandatangan */}
          {isVendor && penawaran.status === 'submitted' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Unggah Dokumen Cap Basah
            </Button>
          )}
        </div>
      </div>

      {/* ── Card 1: Header Penawaran & Metadata ─────────────────────── */}
      <Card>
        <CardBody className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <PenawaranStatusBadge status={penawaran.status} />
                <Badge variant="navy" size="sm">
                  Undangan: {undangan?.nomor_undangan || '-'}
                </Badge>
              </div>

              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
                {hps?.nama_paket || 'Paket Pengadaan'}
              </h1>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Building2 className="w-4 h-4 text-navy-500 shrink-0" />
                <span className="font-semibold text-navy-900">
                  {vendor?.company_name || 'Rekanan Penyedia'}
                </span>
                <span>• NPWP: {vendor?.npwp || '-'}</span>
              </div>
            </div>

            {/* Total Penawaran vs Pagu HPS */}
            <div className="p-4 bg-navy-900 text-white rounded-xl text-right shrink-0 shadow-sm border border-navy-700 min-w-[240px]">
              <p className="text-[11px] font-medium text-gray-300 uppercase tracking-wider">
                Total Nilai Tawaran Vendor
              </p>
              <p className="text-xl font-bold font-mono text-white mt-0.5">
                {formatRupiah(penawaran.total_penawaran)}
              </p>
              {!isVendor && (
                <div className="mt-2 pt-2 border-t border-navy-700/80 text-[11px] text-gray-300 flex items-center justify-end gap-1.5">
                  <span>Pagu HPS: {formatRupiah(hps?.total_harga)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Grid Metadata Evaluasi Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200 text-xs">
            {!isVendor ? (
              <div>
                <span className="text-[11px] text-gray-400 uppercase font-semibold">
                  Perbandingan terhadap Pagu HPS
                </span>
                <p className="text-sm font-bold mt-1">
                  {selisih <= 0 ? (
                    <span className="text-success flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      Hemat {Math.abs(persentase).toFixed(2)}% ({formatRupiah(Math.abs(selisih))})
                    </span>
                  ) : (
                    <span className="text-danger flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +{persentase.toFixed(2)}% di atas pagu ({formatRupiah(selisih)})
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[11px] text-gray-400 uppercase font-semibold">
                  Status Penawaran
                </span>
                <p className="text-sm font-bold text-navy-900 mt-1 capitalize">
                  {penawaran.status}
                </p>
              </div>
            )}

            <div>
              <span className="text-[11px] text-gray-400 uppercase font-semibold">
                Waktu Pemasukan Penawaran
              </span>
              <p className="font-semibold text-navy-900 text-sm mt-1">
                {formatDate(penawaran.submitted_at)}
              </p>
              <p className="text-[11px] text-gray-400">{formatDateTime(penawaran.submitted_at)}</p>
            </div>

            <div>
              <span className="text-[11px] text-gray-400 uppercase font-semibold">
                Pejabat Pengadaan (PBJ)
              </span>
              <p className="font-semibold text-navy-900 text-sm mt-1">
                {undangan?.pbj?.name || '-'}
              </p>
              <p className="text-[11px] text-gray-400">{undangan?.pbj?.email}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Card 2: Tabel Perbandingan Rincian Barang ────────────────── */}
      <Card>
        <CardHeader
          title="Rincian Item Penawaran Harga (Fixed Volume HPS)"
          subtitle={
            isVendor
              ? "Daftar rincian penawaran harga satuan yang telah diajukan perusahaan Anda"
              : "Perbandingan harga satuan yang diajukan penyedia terhadap harga satuan HPS"
          }
        />
        <CardBody noPadding>
          <Table>
            <TableHeader>
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead>Nama Barang & Spesifikasi Teknis</TableHead>
              <TableHead align="center" className="w-20">Satuan</TableHead>
              <TableHead align="right" className="w-20">Volume</TableHead>
              {!isVendor && <TableHead align="right" className="w-36">Harga Satuan HPS</TableHead>}
              <TableHead align="right" className="w-36">Harga Satuan Tawaran</TableHead>
              <TableHead align="right" className="w-40">Subtotal Tawaran</TableHead>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const hpsItem = item.hpsItem
                const volume = parseFloat(hpsItem?.volume) || 0

                return (
                  <TableRow key={item.id} isZebra={index % 2 === 1}>
                    <TableCell align="center" className="text-gray-400 font-mono text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-navy-900">{hpsItem?.nama_barang || '-'}</p>
                      {hpsItem?.spesifikasi && (
                        <p className="text-[11px] text-gray-500 mt-0.5 whitespace-pre-line">
                          {hpsItem.spesifikasi}
                        </p>
                      )}
                    </TableCell>
                    <TableCell align="center" className="text-xs text-gray-700">
                      {hpsItem?.satuan || '-'}
                    </TableCell>
                    <TableCell align="right" className="font-mono text-xs font-semibold text-navy-900">
                      {volume.toLocaleString('id-ID')}
                    </TableCell>
                    {!isVendor && (
                      <TableCell align="right" className="font-mono text-xs text-gray-400">
                        {formatRupiah(hpsItem?.harga_satuan)}
                      </TableCell>
                    )}
                    <TableCell align="right" className="font-mono text-xs font-semibold text-navy-900">
                      {formatRupiah(item.harga_satuan)}
                    </TableCell>
                    <TableCell align="right" className="font-mono text-xs font-bold text-navy-900 whitespace-nowrap">
                      {formatRupiah(item.subtotal)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Total Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-4">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Total Nilai Penawaran:
            </span>
            <span className="text-base font-bold font-mono text-navy-900">
              {formatRupiah(penawaran.total_penawaran)}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* ── Card 3: Dokumen Pendukung & Surat Bertandatangan ─────────── */}
      <Card>
        <CardHeader
          title="Dokumen Penawaran Terunggah (Cap Basah / BAST)"
          subtitle="Bukti cetak surat penawaran harga yang telah ditandatangani dan dibubuhi cap basah perusahaan"
          action={
            isVendor && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Upload className="w-4 h-4" />}
                onClick={() => setIsUploadModalOpen(true)}
              >
                Unggah Dokumen
              </Button>
            )
          }
        />
        <CardBody className="p-6">
          {penawaran.documents?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {penawaran.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-navy-500/40 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-50 text-navy-500 border border-blue-100 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-navy-900 truncate" title={doc.file_name}>
                        {doc.file_name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatFileSize(doc.file_size)} • {doc.file_type || 'Dokumen'}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Diunggah: {doc.uploader?.name || 'Penyedia'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">{formatDate(doc.created_at)}</span>
                    <a
                      href={`http://localhost:5000/${doc.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-navy-500 hover:text-navy-900"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-gray-400 text-xs">
              Belum ada berkas surat bertandatangan/cap basah yang diunggah.
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Card 4: Modul Negosiasi Harga (Tahap 4) ──────────────────── */}
      <NegosiasiTimeline
        penawaran={penawaran}
        negosiasiList={penawaran.negosiasiList || []}
        onProposeRound={handleProposeRound}
        onRespondRound={handleRespondRound}
        isSubmitting={proposeMutation.isPending || respondMutation.isPending}
      />

      {/* ── Modal Pratinjau Cetak Penawaran ─────────────────────────── */}
      {isPrintDocOpen && (
        <PenawaranPrintDoc
          penawaran={penawaran}
          onClose={() => setIsPrintDocOpen(false)}
        />
      )}

      {/* ── Modal Unggah Dokumen Bertandatangan ──────────────────────── */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleUploadSubmit}>
          <ModalHeader
            title="Unggah Dokumen Surat Penawaran"
            subtitle="Lampirkan scan surat penawaran bertandatangan dan cap basah"
            onClose={() => setIsUploadModalOpen(false)}
          />
          <ModalBody className="space-y-4">
            <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/50 text-center space-y-3">
              <div className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center mx-auto text-gray-500 shadow-sm">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-navy-900">
                  {uploadFile ? uploadFile.name : 'Pilih berkas dari komputer'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Format yang didukung: PDF, JPG, PNG (Maks 10 MB)
                </p>
              </div>

              <label className="inline-block cursor-pointer">
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-white text-navy-900 border border-gray-200 rounded-lg hover:bg-gray-100 shadow-sm transition-colors">
                  {uploadFile ? 'Ganti Berkas' : 'Telusuri Berkas'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0])
                    }
                  }}
                />
              </label>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!uploadFile}
              isLoading={uploadMutation.isPending}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Unggah Dokumen
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}

export default PenawaranDetailPage
