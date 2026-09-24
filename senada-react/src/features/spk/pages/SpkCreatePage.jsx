import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateSpk, useAvailableNegosiasi } from '../hooks/useSpk'
import { Card, CardHeader, CardBody, CardFooter } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { formatRupiah } from '../../../utils/formatters'
import {
  ArrowLeft,
  FileSignature,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Scale,
} from 'lucide-react'

export function SpkCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateSpk()

  const { data, isLoading } = useAvailableNegosiasi()
  const availableNegosiasi = data?.data || []

  // Form states
  const [selectedNegosiasiId, setSelectedNegosiasiId] = useState('')
  const [nomorSpk, setNomorSpk] = useState('')
  const [tanggalSpk, setTanggalSpk] = useState(new Date().toISOString().split('T')[0])
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().split('T')[0])
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [formError, setFormError] = useState('')

  const selectedNego = availableNegosiasi.find((n) => n.id === selectedNegosiasiId)
  const vendor = selectedNego?.penawaran?.undanganVendor?.vendor
  const hps = selectedNego?.penawaran?.undanganVendor?.undangan?.hps

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!selectedNegosiasiId) {
      setFormError('Silakan pilih hasil negosiasi yang telah disetujui.')
      return
    }

    if (!tanggalMulai || !tanggalSelesai) {
      setFormError('Tanggal mulai dan tanggal selesai pekerjaan wajib ditentukan.')
      return
    }

    if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {
      setFormError('Tanggal selesai pekerjaan tidak boleh sebelum tanggal mulai.')
      return
    }

    try {
      const payload = {
        negosiasi_id: selectedNegosiasiId,
        nomor_spk: nomorSpk.trim() || undefined,
        tanggal_spk: tanggalSpk,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
      }

      const res = await createMutation.mutateAsync(payload)

      if (res.success && res.data) {
        navigate(`/spk/${res.data.id}`)
      } else {
        navigate('/spk')
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Gagal menerbitkan Surat Perintah Kerja (SPK).'
      )
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* ── Breadcrumb ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          to="/spk"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar SPK</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="p-2 bg-navy-900 text-white rounded-lg inline-flex">
          <FileSignature className="w-5 h-5 text-blue-300" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight">
            Penerbitan Surat Perintah Kerja (SPK) Baru
          </h1>
          <p className="text-xs text-gray-500">
            Tahap 5: PPK membuat kontrak kerja resmi dari kesepakatan negosiasi harga (AGENTS.md §4 Tahap 5)
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="font-medium">{formError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Card 1: Pilih Kesepakatan Negosiasi ────────────────────── */}
        <Card>
          <CardHeader
            title="1. Pilih Paket Hasil Negosiasi Disetujui"
            subtitle="Menampilkan paket yang telah melalui negosiasi disetujui (status: accepted) dan belum memiliki kontrak SPK"
          />
          <CardBody className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Hasil Negosiasi Disetujui *
              </label>

              {isLoading ? (
                <p className="text-xs text-gray-400">Memuat data negosiasi...</p>
              ) : availableNegosiasi.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  Tidak ada hasil negosiasi yang siap dibuatkan SPK. Pastikan penyedia telah menyetujui usulan negosiasi harga pada Tahap 4.
                </div>
              ) : (
                <select
                  required
                  value={selectedNegosiasiId}
                  onChange={(e) => setSelectedNegosiasiId(e.target.value)}
                  className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500 font-medium"
                >
                  <option value="">-- Pilih Paket Negosiasi Disetujui --</option>
                  {availableNegosiasi.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.penawaran?.undanganVendor?.undangan?.hps?.nama_paket} —{' '}
                      {n.penawaran?.undanganVendor?.vendor?.company_name} (Nilai Nego:{' '}
                      {formatRupiah(n.harga_usulan)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Preview Detail Terpilih */}
            {selectedNego && (
              <div className="p-4 bg-navy-900/5 rounded-xl border border-navy-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-navy-900">
                    {hps?.nama_paket}
                  </h4>
                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-navy-500" />
                    <span>Penyedia: <strong>{vendor?.company_name}</strong> (NPWP: {vendor?.npwp})</span>
                  </p>
                  <p className="text-[11px] text-gray-400">
                    HPS Pagu: {formatRupiah(hps?.total_harga)} • Tahun Anggaran {hps?.fiscal_year}
                  </p>
                </div>

                <div className="sm:text-right bg-white p-3 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">
                    Nilai Kontrak Final (Nego)
                  </span>
                  <p className="text-base font-bold font-mono text-navy-900">
                    {formatRupiah(selectedNego.harga_usulan)}
                  </p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* ── Card 2: Informasi Administrasi Kontrak ─────────────────── */}
        <Card>
          <CardHeader
            title="2. Nomor Dokumen & Jangka Waktu Kerja"
            subtitle="Tentukan tanggal kontrak dan masa pelaksanaan pekerjaan oleh rekanan"
          />
          <CardBody className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nomor Dokumen SPK / Surat Pesanan (Opsional)"
                placeholder="Kosongkan untuk nomor otomatis (SPK/TAHUN/BULAN/XXXX)"
                value={nomorSpk}
                onChange={(e) => setNomorSpk(e.target.value)}
                helperText="Jika dikosongkan, sistem akan membuat nomor urut resmi secara otomatis."
              />

              <Input
                label="Tanggal Penandatanganan SPK"
                type="date"
                required
                value={tanggalSpk}
                onChange={(e) => setTanggalSpk(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Input
                label="Tanggal Mulai Pekerjaan"
                type="date"
                required
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
              />

              <Input
                label="Tanggal Selesai Pekerjaan (Batas Akhir)"
                type="date"
                required
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
                helperText="Jangka waktu pelaksanaan fisik barang/jasa oleh rekanan."
              />
            </div>
          </CardBody>

          <CardFooter>
            <Link to="/spk">
              <Button type="button" variant="secondary">
                Batal
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!selectedNegosiasiId}
              isLoading={createMutation.isPending}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Terbitkan Draf SPK
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default SpkCreatePage
