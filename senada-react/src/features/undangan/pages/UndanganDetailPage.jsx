import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  useUndanganDetail,
  useSendUndangan,
  useCloseUndangan,
  useDeleteUndangan,
  useRespondUndangan,
} from '../hooks/useUndangan'
import useAuthStore from '../../../store/authStore'
import { Card, CardHeader, CardBody } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import { Textarea } from '../../../components/Input'
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
import UndanganStatusBadge, {
  VendorInvitationStatusBadge,
} from '../components/UndanganStatusBadge'
import HpsItemTable from '../../hps/components/HpsItemTable'
import {
  formatRupiah,
  formatDate,
  formatDateTime,
  formatFileSize,
} from '../../../utils/formatters'
import {
  ArrowLeft,
  Mail,
  Send,
  Lock,
  Trash2,
  Clock,
  Building2,
  User,
  AlertCircle,
  Loader2,
  FileText,
  Download,
  XCircle,
  FileSpreadsheet,
  Eye,
  Scale,
} from 'lucide-react'

export function UndanganDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, hasPermission } = useAuthStore()

  // Queries
  const { data, isLoading, isError, error } = useUndanganDetail(id)
  const undangan = data?.data

  // Mutations
  const sendMutation = useSendUndangan()
  const closeMutation = useCloseUndangan()
  const deleteMutation = useDeleteUndangan()
  const respondMutation = useRespondUndangan()

  // Modal decline state (Vendor)
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 max-w-5xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-navy-700 mb-2" />
        <p className="text-xs font-medium">Memuat detail paket undangan...</p>
      </div>
    )
  }

  if (isError || !undangan) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-danger mx-auto" />
          <h2 className="text-base font-bold text-red-900">Gagal Memuat Undangan</h2>
          <p className="text-xs text-red-700">
            {error?.response?.data?.message || 'Data undangan tidak ditemukan atau Anda tidak memiliki akses.'}
          </p>
          <div className="pt-2">
            <Link to="/undangan">
              <Button variant="secondary" size="sm">
                Kembali ke Daftar Undangan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isPBJ = user?.roles?.includes('pbj') || user?.roles?.includes('admin')
  const isVendor = user?.roles?.includes('penyedia')

  // Temukan entri undangan vendor untuk user saat ini (jika user adalah penyedia)
  const myVendorInvitation = isVendor
    ? undangan.undanganVendors?.find(
        (uv) => uv.vendor?.user_id === user.id || uv.vendor_id === user.vendorProfile?.id
      )
    : null

  const isExpired =
    undangan.batas_waktu_penawaran &&
    new Date() > new Date(undangan.batas_waktu_penawaran)

  // Handlers
  const handleSend = async () => {
    if (
      window.confirm(
        `Terbitkan dan kirimkan undangan '${undangan.nomor_undangan}' ke ${undangan.undanganVendors?.length || 0} rekanan terpilih?`
      )
    ) {
      try {
        await sendMutation.mutateAsync(undangan.id)
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menerbitkan undangan.')
      }
    }
  }

  const handleClose = async () => {
    if (window.confirm('Tutup masa penawaran untuk paket undangan ini sekarang?')) {
      try {
        await closeMutation.mutateAsync(undangan.id)
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menutup penawaran undangan.')
      }
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Hapus draf undangan '${undangan.nomor_undangan}'?`)) {
      setIsDeleting(true)
      try {
        await deleteMutation.mutateAsync(undangan.id)
        navigate('/undangan')
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus undangan.')
        setIsDeleting(false)
      }
    }
  }

  const handleDeclineSubmit = async (e) => {
    e.preventDefault()
    try {
      await respondMutation.mutateAsync({
        id: undangan.id,
        payload: {
          status: 'declined',
          catatan: declineReason || undefined,
        },
      })
      setIsDeclineModalOpen(false)
      setDeclineReason('')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal merespon penolakan undangan.')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* ── Breadcrumb & Top Actions ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/undangan"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Undangan</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Tombol PBJ: Kirim / Terbitkan Undangan */}
          {isPBJ && undangan.status === 'draft' && (
            <>
              <Button
                variant="primary"
                size="sm"
                isLoading={sendMutation.isPending}
                leftIcon={<Send className="w-4 h-4 text-blue-300" />}
                onClick={handleSend}
              >
                Terbitkan & Kirim ke Rekanan
              </Button>

              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={handleDelete}
              >
                Hapus Draf
              </Button>
            </>
          )}

          {/* Tombol PBJ: Tutup Masa Penawaran */}
          {isPBJ && undangan.status === 'sent' && (
            <Button
              variant="secondary"
              size="sm"
              isLoading={closeMutation.isPending}
              leftIcon={<Lock className="w-4 h-4 text-gray-500" />}
              onClick={handleClose}
            >
              Tutup Masa Penawaran
            </Button>
          )}

          {/* Tombol Rekanan: Input Penawaran Langsung / Tolak */}
          {isVendor && undangan.status === 'sent' && !isExpired && (
            <>
              {myVendorInvitation?.status !== 'declined' && (
                <Link to={`/penawaran/create?undangan_id=${undangan.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Ajukan Penawaran Harga
                  </Button>
                </Link>
              )}

              {myVendorInvitation?.status !== 'declined' && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<XCircle className="w-4 h-4 text-red-500" />}
                  onClick={() => setIsDeclineModalOpen(true)}
                >
                  Tolak Undangan
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Banner Status Undangan Khusus Rekanan (Affordance & Feedback) ── */}
      {isVendor && (
        <div className="p-4 rounded-xl border border-navy-500/20 bg-blue-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-navy-900 text-white rounded-lg shrink-0 mt-0.5">
              <Mail className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-xs font-bold text-navy-900">
                Status Undangan Anda: {myVendorInvitation?.status === 'declined' ? 'Ditolak' : 'Undangan Aktif Diterima'}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {myVendorInvitation?.status === 'declined'
                  ? 'Perusahaan Anda telah menolak undangan pengadaan ini.'
                  : isExpired
                  ? 'Batas waktu pemasukan penawaran telah berakhir.'
                  : 'Dengan membuka halaman ini, status undangan Anda telah otomatis tercatat Diterima/Dilihat (Viewed). Silakan klik "Ajukan Penawaran Harga" untuk memasukkan harga satuan.'}
              </p>
            </div>
          </div>

          {!isExpired && myVendorInvitation?.status !== 'declined' && (
            <Link to={`/penawaran/create?undangan_id=${undangan.id}`} className="shrink-0">
              <Button variant="primary" size="sm" leftIcon={<Send className="w-4 h-4" />}>
                Ajukan Penawaran Sekarang
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* ── Card 1: Header Undangan & HPS ──────────────────────────── */}
      <Card>
        <CardBody className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-navy-900/5 text-navy-900 rounded-md border border-navy-900/15">
                  {undangan.nomor_undangan}
                </span>
                <UndanganStatusBadge status={undangan.status} />
              </div>

              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
                {undangan.hps?.nama_paket || 'Paket Pengadaan'}
              </h1>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Mengacu pada HPS:</span>
                <Link
                  to={`/hps/${undangan.hps_id}`}
                  className="font-mono font-semibold text-navy-500 hover:underline"
                >
                  {undangan.hps?.nomor_hps}
                </Link>
                <span>• Tahun Anggaran {undangan.hps?.fiscal_year}</span>
              </div>
            </div>

            {/* Kotak Jumlah Harga HPS & Batas Waktu */}
            {(() => {
              const rawSubtotal = (undangan.hps?.items && undangan.hps.items.length > 0)
                ? undangan.hps.items.reduce((acc, curr) => acc + (parseFloat(curr.subtotal) || 0), 0)
                : 0
              const jumlahHarga = rawSubtotal || Number(undangan.hps?.total_harga) || 0
              const ppn11 = Math.round(jumlahHarga * 0.11)
              const jumlahHargaHps = jumlahHarga + ppn11

              return (
                <div className="p-4 bg-navy-900 text-white rounded-xl text-right shrink-0 shadow-sm border border-navy-700 min-w-[240px]">
                  <div className="flex items-center justify-end gap-2">
                    <p className="text-[11px] font-medium text-gray-300 uppercase tracking-wider">
                      Jumlah Harga HPS
                    </p>
                    <span className="text-[9px] bg-navy-800 text-blue-200 px-1.5 py-0.5 rounded border border-navy-700 font-semibold">
                      PPN 11%
                    </span>
                  </div>
                  <p className="text-xl font-black font-mono text-white mt-0.5">
                    {formatRupiah(jumlahHargaHps)}
                  </p>
                  <div className="mt-2 pt-2 border-t border-navy-700/80 text-[11px] text-gray-300 flex items-center justify-end gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Batas: {formatDateTime(undangan.batas_waktu_penawaran)}</span>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Grid Informasi Jadwal & Pejabat PBJ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-navy-500" />
                Pejabat Pengadaan (PBJ)
              </span>
              <p className="font-semibold text-navy-900 text-sm">
                {undangan.pbj?.name || '-'}
              </p>
              <p className="text-gray-500 font-mono text-[11px]">
                {undangan.pbj?.email} {undangan.pbj?.phone ? `• ${undangan.pbj.phone}` : ''}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-navy-500" />
                Tanggal Terbit Undangan
              </span>
              <p className="font-medium text-navy-900">
                {undangan.tanggal_undangan ? formatDate(undangan.tanggal_undangan) : '-'}
              </p>
              <p className="text-gray-400 text-[11px]">
                {undangan.status === 'draft' ? 'Belum diterbitkan' : 'Resmi dikirim ke rekanan'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Batas Akhir Penawaran
              </span>
              <p className={`font-semibold ${isExpired ? 'text-danger' : 'text-navy-900'}`}>
                {formatDateTime(undangan.batas_waktu_penawaran)}
              </p>
              <p className="text-gray-400 text-[11px]">
                {isExpired ? 'Masa pemasukan penawaran telah lewat' : 'Rekanan aktif dapat memasukkan harga'}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Card 2: Daftar Rekanan yang Diundang (Hanya untuk Internal PBJ/Admin) ── */}
      {!isVendor && (
        <Card>
          <CardHeader
            title="Daftar Rekanan / Penyedia yang Diundang"
            subtitle="Pemantauan status penerimaan undangan dan keikutsertaan penawaran rekanan secara realtime"
          />
          <CardBody noPadding>
            <Table>
              <TableHeader>
                <TableHead className="w-12 text-center">No</TableHead>
                <TableHead>Nama Perusahaan Rekanan</TableHead>
                <TableHead className="w-36">NPWP</TableHead>
                <TableHead className="w-28">Kota</TableHead>
                <TableHead align="center" className="w-32">Status Undangan</TableHead>
                <TableHead align="right" className="w-40">Harga Penawaran</TableHead>
                <TableHead align="center" className="w-28">Aksi PBJ</TableHead>
              </TableHeader>
              <TableBody>
                {undangan.undanganVendors?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                      Belum ada penyedia yang didaftarkan pada undangan ini.
                    </td>
                  </tr>
                ) : (
                  undangan.undanganVendors.map((uv, index) => {
                    const penawaran = uv.penawaran

                    return (
                      <TableRow key={uv.id} isZebra={index % 2 === 1}>
                        <TableCell align="center" className="text-gray-400 font-mono text-xs">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-navy-900">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-navy-500 shrink-0" />
                            <span>{uv.vendor?.company_name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-600">
                          {uv.vendor?.npwp || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {uv.vendor?.city || '-'}
                        </TableCell>
                        <TableCell align="center">
                          <VendorInvitationStatusBadge status={uv.status} size="sm" />
                        </TableCell>
                        <TableCell align="right">
                          {penawaran ? (
                            <div>
                              <span className="font-mono font-bold text-xs text-navy-900 whitespace-nowrap">
                                {formatRupiah(penawaran.total_penawaran)}
                              </span>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                {formatDate(penawaran.submitted_at)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Belum Masuk</span>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {penawaran ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Link
                                to={`/penawaran/${penawaran.id}`}
                                title="Lihat Rincian Penawaran & Buka Negosiasi"
                              >
                                <Button variant="ghost" size="sm" className="p-1.5 text-navy-600 hover:text-navy-900">
                                  <Scale className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* ── Card 3: Rincian Barang Kebutuhan (Acuan Penawaran) ───────── */}
      <Card>
        <CardHeader
          title="Rincian Barang & Volume Kebutuhan (Acuan Penawaran)"
          subtitle={
            isVendor
              ? "Daftar spesifikasi teknis dan volume kebutuhan pengadaan. Silakan klik 'Ajukan Penawaran Harga' untuk memasukkan harga penawaran Anda."
              : "Volume barang bersifat baku/tetap dari HPS. Penyedia hanya akan menginput harga satuan penawaran."
          }
        />
        <CardBody className="p-6">
          <HpsItemTable
            items={undangan.hps?.items || []}
            totalHarga={undangan.hps?.total_harga}
            hidePrices={isVendor}
          />
        </CardBody>
      </Card>

      {/* ── Modal: Tolak Undangan Pengadaan (Khusus Rekanan) ────────── */}
      <Modal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleDeclineSubmit}>
          <ModalHeader
            title="Konfirmasi Penolakan Undangan"
            subtitle={`Nomor Undangan: ${undangan.nomor_undangan}`}
            onClose={() => setIsDeclineModalOpen(false)}
          />
          <ModalBody className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Perhatian Penyedia</p>
                <p className="mt-0.5 text-red-700">
                  Dengan menolak undangan ini, perusahaan Anda tidak dapat memasukkan penawaran harga untuk paket pengadaan ini. Status penolakan akan dicatat ke audit log instansi.
                </p>
              </div>
            </div>

            <Textarea
              label="Alasan Penolakan Undangan (Opsional)"
              placeholder="Contoh: Keterbatasan kapasitas produksi / waktu pengerjaan tidak mencukupi..."
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeclineModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={respondMutation.isPending}
            >
              Ya, Tolak Undangan
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}

export default UndanganDetailPage
