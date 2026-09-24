import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  useCreateUndangan,
  useAvailableHps,
  useAvailableVendors,
} from '../hooks/useUndangan'
import { Card, CardHeader, CardBody, CardFooter } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { Badge } from '../../../components/Badge'
import { formatRupiah } from '../../../utils/formatters'
import {
  ArrowLeft,
  Mail,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Check,
  Star,
} from 'lucide-react'

export function UndanganCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateUndangan()

  // Queries for options
  const { data: hpsData, isLoading: isLoadingHps } = useAvailableHps()
  const { data: vendorData, isLoading: isLoadingVendors } = useAvailableVendors()

  const availableHps = hpsData?.data || []
  const availableVendors = vendorData?.data || []

  // Form states
  const [selectedHpsId, setSelectedHpsId] = useState('')
  const [tanggalUndangan, setTanggalUndangan] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [batasWaktu, setBatasWaktu] = useState('')
  const [selectedVendorIds, setSelectedVendorIds] = useState([])
  const [formError, setFormError] = useState('')

  // HPS terpilih
  const selectedHps = availableHps.find((h) => h.id === selectedHpsId)

  // Toggle single vendor
  const handleToggleVendor = (vendorId) => {
    setSelectedVendorIds((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    )
  }

  // Toggle select all vendors
  const handleSelectAllVendors = () => {
    if (selectedVendorIds.length === availableVendors.length) {
      setSelectedVendorIds([])
    } else {
      setSelectedVendorIds(availableVendors.map((v) => v.id))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!selectedHpsId) {
      setFormError('Silakan pilih paket HPS yang akan dibuatkan undangan.')
      return
    }

    if (!batasWaktu) {
      setFormError('Batas waktu penerimaan penawaran harga wajib ditentukan.')
      return
    }

    const deadline = new Date(batasWaktu)
    if (deadline <= new Date()) {
      setFormError('Batas waktu penawaran harus berada di masa mendatang.')
      return
    }

    if (selectedVendorIds.length === 0) {
      setFormError('Pilih minimal 1 penyedia/rekanan untuk diundang.')
      return
    }

    try {
      const payload = {
        hps_id: selectedHpsId,
        tanggal_undangan: tanggalUndangan || undefined,
        batas_waktu_penawaran: new Date(batasWaktu).toISOString(),
        vendor_ids: selectedVendorIds,
      }

      const res = await createMutation.mutateAsync(payload)

      if (res.success && res.data) {
        navigate(`/undangan/${res.data.id}`)
      } else {
        navigate('/undangan')
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Gagal menerbitkan paket undangan pengadaan.'
      )
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* ── Breadcrumb Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          to="/undangan"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Undangan</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="p-2 bg-navy-900 text-white rounded-lg inline-flex">
          <Mail className="w-5 h-5 text-blue-300" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight">
            Penerbitan Undangan Pengadaan Baru
          </h1>
          <p className="text-xs text-gray-500">
            Tahap 2: Pejabat Pengadaan (PBJ) mengundang penyedia rekanan dari HPS terverifikasi (AGENTS.md §4)
          </p>
        </div>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {formError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="font-medium">{formError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Card 1: Pemilihan Paket HPS ────────────────────────────── */}
        <Card>
          <CardHeader
            title="1. Pilih Paket HPS Acuan"
            subtitle="Hanya menampilkan paket HPS yang sudah berstatus 'verified' atau 'fixed' dan belum memiliki undangan aktif"
          />
          <CardBody className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Paket HPS Terverifikasi *
              </label>

              {isLoadingHps ? (
                <p className="text-xs text-gray-400">Memuat paket HPS...</p>
              ) : availableHps.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  Tidak ada paket HPS yang siap diundang. Pastikan ada HPS berstatus <strong>'verified'</strong> atau <strong>'fixed'</strong> yang belum dibuatkan undangan.
                </div>
              ) : (
                <select
                  required
                  value={selectedHpsId}
                  onChange={(e) => setSelectedHpsId(e.target.value)}
                  className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500 font-medium"
                >
                  <option value="">-- Pilih Paket HPS Terverifikasi --</option>
                  {availableHps.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.nomor_hps} — {h.nama_paket} ({formatRupiah(h.total_harga)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Preview Detail HPS Terpilih */}
            {selectedHps && (
              <div className="p-4 bg-navy-900/5 rounded-xl border border-navy-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
                <div>
                  <span className="text-[11px] font-mono font-bold text-navy-500">
                    {selectedHps.nomor_hps}
                  </span>
                  <h4 className="text-sm font-bold text-navy-900 mt-0.5">
                    {selectedHps.nama_paket}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tahun Anggaran: {selectedHps.fiscal_year} • Status: {selectedHps.status.toUpperCase()}
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">
                    Nilai Total Pagu HPS
                  </span>
                  <p className="text-base font-bold font-mono text-navy-900">
                    {formatRupiah(selectedHps.total_harga)}
                  </p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* ── Card 2: Jadwal & Batas Akhir Penawaran ──────────────────── */}
        <Card>
          <CardHeader
            title="2. Jadwal & Masa Penawaran"
            subtitle="Tentukan tanggal surat undangan dan batas waktu rekanan dapat menginput penawaran"
          />
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tanggal Surat Undangan"
                type="date"
                required
                value={tanggalUndangan}
                onChange={(e) => setTanggalUndangan(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
              />

              <Input
                label="Batas Akhir Pemasukan Penawaran (Deadline)"
                type="datetime-local"
                required
                value={batasWaktu}
                onChange={(e) => setBatasWaktu(e.target.value)}
                leftIcon={<Clock className="w-4 h-4" />}
                helperText="Setelah waktu ini berakhir, rekanan tidak dapat mengirim atau mengubah harga penawaran."
              />
            </div>
          </CardBody>
        </Card>

        {/* ── Card 3: Pemilihan Rekanan Terverifikasi ─────────────────── */}
        <Card>
          <CardHeader
            title="3. Pilih Rekanan / Penyedia yang Diundang"
            subtitle="Pilih satu atau lebih penyedia yang memiliki status profil 'verified'"
            action={
              availableVendors.length > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectAllVendors}
                >
                  {selectedVendorIds.length === availableVendors.length
                    ? 'Batal Pilih Semua'
                    : 'Pilih Semua Rekanan'}
                </Button>
              )
            }
          />
          <CardBody className="p-6 space-y-3">
            {isLoadingVendors ? (
              <p className="text-xs text-gray-400">Memuat daftar penyedia...</p>
            ) : availableVendors.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 text-center">
                Belum ada profil penyedia berstatus 'verified' dalam sistem.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableVendors.map((vendor) => {
                  const isChecked = selectedVendorIds.includes(vendor.id)

                  return (
                    <div
                      key={vendor.id}
                      onClick={() => handleToggleVendor(vendor.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                        isChecked
                          ? 'border-navy-500 bg-navy-50/40 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 border transition-colors ${
                            isChecked
                              ? 'bg-navy-900 border-navy-900 text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-navy-900">
                            {vendor.company_name}
                          </p>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                            NPWP: {vendor.npwp}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Kota: {vendor.city || '-'} • Telp: {vendor.phone || '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge variant="success" size="sm">
                          Verified
                        </Badge>
                        {vendor.total_evaluations > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{parseFloat(vendor.average_score).toFixed(1)}</span>
                            <span className="text-[10px] text-amber-600/80 font-normal">
                              ({vendor.total_evaluations})
                            </span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">
                            Belum ada rating
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="pt-2 text-xs text-gray-500 flex items-center justify-between border-t border-gray-100">
              <span>
                Dipilih: <strong className="text-navy-900">{selectedVendorIds.length} penyedia</strong>
              </span>
              <span>Rekanan dapat lebih dari satu (Undangan Terbuka / Terbatas)</span>
            </div>
          </CardBody>

          <CardFooter>
            <Link to="/undangan">
              <Button type="button" variant="secondary">
                Batal
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={createMutation.isPending}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Simpan Draf Undangan
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default UndanganCreatePage
