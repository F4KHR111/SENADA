import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  useHpsDetail,
  useVerifyHps,
  useUploadHpsDocument,
  useDeleteHps,
} from '../hooks/useHps'
import useAuthStore from '../../../store/authStore'
import { Card, CardHeader, CardBody } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import { Textarea } from '../../../components/Input'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../../../components/Modal'
import HpsStatusBadge from '../components/HpsStatusBadge'
import HpsItemTable from '../components/HpsItemTable'
import { exportHpsToExcel } from '../utils/excelHpsHelper'
import {
  formatRupiah,
  formatDate,
  formatDateTime,
  formatFileSize,
} from '../../../utils/formatters'
import {
  ArrowLeft,
  FileSpreadsheet,
  CheckCircle2,
  Upload,
  FileText,
  Download,
  Trash2,
  User,
  Calendar,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building,
  Plus,
  Edit2,
  Lock,
} from 'lucide-react'

export function HpsDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, hasPermission } = useAuthStore()

  // Query detail
  const { data, isLoading, isError, error, refetch } = useHpsDetail(id)
  // Backend returns { success: true, data: hpsData } or hpsData directly
  const hps = data?.data?.id ? data.data : (data?.id ? data : (data?.data || null))

  // Modal Verifikasi PBJ State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState('verified')
  const [verifyCatatan, setVerifyCatatan] = useState('')
  const verifyMutation = useVerifyHps()

  // Modal Upload Dokumen Tambahan State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const uploadMutation = useUploadHpsDocument()

  // Delete Mutation
  const deleteMutation = useDeleteHps()
  const [isDeleting, setIsDeleting] = useState(false)

  // Loading & Error states
  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 max-w-5xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-navy-700 mb-2" />
        <p className="text-xs font-medium">Memuat detail paket HPS...</p>
      </div>
    )
  }

  if (isError || !hps) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-danger mx-auto" />
          <h2 className="text-base font-bold text-red-900">Gagal Memuat Paket HPS</h2>
          <p className="text-xs text-red-700">
            {error?.response?.data?.message || 'Data HPS tidak ditemukan atau server mengalami gangguan.'}
          </p>
          <div className="pt-2">
            <Link to="/hps">
              <Button variant="secondary" size="sm">
                Kembali ke Daftar HPS
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Hak akses tindakan
  const isOwnerOrAdmin = user?.roles?.includes('admin') || hps.ppk_id === user?.id

  // Form edit HANYA aktif kalau status masih draft, tampilkan read-only kalau sudah verified/fixed (AGENTS.md §4 Tahap 1)
  const canEdit = hps.status === 'draft' && hasPermission('hps:update') && isOwnerOrAdmin

  const canVerify =
    hps.status === 'draft' &&
    hasPermission('hps:verify') &&
    (user?.roles?.includes('pbj') || user?.roles?.includes('admin'))

  const canUploadDoc =
    hasPermission('hps:update') && isOwnerOrAdmin

  const canDelete =
    hps.status === 'draft' &&
    hasPermission('hps:delete') && isOwnerOrAdmin

  // Handler Verifikasi PBJ
  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    try {
      await verifyMutation.mutateAsync({
        id: hps.id,
        payload: {
          status: verifyStatus,
          catatan: verifyCatatan || undefined,
        },
      })
      setIsVerifyModalOpen(false)
      setVerifyCatatan('')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memverifikasi HPS.')
    }
  }

  // Handler Upload Dokumen
  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!uploadFile) {
      alert('Pilih berkas dokumen terlebih dahulu.')
      return
    }

    try {
      await uploadMutation.mutateAsync({
        id: hps.id,
        file: uploadFile,
      })
      setIsUploadModalOpen(false)
      setUploadFile(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunggah dokumen.')
    }
  }

  // Handler Hapus HPS
  const handleDelete = async () => {
    if (window.confirm(`Hapus draf paket HPS '${hps.nomor_hps}' secara permanen?`)) {
      setIsDeleting(true)
      try {
        await deleteMutation.mutateAsync(hps.id)
        navigate('/hps')
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus HPS.')
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* ── Breadcrumb & Navigation ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/hps"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar HPS</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tombol Export ke Excel */}
          {hps.items && hps.items.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              pill
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
              onClick={() => exportHpsToExcel(hps, hps.items)}
              title="Unduh seluruh rincian barang HPS dalam format Excel"
            >
              Export Excel
            </Button>
          )}

          {/* Tombol Edit Draft HPS (HANYA muncul saat status draft) */}
          {canEdit && (
            <Link to={`/hps/${hps.id}/edit`}>
              <Button
                variant="primary"
                size="sm"
                pill
                leftIcon={<Edit2 className="w-4 h-4 text-blue-200" />}
              >
                Edit Draf HPS
              </Button>
            </Link>
          )}

          {/* Indikator Read-Only untuk status verified/fixed */}
          {hps.status !== 'draft' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-gray-500" />
              <span>Read-Only ({hps.status === 'verified' ? 'Terverifikasi' : 'Fixed'})</span>
            </div>
          )}

          {/* Tombol Verifikasi PBJ */}
          {canVerify && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-300" />}
              onClick={() => setIsVerifyModalOpen(true)}
            >
              Verifikasi HPS (PBJ)
            </Button>
          )}

          {/* Tombol Upload Dokumen */}
          {canUploadDoc && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Upload className="w-4 h-4 text-navy-500" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Unggah Berkas
            </Button>
          )}

          {/* Tombol Hapus Draft */}
          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleDelete}
            >
              Hapus Draf
            </Button>
          )}
        </div>
      </div>

      {/* ── Header Detail Paket HPS ─────────────────────────────────── */}
      <Card>
        <CardBody className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-navy-900/5 text-navy-900 rounded-md border border-navy-900/15">
                  {hps.nomor_hps}
                </span>
                <HpsStatusBadge status={hps.status} />
                <Badge variant="navy" size="sm">
                  Tahun Anggaran {hps.fiscal_year}
                </Badge>
              </div>

              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
                {hps.nama_paket}
              </h1>

              {hps.deskripsi ? (
                <p className="text-xs text-gray-600 max-w-3xl leading-relaxed whitespace-pre-line">
                  {hps.deskripsi}
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic">Tidak ada deskripsi tambahan.</p>
              )}
            </div>

            {/* Total HPS Box */}
            {(() => {
              const rawSubtotal = (hps.items && hps.items.length > 0)
                ? hps.items.reduce((acc, curr) => acc + (parseFloat(curr.subtotal) || 0), 0)
                : (parseFloat(hps.total_harga) || 0)
              const ppn11 = Math.round(rawSubtotal * 0.11)
              const jumlahHargaHps = rawSubtotal + ppn11

              return (
                <div className="p-4 bg-navy-900 text-white rounded-xl text-right shrink-0 shadow-sm border border-navy-700 min-w-[240px]">
                  <p className="text-[11px] font-medium text-gray-300 uppercase tracking-wider">
                    Jumlah Harga HPS
                  </p>
                  <p className="text-xl font-bold font-mono text-white mt-1">
                    {formatRupiah(jumlahHargaHps)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Termasuk PPN 11% ({formatRupiah(ppn11)})
                  </p>
                </div>
              )
            })()}
          </div>

          {/* Metadata Grid (PPK, PBJ, Tanggal) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-200 text-xs">
            {/* PPK Pembuat */}
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-navy-500" />
                Pejabat Pembuat Komitmen (PPK)
              </span>
              <p className="font-semibold text-navy-900 text-sm">{hps.ppk?.name || '-'}</p>
              <p className="text-gray-500 font-mono text-[11px]">
                NIP: {hps.ppk?.employee_id || '-'}
              </p>
            </div>

            {/* PBJ Verifikator */}
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-navy-500" />
                Pejabat Pengadaan (PBJ)
              </span>
              {hps.pbj ? (
                <>
                  <p className="font-semibold text-navy-900 text-sm">{hps.pbj.name}</p>
                  <p className="text-gray-500 font-mono text-[11px]">
                    NIP: {hps.pbj.employee_id || '-'}
                  </p>
                </>
              ) : (
                <p className="text-gray-400 italic">Menunggu verifikasi PBJ</p>
              )}
            </div>

            {/* Tanggal Pembuatan */}
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-navy-500" />
                Waktu Penyusunan
              </span>
              <p className="font-medium text-navy-900">{formatDate(hps.created_at)}</p>
              <p className="text-gray-400 text-[11px]">{formatDateTime(hps.created_at)}</p>
            </div>

            {/* Tanggal Verifikasi */}
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-navy-500" />
                Waktu Verifikasi
              </span>
              <p className="font-medium text-navy-900">
                {hps.verified_at ? formatDate(hps.verified_at) : '-'}
              </p>
              <p className="text-gray-400 text-[11px]">
                {hps.verified_at ? formatDateTime(hps.verified_at) : 'Belum diverifikasi'}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Card 2: Rincian Barang / Jasa ──────────────────────────── */}
      <Card>
        <CardHeader
          title="Rincian Barang & Jasa (Fixed Volume HPS)"
          subtitle="Daftar rincian barang, volume kebutuhan, dan harga satuan HPS sebagai acuan penawaran vendor"
        />
        <CardBody className="p-6">
          <HpsItemTable items={hps.items} totalHarga={hps.total_harga} />
        </CardBody>
      </Card>

      {/* ── Card 3: Dokumen Pendukung Pengadaan ─────────────────────── */}
      <Card>
        <CardHeader
          title="Dokumen Pendukung & KAK"
          subtitle="Daftar berkas lampiran kerangka acuan kerja, survei harga pasar, atau spesifikasi teknis"
          action={
            canUploadDoc && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsUploadModalOpen(true)}
              >
                Tambah Dokumen
              </Button>
            )
          }
        />
        <CardBody className="p-6">
          {hps.documents && hps.documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hps.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-navy-500/40 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-100 shrink-0">
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
                        Oleh: {doc.uploader?.name || 'PPK'}
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
            <div className="py-8 text-center text-gray-400 text-xs">
              Belum ada dokumen lampiran yang diunggah untuk paket HPS ini.
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Modal 1: Verifikasi HPS oleh PBJ ────────────────────────── */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleVerifySubmit}>
          <ModalHeader
            title="Verifikasi Paket HPS"
            subtitle={`Nomor: ${hps.nomor_hps}`}
            onClose={() => setIsVerifyModalOpen(false)}
          />
          <ModalBody className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-navy-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-navy-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Konfirmasi Pejabat Pengadaan (PBJ)</p>
                <p className="text-gray-600 mt-0.5">
                  Setelah diverifikasi, rincian barang dan volume HPS akan dikunci (*fixed*), dan selanjutnya paket pengadaan dapat dibuatkan **Surat Undangan** kepada penyedia rekanan (Tahap 2).
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Pilih Status Verifikasi *
              </label>
              <select
                value={verifyStatus}
                onChange={(e) => setVerifyStatus(e.target.value)}
                className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500"
              >
                <option value="verified">Verified (Telah Diverifikasi PBJ)</option>
                <option value="fixed">Fixed (Terkunci & Siap Diundang)</option>
              </select>
            </div>

            <Textarea
              label="Catatan Verifikasi PBJ (Opsional)"
              placeholder="Tuliskan catatan verifikasi teknis atau kelayakan harga..."
              rows={3}
              value={verifyCatatan}
              onChange={(e) => setVerifyCatatan(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsVerifyModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={verifyMutation.isPending}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Simpan Verifikasi
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ── Modal 2: Unggah Dokumen Tambahan ────────────────────────── */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleUploadSubmit}>
          <ModalHeader
            title="Unggah Dokumen Lampiran HPS"
            subtitle={`Paket: ${hps.nama_paket}`}
            onClose={() => setIsUploadModalOpen(false)}
          />
          <ModalBody className="space-y-4">
            <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/50 text-center space-y-3">
              <div className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center mx-auto text-gray-500 shadow-sm">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-navy-900">
                  {uploadFile ? uploadFile.name : 'Pilih dokumen dari komputer Anda'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Format yang didukung: PDF, JPG, PNG (Maksimal 10 MB)
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

export default HpsDetailPage
