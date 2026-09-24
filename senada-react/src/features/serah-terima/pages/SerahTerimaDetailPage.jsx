import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useResumeSpk,
  useUploadSerahTerimaDoc,
  useCompleteSerahTerima,
} from '../hooks/useSerahTerima'
import useAuthStore from '../../../store/authStore'
import { Card, CardHeader, CardBody } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import { Input } from '../../../components/Input'
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
import SerahTerimaStatusBadge from '../components/SerahTerimaStatusBadge'
import {
  formatRupiah,
  formatDate,
  formatDateTime,
  formatFileSize,
} from '../../../utils/formatters'
import {
  ArrowLeft,
  CheckSquare,
  Upload,
  Printer,
  FileCheck2,
  Building2,
  Calendar,
  Download,
  FileText,
  AlertCircle,
  Loader2,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

export function SerahTerimaDetailPage() {
  const { spkId } = useParams()
  const { user, hasPermission } = useAuthStore()

  const { data, isLoading, isError, error, refetch } = useResumeSpk(spkId)
  const resume = data?.data

  const uploadMutation = useUploadSerahTerimaDoc()
  const completeMutation = useCompleteSerahTerima()

  // Modal upload surat jalan state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)

  // Modal penyelesaian BAST state (PPK)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [tanggalSerahTerima, setTanggalSerahTerima] = useState(
    new Date().toISOString().split('T')[0]
  )

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 max-w-5xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-navy-700 mb-2" />
        <p className="text-xs font-medium">Memuat berkas Resume SPK & BAST...</p>
      </div>
    )
  }

  if (isError || !resume) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-danger mx-auto" />
          <h2 className="text-base font-bold text-red-900">Gagal Memuat Data Serah Terima</h2>
          <p className="text-xs text-red-700">
            {error?.response?.data?.message || 'Data tidak ditemukan atau Anda tidak memiliki hak akses.'}
          </p>
          <div className="pt-2">
            <Link to="/serah-terima">
              <Button variant="secondary" size="sm">
                Kembali ke Daftar Serah Terima
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isVendor = user?.roles?.includes('penyedia')
  const ppkUser = resume.ppk || resume.pihak?.ppk
  const vendorUser = resume.vendor || resume.pihak?.vendor
  const hpsInfo = resume.hps || resume.pengadaan
  const spkInfo = resume.spk || {}
  const nilaiKontrak = parseFloat(resume.nilai_kontrak || spkInfo.nilai_kontrak || 0)
  const isPPK =
    hasPermission('serah_terima:update') &&
    (user?.roles?.includes('admin') || ppkUser?.id === user?.id)

  const isCompleted = resume.serah_terima?.status === 'completed'
  const items = resume.items || []

  // Handlers
  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!uploadFile) return

    try {
      await uploadMutation.mutateAsync({ spkId, file: uploadFile })
      setIsUploadModalOpen(false)
      setUploadFile(null)
      refetch()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunggah surat jalan / bukti kirim.')
    }
  }

  const handleCompleteSubmit = async (e) => {
    e.preventDefault()
    try {
      await completeMutation.mutateAsync({
        spkId,
        payload: {
          tanggal_serah_terima: tanggalSerahTerima,
          status: 'completed',
        },
      })
      setIsCompleteModalOpen(false)
      refetch()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menerbitkan Berita Acara Serah Terima.')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* ── Breadcrumb & Action Bar ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/serah-terima"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Serah Terima</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tombol Rekanan: Unggah Surat Jalan */}
          {isVendor && !isCompleted && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Upload className="w-4 h-4 text-navy-500" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Unggah Surat Jalan / Bukti Kirim
            </Button>
          )}

          {/* Tombol PPK: Konfirmasi Penerimaan Barang & Terbitkan BAST */}
          {isPPK && !isCompleted && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FileCheck2 className="w-4 h-4 text-emerald-300" />}
              onClick={() => setIsCompleteModalOpen(true)}
            >
              Konfirmasi Penerimaan Barang (Terbitkan BAST)
            </Button>
          )}

          {/* Tombol Cetak Dokumen Resmi BAST & BAP (Muncul saat status completed) */}
          {isCompleted && (
            <>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800"
                leftIcon={<FileCheck2 className="w-4 h-4 text-emerald-200" />}
                onClick={() => window.print()}
                title="Cetak Berita Acara Serah Terima (BAST)"
              >
                Cetak BA Serah Terima
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FileText className="w-4 h-4 text-navy-500" />}
                onClick={() => window.print()}
                title="Cetak Berita Acara Pembayaran (BAP)"
              >
                Cetak BA Pembayaran
              </Button>
            </>
          )}

          {/* Tombol Cetak Dokumen Resume */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Cetak Resume SPK
          </Button>
        </div>
      </div>

      {/* ── Card 1: Header Resume SPK & Status BAST ─────────────────── */}
      <Card>
        <CardBody className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-navy-900/5 text-navy-900 rounded-md border border-navy-900/15">
                  {resume.nomor_spk || spkInfo.nomor_spk}
                </span>
                <SerahTerimaStatusBadge
                  status={resume.serah_terima?.status || 'pending'}
                />
                <Badge variant="navy" size="sm">
                  Tahun Anggaran {hpsInfo?.fiscal_year || '2026'}
                </Badge>
              </div>

              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
                {hpsInfo?.nama_paket || 'Paket Kontrak Pekerjaan'}
              </h1>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Building2 className="w-4 h-4 text-navy-500 shrink-0" />
                <span className="font-semibold text-navy-900">
                  {vendorUser?.company_name || 'Penyedia Rekanan'}
                </span>
                <span>• NPWP: {vendorUser?.npwp || '-'}</span>
              </div>
            </div>

            {/* Nilai Realisasi Kontrak */}
            <div className="p-4 bg-navy-900 text-white rounded-xl text-right shrink-0 shadow-sm border border-navy-700 min-w-[240px]">
              <p className="text-[11px] font-medium text-gray-300 uppercase tracking-wider">
                Nilai Kontrak Realisasi (SPK)
              </p>
              <p className="text-xl font-bold font-mono text-white mt-0.5">
                {formatRupiah(nilaiKontrak)}
              </p>
              <p className="text-[10px] text-gray-300 mt-1">
                Pagu HPS Awal: {formatRupiah(hpsInfo?.total_harga || hpsInfo?.total_hps)}
              </p>
            </div>
          </div>

          {/* Grid Informasi Pihak & Waktu Pelaksanaan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-200 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-navy-500" />
                PPK Penerima Barang
              </span>
              <p className="font-bold text-navy-900 text-sm">{ppkUser?.name || '-'}</p>
              <p className="text-gray-500 font-mono text-[11px]">NIP: {ppkUser?.employee_id || '-'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-navy-500" />
                Jadwal Pelaksanaan Kontrak
              </span>
              <p className="font-semibold text-navy-900 text-sm">
                {formatDate(resume.tanggal_mulai || spkInfo.tanggal_mulai)} s.d. {formatDate(resume.tanggal_selesai || spkInfo.tanggal_selesai)}
              </p>
              <p className="text-gray-400 text-[11px]">
                Tanggal SPK: {formatDate(resume.tanggal_spk || spkInfo.tanggal_spk)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-navy-500" />
                Tanggal Berita Acara (BAST)
              </span>
              <p className="font-bold text-sm">
                {resume.serah_terima?.tanggal_serah_terima ? (
                  <span className="text-success font-mono">
                    {formatDate(resume.serah_terima.tanggal_serah_terima)}
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">Belum Diterbitkan BAST</span>
                )}
              </p>
              <p className="text-gray-400 text-[11px]">
                {isCompleted ? 'Pekerjaan telah diterima 100%' : 'Menunggu verifikasi fisik PPK'}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Card 2: Rincian Barang Serah Terima ─────────────────────── */}
      <Card>
        <CardHeader
          title="Rincian Barang yang Diserahterimakan"
          subtitle="Daftar fisik barang/jasa yang diperiksa kesesuaian volume dan spesifikasinya"
        />
        <CardBody noPadding>
          <Table>
            <TableHeader>
              <TableHead className="w-12 text-center">No</TableHead>
              <TableHead>Nama Barang / Pekerjaan</TableHead>
              <TableHead>Spesifikasi Teknis</TableHead>
              <TableHead align="center" className="w-20">Satuan</TableHead>
              <TableHead align="right" className="w-24">Volume Diterima</TableHead>
              <TableHead align="right" className="w-36">Harga Satuan (Rp)</TableHead>
              <TableHead align="right" className="w-40">Subtotal (Rp)</TableHead>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id || index} isZebra={index % 2 === 1}>
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
              Total Nilai Barang Diserahkan:
            </span>
            <span className="text-base font-bold font-mono text-navy-900">
              {formatRupiah(nilaiKontrak)}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* ── Card 3: Dokumen Pengiriman / Surat Jalan ─────────────────── */}
      <Card>
        <CardHeader
          title="Dokumen Surat Jalan & Bukti Serah Terima Fisik"
          subtitle="Bukti pengiriman barang dari gudang rekanan, izin mulai kerja, atau pindaian berkas BAST bermaterai"
          action={
            isVendor && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Upload className="w-4 h-4" />}
                onClick={() => setIsUploadModalOpen(true)}
              >
                Unggah Berkas Baru
              </Button>
            )
          }
        />
        <CardBody className="p-6">
          {resume.documents?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resume.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-navy-500/40 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-50 text-success border border-emerald-100 shrink-0">
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
                      <span>Unduh Berkas</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-xs">
              Belum ada berkas surat jalan atau bukti pengiriman yang diunggah.
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Modal 1: Unggah Surat Jalan / Dokumen Kirim ─────────────── */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleUploadSubmit}>
          <ModalHeader
            title="Unggah Dokumen Surat Jalan / Pengiriman"
            subtitle={`Nomor Kontrak: ${resume.nomor_spk}`}
            onClose={() => setIsUploadModalOpen(false)}
          />
          <ModalBody className="space-y-4">
            <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/50 text-center space-y-3">
              <div className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center mx-auto text-gray-500 shadow-sm">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-navy-900">
                  {uploadFile ? uploadFile.name : 'Pilih scan surat jalan dari komputer'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Format: PDF, JPG, PNG (Maks 10 MB)
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

      {/* ── Modal 2: Selesaikan Serah Terima / Terbitkan BAST (PPK) ──── */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleCompleteSubmit}>
          <ModalHeader
            title="Konfirmasi Penerbitan Berita Acara Serah Terima (BAST)"
            subtitle="Pernyataan resmi bahwa barang dan jasa telah diterima lengkap dan sesuai spesifikasi"
            onClose={() => setIsCompleteModalOpen(false)}
          />
          <ModalBody className="space-y-4">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
              <FileCheck2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Pemeriksaan Fisik Pejabat Pembuat Komitmen (PPK)</p>
                <p className="mt-0.5 text-emerald-800">
                  Dengan mengonfirmasi serah terima ini, Berita Acara Serah Terima (BAST) resmi diterbitkan, status kontrak SPK menjadi selesai, dan data Resume SPK dapat diakses oleh PPSPM untuk penerbitan SPM di aplikasi SAKTI.
                </p>
              </div>
            </div>

            <Input
              label="Tanggal Resmi Serah Terima Barang / BAST *"
              type="date"
              required
              value={tanggalSerahTerima}
              onChange={(e) => setTanggalSerahTerima(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCompleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="success"
              isLoading={completeMutation.isPending}
              leftIcon={<CheckSquare className="w-4 h-4" />}
            >
              Terbitkan BAST Resmi
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}

export default SerahTerimaDetailPage
