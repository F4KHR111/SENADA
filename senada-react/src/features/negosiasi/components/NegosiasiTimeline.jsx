import React, { useState } from 'react'
import { NegosiasiStatusBadge } from './NegosiasiStatusBadge'
import { Button } from '../../../components/Button'
import { Card, CardHeader, CardBody } from '../../../components/Card'
import { Input, Textarea } from '../../../components/Input'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../../../components/Modal'
import { formatRupiah, formatDateTime } from '../../../utils/formatters'
import useAuthStore from '../../../store/authStore'
import {
  Scale,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  User,
  AlertCircle,
  TrendingDown,
} from 'lucide-react'

export function NegosiasiTimeline({
  penawaran,
  negosiasiList = [],
  onProposeRound,
  onRespondRound,
  isSubmitting = false,
}) {
  const { user } = useAuthStore()
  const isPBJ = user?.roles?.includes('pbj') || user?.roles?.includes('admin')
  const isVendor = user?.roles?.includes('penyedia')

  // State Modal Usulan Negosiasi (PBJ)
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false)
  const [hargaUsulan, setHargaUsulan] = useState('')
  const [catatanUsulan, setCatatanUsulan] = useState('')

  // State Modal Respon (Vendor)
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false)
  const [activeNegosiasiId, setActiveNegosiasiId] = useState(null)
  const [respondStatus, setRespondStatus] = useState('accepted') // 'accepted' | 'rejected'
  const [catatanRespon, setCatatanRespon] = useState('')

  const pendingRound = negosiasiList.find((n) => n.status === 'pending')
  const lastRound = negosiasiList[negosiasiList.length - 1]

  // Kondisi apakah PBJ dapat mengajukan ronde baru:
  // Penawaran statusnya 'submitted' atau 'negotiating', dan tidak ada ronde yang masih pending
  const canPBJPropose =
    isPBJ &&
    ['submitted', 'negotiating'].includes(penawaran?.status) &&
    !pendingRound

  const handleOpenPropose = () => {
    // Default harga usulan: sedikit di bawah penawaran atau ronde sebelumnya
    const lastPrice = lastRound
      ? parseFloat(lastRound.harga_usulan)
      : parseFloat(penawaran?.total_penawaran || 0)
    setHargaUsulan(lastPrice ? Math.round(lastPrice * 0.95) : '')
    setCatatanUsulan('')
    setIsProposeModalOpen(true)
  }

  const handleProposeSubmit = async (e) => {
    e.preventDefault()
    if (!hargaUsulan || parseFloat(hargaUsulan) <= 0) {
      alert('Masukkan harga usulan negosiasi yang valid.')
      return
    }

    await onProposeRound({
      penawaran_id: penawaran.id,
      harga_usulan: parseFloat(hargaUsulan),
      catatan: catatanUsulan || undefined,
    })

    setIsProposeModalOpen(false)
  }

  const handleOpenRespond = (negosiasiId, status) => {
    setActiveNegosiasiId(negosiasiId)
    setRespondStatus(status)
    setCatatanRespon('')
    setIsRespondModalOpen(true)
  }

  const handleRespondSubmit = async (e) => {
    e.preventDefault()
    await onRespondRound(activeNegosiasiId, {
      status: respondStatus,
      catatan: catatanRespon || undefined,
    })
    setIsRespondModalOpen(false)
  }

  return (
    <Card>
      <CardHeader
        title="Riwayat & Proses Negosiasi Harga"
        subtitle="Ronde tawar-menawar harga antara Pejabat Pengadaan (PBJ) dan Penyedia hingga tercapai kesepakatan final (AGENTS.md §4 Tahap 4)"
        action={
          canPBJPropose && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleOpenPropose}
            >
              Ajukan Usulan Nego (Ronde #{negosiasiList.length + 1})
            </Button>
          )
        }
      />

      <CardBody className="p-6 space-y-6">
        {/* Ringkasan Nilai Awal vs Nilai Kesepakatan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Nilai Penawaran Awal Vendor
            </span>
            <p className="text-base font-bold font-mono text-navy-900 mt-0.5">
              {formatRupiah(penawaran?.total_penawaran)}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Total Ronde Berjalan
            </span>
            <p className="text-base font-bold text-navy-900 mt-0.5">
              {negosiasiList.length} Ronde
            </p>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Status Kesepakatan Akhir
            </span>
            <p className="text-base font-bold mt-0.5">
              {penawaran?.status === 'approved' ? (
                <span className="text-success flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-4 h-4" /> Sepakat: {formatRupiah(lastRound?.harga_usulan)}
                </span>
              ) : (
                <span className="text-gray-500 font-medium text-xs">
                  {penawaran?.status === 'negotiating'
                    ? 'Dalam proses tawar-menawar'
                    : 'Belum dimulai negosiasi'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Timeline Ronde Negosiasi */}
        {negosiasiList.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs">
            Belum ada ronde negosiasi yang diajukan untuk penawaran ini.
            {canPBJPropose && (
              <div className="mt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Scale className="w-4 h-4 text-navy-500" />}
                  onClick={handleOpenPropose}
                >
                  Mulai Negosiasi Harga Sekarang
                </Button>
              </div>
            )}          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
            {negosiasiList.map((item, index) => {
              const diffPercent =
                penawaran?.total_penawaran > 0
                  ? ((parseFloat(item.harga_usulan) - parseFloat(penawaran.total_penawaran)) /
                      parseFloat(penawaran.total_penawaran)) *
                    100
                  : 0

              const isThisPending = item.status === 'pending'
              const canVendorRespond = isVendor && isThisPending

              // Node icon & color
              const nodeColor =
                item.status === 'accepted'
                  ? 'bg-emerald-600 ring-emerald-100 text-white'
                  : item.status === 'rejected'
                  ? 'bg-red-600 ring-red-100 text-white'
                  : 'bg-navy-900 ring-navy-100 text-white'

              return (
                <div key={item.id} className="relative">
                  {/* Timeline Dot Node */}
                  <div
                    className={`absolute -left-6 top-4 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center ring-4 text-[11px] font-mono font-bold shadow-xs ${nodeColor}`}
                  >
                    {item.round}
                  </div>

                  {/* Timeline Card */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      item.status === 'accepted'
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : item.status === 'rejected'
                        ? 'border-red-200 bg-red-50/20'
                        : 'border-navy-200 bg-white shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 bg-navy-900 text-white rounded-md text-xs font-bold font-mono">
                          Ronde #{item.round}
                        </span>
                        <NegosiasiStatusBadge status={item.status} size="sm" />
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDateTime(item.created_at)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">
                          Harga Usulan PBJ
                        </span>
                        <p className="text-base font-bold font-mono text-navy-900 mt-0.5">
                          {formatRupiah(item.harga_usulan)}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3 text-navy-500" />
                          <span>{diffPercent.toFixed(1)}% dari penawaran awal</span>
                        </p>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-navy-500" />
                          Diajukan Oleh: {item.pengaju?.name || 'Pejabat PBJ'}
                        </span>
                        {item.catatan ? (
                          <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg whitespace-pre-line border border-gray-200/60">
                            {item.catatan}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Tidak ada catatan negosiasi.</p>
                        )}
                      </div>
                    </div>

                    {/* Aksi Respon untuk Rekanan */}
                    {canVendorRespond && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                        <div className="flex items-center gap-2 text-xs text-amber-900">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            Menunggu persetujuan rekanan atas harga usulan <strong>{formatRupiah(item.harga_usulan)}</strong>:
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<XCircle className="w-4 h-4" />}
                            onClick={() => handleOpenRespond(item.id, 'rejected')}
                          >
                            Tolak Usulan
                          </Button>

                          <Button
                            variant="success"
                            size="sm"
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                            onClick={() => handleOpenRespond(item.id, 'accepted')}
                          >
                            Setujui Harga Nego
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardBody>

      {/* ── Modal 1: Pengajuan Usulan Negosiasi (PBJ) ────────────────── */}
      <Modal
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleProposeSubmit}>
          <ModalHeader
            title={`Pengajuan Ronde Negosiasi #${negosiasiList.length + 1}`}
            subtitle="Ajukan harga usulan negosiasi kepada rekanan penyedia"
            onClose={() => setIsProposeModalOpen(false)}
          />
          <ModalBody className="space-y-4">
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-navy-900 flex items-start gap-2.5">
              <Scale className="w-4 h-4 text-navy-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Ketentuan Negosiasi PBJ</p>
                <p className="text-gray-600 mt-0.5">
                  Harga usulan akan diteruskan kepada rekanan. Rekanan berhak menyetujui (*accepted*) atau menolak (*rejected*). Jika disetujui, harga ini menjadi acuan kontrak SPK.
                </p>
              </div>
            </div>

            <Input
              label="Harga Usulan Negosiasi (Rp) *"
              type="number"
              min="1"
              step="any"
              required
              placeholder="Contoh: 48500000"
              value={hargaUsulan}
              onChange={(e) => setHargaUsulan(e.target.value)}
              helperText={
                hargaUsulan ? `Terbaca: ${formatRupiah(parseFloat(hargaUsulan) || 0)}` : ''
              }
            />

            <Textarea
              label="Catatan / Alasan Usulan Negosiasi"
              placeholder="Tuliskan argumen harga pasar, diskon kuantitas, atau penyesuaian biaya..."
              rows={3}
              value={catatanUsulan}
              onChange={(e) => setCatatanUsulan(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsProposeModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Scale className="w-4 h-4" />}
            >
              Kirim Usulan Nego
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ── Modal 2: Respon Negosiasi (Rekanan) ──────────────────────── */}
      <Modal
        isOpen={isRespondModalOpen}
        onClose={() => setIsRespondModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleRespondSubmit}>
          <ModalHeader
            title={
              respondStatus === 'accepted'
                ? 'Konfirmasi Persetujuan Harga Negosiasi'
                : 'Konfirmasi Penolakan Usulan Negosiasi'
            }
            subtitle="Keputusan Anda akan dicatat resmi ke dalam sistem pengadaan"
            onClose={() => setIsRespondModalOpen(false)}
          />
          <ModalBody className="space-y-4">
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                respondStatus === 'accepted'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {respondStatus === 'accepted' ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">
                  {respondStatus === 'accepted'
                    ? 'Anda menyetujui harga kesepakatan negosiasi.'
                    : 'Anda menolak usulan harga ini.'}
                </p>
                <p className="mt-0.5 opacity-90">
                  {respondStatus === 'accepted'
                    ? 'Status penawaran Anda akan berubah menjadi "Disetujui" dan proses berlanjut ke penerbitan SPK (Tahap 5).'
                    : 'PBJ dapat mengajukan ronde penawaran berikutnya atau menutup proses negosiasi.'}
                </p>
              </div>
            </div>

            <Textarea
              label="Catatan Respon (Opsional)"
              placeholder={
                respondStatus === 'accepted'
                  ? 'Contoh: Kami menyetujui penyesuaian harga dan siap melaksanakan pengadaan...'
                  : 'Contoh: Biaya bahan baku tidak memungkinkan harga di bawah nominal tersebut...'
              }
              rows={3}
              value={catatanRespon}
              onChange={(e) => setCatatanRespon(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsRespondModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant={respondStatus === 'accepted' ? 'success' : 'danger'}
              isLoading={isSubmitting}
            >
              {respondStatus === 'accepted' ? 'Ya, Setujui Harga' : 'Tolak Usulan Ini'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </Card>
  )
}

export default NegosiasiTimeline
