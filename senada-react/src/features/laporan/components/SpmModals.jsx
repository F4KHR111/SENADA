import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../../../components/Modal'
import { Button } from '../../../components/Button'
import { Input, Textarea } from '../../../components/Input'
import { formatRupiah, formatDate } from '../../../utils/formatters'
import {
  Copy,
  Check,
  Building2,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  FileCheck2,
} from 'lucide-react'

/**
 * SpmExportModal — Modal view-only untuk mengekspor/menyalin data Resume SPK ke format aplikasi SAKTI (Kemenkeu)
 * AGENTS.md §4 Tahap 7: SAKTI adalah sistem eksternal, SENADA menyediakan data view/export.
 */
export function SpmExportModal({ isOpen, onClose, spk }) {
  const [copied, setCopied] = useState(false)

  if (!spk) return null

  const vendor = spk.vendor || spk.spk?.vendor
  const hps = spk.negosiasi?.penawaran?.undanganVendor?.undangan?.hps || spk.spk?.hps

  const exportText = `=== DATA PEMBUATAN SPM PADA APLIKASI SAKTI ===
Nomor SPK/Kontrak   : ${spk.nomor_spk || spk.spk?.nomor_spk}
Tanggal SPK         : ${spk.tanggal_spk || spk.spk?.tanggal_spk}
Paket Pengadaan     : ${hps?.nama_paket || 'Pengadaan Barang dan Jasa'}
Tahun Anggaran      : ${hps?.fiscal_year || new Date().getFullYear()}
Nilai Tagihan Bruto : Rp ${parseFloat(spk.nilai_kontrak || spk.spk?.nilai_kontrak || 0).toLocaleString('id-ID')}
Penerima (Penyedia) : ${vendor?.company_name || '-'}
NPWP Penyedia       : ${vendor?.npwp || '-'}
Bank Penerima       : ${vendor?.bank_name || '-'}
Nomor Rekening      : ${vendor?.bank_account_number || '-'}
Nama Pemilik Rek    : ${vendor?.bank_account_holder || '-'}`

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader
        title="Ekspor Data untuk Aplikasi SAKTI (Kemenkeu)"
        subtitle={`Nomor Kontrak: ${spk.nomor_spk || spk.spk?.nomor_spk}`}
        onClose={onClose}
      />
      <ModalBody className="space-y-4">
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-navy-900 leading-relaxed">
          <p className="font-semibold text-navy-900">Format Rekapitulasi Pembayaran SAKTI</p>
          <p className="text-gray-600 mt-0.5">
            Gunakan data di bawah ini untuk menginput Surat Perintah Membayar (SPM) pada aplikasi SAKTI. Salin teks atau gunakan ringkasan terstruktur berikut.
          </p>
        </div>

        {/* Tabel Parameter SAKTI */}
        <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
          <div className="grid grid-cols-3 p-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-500">
            <span>Parameter SAKTI</span>
            <span className="col-span-2">Nilai Sumber (SENADA)</span>
          </div>

          <div className="divide-y divide-gray-100 p-1">
            <div className="grid grid-cols-3 p-2.5">
              <span className="text-gray-500 font-medium">Uraian Pembayaran:</span>
              <span className="col-span-2 font-bold text-navy-900">
                {hps?.nama_paket || 'Pengadaan Barang/Jasa'}
              </span>
            </div>

            <div className="grid grid-cols-3 p-2.5">
              <span className="text-gray-500 font-medium">Nomor Kontrak / SPK:</span>
              <span className="col-span-2 font-mono font-bold text-navy-900">
                {spk.nomor_spk || spk.spk?.nomor_spk}
              </span>
            </div>

            <div className="grid grid-cols-3 p-2.5">
              <span className="text-gray-500 font-medium">Nilai Pembayaran Bruto:</span>
              <span className="col-span-2 font-mono font-bold text-navy-900">
                {formatRupiah(spk.nilai_kontrak || spk.spk?.nilai_kontrak)}
              </span>
            </div>

            <div className="grid grid-cols-3 p-2.5">
              <span className="text-gray-500 font-medium">Nama Rekanan:</span>
              <span className="col-span-2 font-semibold text-navy-900">
                {vendor?.company_name || '-'}
              </span>
            </div>

            <div className="grid grid-cols-3 p-2.5">
              <span className="text-gray-500 font-medium">NPWP Rekanan:</span>
              <span className="col-span-2 font-mono">
                {vendor?.npwp || '-'}
              </span>
            </div>

            <div className="grid grid-cols-3 p-2.5">
              <span className="text-gray-500 font-medium">Rekening Tujuan:</span>
              <span className="col-span-2 font-mono">
                {vendor?.bank_name || '-'} — {vendor?.bank_account_number || '-'} a.n {vendor?.bank_account_holder || '-'}
              </span>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Tutup
        </Button>
        <Button
          variant="primary"
          leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          onClick={handleCopy}
        >
          {copied ? 'Tersalin ke Clipboard!' : 'Salin Teks Lengkap SAKTI'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

/**
 * InputSpmModal — Untuk mencatat nomor SPM hasil pemrosesan di aplikasi SAKTI
 */
export function InputSpmModal({
  isOpen,
  onClose,
  onSubmit,
  spkList = [],
  initialSpkId = '',
  isSubmitting,
}) {
  const [spkId, setSpkId] = useState(initialSpkId || '')
  const [nomorSpm, setNomorSpm] = useState('')
  const [tanggalSpm, setTanggalSpm] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState('processed')

  useEffect(() => {
    if (initialSpkId) {
      setSpkId(initialSpkId)
    } else if (spkList.length > 0 && !spkId) {
      setSpkId(spkList[0].id)
    }
  }, [initialSpkId, isOpen, spkList])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!spkId || !nomorSpm.trim()) {
      alert('Pilih SPK dan masukkan nomor SPM dari SAKTI.')
      return
    }

    onSubmit({
      spk_id: spkId,
      nomor_spm: nomorSpm.trim(),
      tanggal_spm: tanggalSpm,
      status,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title="Pencatatan Nomor SPM dari Aplikasi SAKTI"
          subtitle="Masukkan nomor referensi SPM yang telah diterbitkan oleh PPSPM di aplikasi SAKTI"
          onClose={onClose}
        />
        <ModalBody className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Pilih Kontrak SPK *
            </label>
            <select
              required
              value={spkId}
              onChange={(e) => setSpkId(e.target.value)}
              className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500"
            >
              <option value="">-- Pilih Kontrak SPK --</option>
              {spkList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomor_spk} — {s.vendor?.company_name} ({formatRupiah(s.nilai_kontrak)})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nomor SPM dari SAKTI *"
            placeholder="Contoh: 00045/SPM-LS/2026"
            required
            value={nomorSpm}
            onChange={(e) => setNomorSpm(e.target.value)}
          />

          <Input
            label="Tanggal Terbit SPM *"
            type="date"
            required
            value={tanggalSpm}
            onChange={(e) => setTanggalSpm(e.target.value)}
          />

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Status Pemrosesan SPM
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500"
            >
              <option value="processed">Processed (SPM Berhasil Terbit di SAKTI)</option>
              <option value="pending">Pending (Menunggu Verifikasi KPPN)</option>
            </select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Simpan Nomor SPM
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

/**
 * InputRealisasiModal — Untuk menginput realisasi anggaran internal (Petugas Laporan Realisasi)
 */
export function InputRealisasiModal({
  isOpen,
  onClose,
  onSubmit,
  spkList = [],
  initialSpkId = '',
  isSubmitting,
}) {
  const [spkId, setSpkId] = useState(initialSpkId || '')
  const [nilaiRealisasi, setNilaiRealisasi] = useState('')
  const [tanggalRealisasi, setTanggalRealisasi] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [keterangan, setKeterangan] = useState('')

  useEffect(() => {
    const targetId = initialSpkId || (spkList.length > 0 ? spkList[0].id : '')
    if (targetId) {
      setSpkId(targetId)
      const found = spkList.find((s) => s.id === targetId)
      if (found) {
        setNilaiRealisasi(parseFloat(found.nilai_kontrak) || '')
      }
    }
  }, [initialSpkId, isOpen, spkList])

  const selectedSpk = spkList.find((s) => s.id === spkId)

  // Otomatis isi nilai realisasi sesuai nilai kontrak saat SPK dipilih
  const handleSelectSpk = (id) => {
    setSpkId(id)
    const spk = spkList.find((s) => s.id === id)
    if (spk) {
      setNilaiRealisasi(parseFloat(spk.nilai_kontrak) || '')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!spkId || !nilaiRealisasi) {
      alert('Pilih SPK dan tentukan nominal realisasi.')
      return
    }

    onSubmit({
      spk_id: spkId,
      nilai_realisasi: parseFloat(nilaiRealisasi),
      tanggal_realisasi: tanggalRealisasi,
      keterangan: keterangan || undefined,
      status: 'submitted',
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title="Input Laporan Realisasi Keuangan Internal"
          subtitle="Pencatatan realisasi penyerapan anggaran belanja pengadaan"
          onClose={onClose}
        />
        <ModalBody className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Pilih Kontrak SPK *
            </label>
            <select
              required
              value={spkId}
              onChange={(e) => handleSelectSpk(e.target.value)}
              className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500"
            >
              <option value="">-- Pilih Kontrak SPK --</option>
              {spkList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomor_spk} — {s.vendor?.company_name} ({formatRupiah(s.nilai_kontrak)})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nilai Realisasi Anggaran (Rp) *"
            type="number"
            min="1"
            step="any"
            required
            value={nilaiRealisasi}
            onChange={(e) => setNilaiRealisasi(e.target.value)}
            helperText={
              nilaiRealisasi
                ? `Terbaca: ${formatRupiah(parseFloat(nilaiRealisasi) || 0)}`
                : ''
            }
          />

          <Input
            label="Tanggal Realisasi Pembukuan *"
            type="date"
            required
            value={tanggalRealisasi}
            onChange={(e) => setTanggalRealisasi(e.target.value)}
          />

          <Textarea
            label="Keterangan Realisasi (Opsional)"
            placeholder="Contoh: Realisasi pembayaran termin 100% setelah BAST selesai..."
            rows={3}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Simpan Realisasi
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
