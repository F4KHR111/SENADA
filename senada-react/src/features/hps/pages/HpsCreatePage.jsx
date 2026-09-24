import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCreateHps, useUpdateHps, useHpsDetail } from '../hooks/useHps'
import { Card, CardHeader, CardBody, CardFooter } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import { Input, Textarea } from '../../../components/Input'
import { formatRupiah, terbilang } from '../../../utils/formatters'
import { HpsExcelImportModal } from '../components/HpsExcelImportModal'
import { downloadHpsTemplate } from '../utils/excelHpsHelper'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  Lock,
  FileDown,
  Info,
  X,
  PencilLine,
} from 'lucide-react'

export function HpsCreatePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const createMutation = useCreateHps()
  const updateMutation = useUpdateHps()

  // Load existing HPS if in edit mode
  const { data: detailData, isLoading: isLoadingDetail } = useHpsDetail(id)
  const existingHps = detailData?.data

  // Form states
  const [namaPaket, setNamaPaket] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear())
  const [selectedFile, setSelectedFile] = useState(null)
  const [formError, setFormError] = useState('')

  // Excel Import states
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false)
  const [excelImportedNotice, setExcelImportedNotice] = useState(null)

  // Dynamic rows barang/jasa
  const [items, setItems] = useState([
    {
      id: 'item-1',
      nama_barang: '',
      spesifikasi: '',
      satuan: 'Unit',
      volume: 1,
      harga_satuan: 0,
    },
  ])

  // Handler saat data dari Excel berhasil diimpor
  const handleImportSuccess = (importedItems, mode, fileName, metadata) => {
    if (mode === 'replace') {
      setItems(importedItems)
      // Auto-fill paket info jika kosong atau jika replace mode dan data tersedia di Excel
      if (metadata) {
        if (metadata.nama_paket && (!namaPaket || namaPaket.trim() === '')) {
          setNamaPaket(metadata.nama_paket)
        }
        if (metadata.fiscal_year) {
          setFiscalYear(metadata.fiscal_year)
        }
        if (metadata.deskripsi && (!deskripsi || deskripsi.trim() === '')) {
          setDeskripsi(metadata.deskripsi)
        }
      }
    } else {
      setItems((prev) => [...prev, ...importedItems])
    }
    setExcelImportedNotice({
      count: importedItems.length,
      fileName: fileName,
      mode: mode,
    })
  }

  // Populate data if in edit mode
  useEffect(() => {
    if (isEditMode && existingHps) {
      setNamaPaket(existingHps.nama_paket || '')
      setDeskripsi(existingHps.deskripsi || '')
      setFiscalYear(existingHps.fiscal_year || new Date().getFullYear())
      if (Array.isArray(existingHps.items) && existingHps.items.length > 0) {
        setItems(
          existingHps.items.map((it, idx) => ({
            id: it.id || `item-${idx + 1}`,
            nama_barang: it.nama_barang || '',
            spesifikasi: it.spesifikasi || '',
            satuan: it.satuan || 'Unit',
            volume: it.volume || 1,
            harga_satuan: it.harga_satuan || 0,
          }))
        )
      }
    }
  }, [isEditMode, existingHps])

  // Tambah baris barang baru
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        nama_barang: '',
        spesifikasi: '',
        satuan: 'Unit',
        volume: 1,
        harga_satuan: 0,
      },
    ])
  }

  // Hapus baris barang
  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      alert('Paket HPS minimal harus memiliki 1 rincian barang/jasa.')
      return
    }
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  // Update nilai kolom item
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      return updated
    })
  }

  // Hitung kalkulasi HPS (Jumlah Harga, PPN 11%, Jumlah Harga HPS) secara realtime sesuai template
  const jumlahHarga = items.reduce((acc, curr) => {
    const vol = parseFloat(curr.volume) || 0
    const price = parseFloat(curr.harga_satuan) || 0
    return acc + vol * price
  }, 0)
  const ppn11 = Math.round(jumlahHarga * 0.11)
  const jumlahHargaHps = jumlahHarga + ppn11
  const grandTotal = jumlahHargaHps

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    // Validasi sederhana sebelum kirim
    if (!namaPaket.trim()) {
      setFormError('Nama paket pengadaan wajib diisi.')
      return
    }

    if (!fiscalYear || isNaN(fiscalYear)) {
      setFormError('Tahun anggaran harus berupa tahun yang valid.')
      return
    }

    // Validasi baris barang
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      if (!it.nama_barang.trim()) {
        setFormError(`Baris ${i + 1}: Nama barang/jasa belum diisi.`)
        return
      }
      if (!it.satuan.trim()) {
        setFormError(`Baris ${i + 1}: Satuan barang/jasa belum diisi.`)
        return
      }
      if (parseFloat(it.volume) <= 0 || isNaN(parseFloat(it.volume))) {
        setFormError(`Baris ${i + 1}: Volume barang harus lebih dari 0.`)
        return
      }
      if (parseFloat(it.harga_satuan) < 0 || isNaN(parseFloat(it.harga_satuan))) {
        setFormError(`Baris ${i + 1}: Harga satuan tidak boleh negatif.`)
        return
      }
    }

    try {
      const formData = new FormData()
      formData.append('nama_paket', namaPaket.trim())
      formData.append('fiscal_year', parseInt(fiscalYear, 10))
      if (deskripsi.trim()) {
        formData.append('deskripsi', deskripsi.trim())
      }

      // Format items
      const formattedItems = items.map((it, idx) => ({
        nama_barang: it.nama_barang.trim(),
        spesifikasi: it.spesifikasi.trim() || undefined,
        satuan: it.satuan.trim(),
        volume: parseFloat(it.volume),
        harga_satuan: parseFloat(it.harga_satuan),
        urutan: idx + 1,
      }))

      formData.append('items', JSON.stringify(formattedItems))

      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      let res
      if (isEditMode) {
        // Backend expects JSON body for updateHps
        const updatePayload = {
          nama_paket: namaPaket.trim(),
          fiscal_year: parseInt(fiscalYear, 10),
          deskripsi: deskripsi.trim() || undefined,
          items: formattedItems,
        }
        res = await updateMutation.mutateAsync({ id, data: updatePayload })
      } else {
        res = await createMutation.mutateAsync(formData)
      }

      if (res.success && res.data) {
        navigate(`/hps/${res.data.id}`)
      } else {
        navigate('/hps')
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Terjadi kesalahan saat menyimpan paket HPS.'
      )
    }
  }

  // Jika sedang loading detail pada edit mode
  if (isEditMode && isLoadingDetail) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 max-w-5xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-navy-700 mb-2" />
        <p className="text-xs font-medium">Memuat data paket HPS...</p>
      </div>
    )
  }

  // Jika edit mode tapi status sudah bukan draft (verified / fixed), cegah edit dan tampilkan pesan instruksi
  if (isEditMode && existingHps && existingHps.status !== 'draft') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 font-sans">
        <Card className="text-center shadow-card border-amber-200 bg-amber-50/40">
          <CardBody className="p-8 space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy-900">
              Paket HPS Bersifat Tetap ({existingHps.status.toUpperCase()})
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
              Sesuai aturan alur kerja pengadaan (<strong>AGENTS.md §4 Tahap 1</strong>), paket HPS yang telah diverifikasi oleh PBJ bersifat <em>fixed</em> dan tidak dapat diedit kembali. Silakan tinjau rincian dalam mode baca (read-only).
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link to={`/hps/${existingHps.id}`}>
                <Button variant="primary" size="sm" leftIcon={<FileSpreadsheet className="w-4 h-4" />}>
                  Lihat Detail HPS (Read-Only)
                </Button>
              </Link>
              <Link to="/hps">
                <Button variant="secondary" size="sm">
                  Kembali ke Daftar
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Breadcrumb & Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/hps"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar HPS</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="p-2 bg-navy-900 text-white rounded-lg inline-flex">
          <FileSpreadsheet className="w-5 h-5 text-blue-300" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight">
            {isEditMode ? `Edit Draf HPS: ${existingHps?.nomor_hps || ''}` : 'Buat Paket HPS Baru'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isEditMode
              ? 'Pembaruan rincian barang, volume, dan estimasi harga selama status masih draft (AGENTS.md §4).'
              : 'Tahap 1: Penyusunan spesifikasi teknis, volume, dan penetapan estimasi harga oleh PPK.'}
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
        {/* ── Card 1: Informasi Paket Pengadaan ──────────────────────── */}
        <Card>
          <CardHeader
            title="1. Informasi Pokok Pengadaan"
            subtitle="Identitas umum paket pengadaan barang/jasa instansi"
          />
          <CardBody className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Nama Paket Pengadaan"
                  placeholder="Contoh: Pengadaan Laptop & Komputer Ruang Rapat 2026"
                  required
                  value={namaPaket}
                  onChange={(e) => setNamaPaket(e.target.value)}
                  helperText="Gunakan nama paket yang deskriptif dan resmi."
                />
              </div>

              <div>
                <Input
                  label="Tahun Anggaran"
                  type="number"
                  required
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  placeholder="2026"
                />
              </div>
            </div>

            <Textarea
              label="Deskripsi / Ruang Lingkup Pengadaan (Opsional)"
              placeholder="Jelaskan maksud dan tujuan pengadaan barang atau jasa ini..."
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            />

            {/* Lampiran Dokumen Pendukung Awal */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Dokumen Pendukung / Kerangka Acuan Kerja (KAK) (Opsional)
              </label>
              <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-900">
                      {selectedFile ? selectedFile.name : 'Pilih dokumen PDF/JPG/PNG'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Format: PDF, JPG, PNG (Maksimal 10 MB)
                    </p>
                  </div>
                </div>

                <label className="cursor-pointer">
                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-white text-navy-900 border border-gray-200 rounded-lg hover:bg-gray-100 shadow-sm transition-colors">
                    {selectedFile ? 'Ganti Berkas' : 'Cari Berkas'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0])
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ── Card 2: Rincian Barang / Jasa (Dynamic Rows + Excel Import) ── */}
        <Card>
          <CardHeader
            title="2. Rincian Barang / Jasa & Harga Satuan"
            subtitle="Unggah berkas Excel untuk memuat angka secara otomatis, atau input dan ubah harga secara fleksibel di dalam sistem."
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  pill
                  leftIcon={<FileDown className="w-3.5 h-3.5 text-navy-500" />}
                  onClick={downloadHpsTemplate}
                  title="Unduh format spreadsheet untuk mempermudah penyusunan rincian barang"
                >
                  Unduh Template Excel
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  pill
                  leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-blue-300" />}
                  onClick={() => setIsExcelModalOpen(true)}
                  className="shadow-xs"
                >
                  Upload Excel HPS
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  pill
                  leftIcon={<Plus className="w-3.5 h-3.5 text-navy-500" />}
                  onClick={handleAddItem}
                >
                  Tambah Baris
                </Button>
              </div>
            }
          />

          <CardBody className="p-6 space-y-4">
            {/* Banner Notifikasi jika baru saja mengimpor dari Excel */}
            {excelImportedNotice && (
              <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-2xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold">
                      {excelImportedNotice.count} rincian barang dari file "{excelImportedNotice.fileName}" berhasil dimuat ke sistem!
                    </p>
                    <p className="text-emerald-700 mt-0.5 leading-relaxed">
                      Seluruh angka volume dan harga satuan telah terisi otomatis. Anda dapat langsung mengedit harga satuan, menambah baris, atau menghapus item langsung pada tabel di bawah sebelum menyimpan.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExcelImportedNotice(null)}
                  className="text-emerald-700 hover:text-emerald-900 p-1.5 rounded-lg hover:bg-emerald-100 transition-colors shrink-0"
                  title="Tutup pemberitahuan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Petunjuk Kemudahan Edit Harga */}
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <div className="flex items-center gap-1.5 text-navy-700">
                <PencilLine className="w-3.5 h-3.5 text-navy-500" />
                <span className="font-semibold">
                  Tips PPK: Kolom Harga Satuan dan Volume dapat diedit kapan saja. Subtotal dan Total HPS akan terkalkulasi secara realtime.
                </span>
              </div>
              <span className="font-mono text-gray-400">
                {items.length} rincian barang
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-500 font-bold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3 min-w-[200px]">Nama Barang / Jasa *</th>
                    <th className="py-3 px-3 min-w-[200px]">Spesifikasi Teknis</th>
                    <th className="py-3 px-3 w-28">Satuan *</th>
                    <th className="py-3 px-3 w-24 text-right">Volume *</th>
                    <th className="py-3 px-3 w-44 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>Harga Satuan (Rp) *</span>
                      </div>
                    </th>
                    <th className="py-3 px-3 w-40 text-right">Subtotal (Rp)</th>
                    <th className="py-3 px-2 w-12 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => {
                    const subtotal = (parseFloat(item.volume) || 0) * (parseFloat(item.harga_satuan) || 0)

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-3 text-center text-gray-400 font-mono font-bold">
                          {index + 1}
                        </td>

                        {/* Nama Barang */}
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            required
                            placeholder="Nama barang / jasa"
                            value={item.nama_barang}
                            onChange={(e) => handleItemChange(index, 'nama_barang', e.target.value)}
                            className="w-full bg-white border border-gray-200/90 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-navy-500/15 focus:border-navy-500 transition-all font-medium text-navy-900"
                          />
                        </td>

                        {/* Spesifikasi */}
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            placeholder="Spesifikasi / merk / tipe"
                            value={item.spesifikasi}
                            onChange={(e) => handleItemChange(index, 'spesifikasi', e.target.value)}
                            className="w-full bg-white border border-gray-200/90 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-navy-500/15 focus:border-navy-500 transition-all text-gray-600"
                          />
                        </td>

                        {/* Satuan */}
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            required
                            placeholder="Unit / Paket / Rim"
                            value={item.satuan}
                            onChange={(e) => handleItemChange(index, 'satuan', e.target.value)}
                            className="w-full bg-white border border-gray-200/90 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-navy-500/15 focus:border-navy-500 transition-all text-gray-700"
                          />
                        </td>

                        {/* Volume */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            step="any"
                            min="0.01"
                            required
                            value={item.volume}
                            onChange={(e) => handleItemChange(index, 'volume', e.target.value)}
                            className="w-full bg-white border border-gray-200/90 rounded-lg py-2 px-3 text-xs font-mono text-right focus:outline-none focus:ring-2 focus:ring-navy-500/15 focus:border-navy-500 transition-all font-bold text-navy-900"
                          />
                        </td>

                        {/* Harga Satuan (Bisa diedit langsung) */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              required
                              placeholder="0"
                              value={item.harga_satuan}
                              onChange={(e) => handleItemChange(index, 'harga_satuan', e.target.value)}
                              className="w-full bg-white border border-gray-200/90 hover:border-gray-300 rounded-lg py-2 px-3 text-xs font-mono text-right focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all font-bold text-navy-900 shadow-2xs"
                            />
                            {parseFloat(item.harga_satuan) > 0 && (
                              <p className="text-[11px] font-mono text-gray-500 text-right truncate">
                                {formatRupiah(item.harga_satuan)}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Subtotal Realtime */}
                        <td className="py-3 px-3 text-right font-mono font-black text-navy-900 whitespace-nowrap text-xs">
                          {formatRupiah(subtotal)}
                        </td>

                        {/* Tombol Hapus */}
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length === 1}
                            className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Hapus baris barang"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Ringkasan Perhitungan HPS (Jumlah Harga, PPN 11%, Jumlah Harga HPS) Sesuai Template Excel */}
            <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 via-white to-navy-50/20 p-5 rounded-2xl space-y-4 border border-gray-200/80 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <span className="text-xs text-gray-500">
                  Total item terdaftar: <strong className="text-navy-900 font-bold">{items.length} rincian barang/jasa</strong>
                </span>
                <span className="text-[11px] text-navy-800 bg-navy-50 border border-navy-200/70 px-3 py-1 rounded-full font-medium inline-flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-navy-600"></span>
                  Kalkulasi Baku Template HPS
                </span>
              </div>

              {/* Rincian Angka 3 Baris */}
              <div className="flex flex-col sm:items-end space-y-2 text-xs">
                {/* 1. Jumlah Harga (Sebelum Pajak / DPP) */}
                <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                  <span className="text-gray-600 font-medium">Jumlah Harga:</span>
                  <span className="font-mono font-bold text-navy-900 text-sm min-w-[150px] text-right">
                    {formatRupiah(jumlahHarga)}
                  </span>
                </div>

                {/* 2. PPN 11% */}
                <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                  <span className="text-gray-600 font-medium flex items-center gap-1">
                    <span>PPN 11 %:</span>
                  </span>
                  <span className="font-mono font-bold text-navy-900 text-sm min-w-[150px] text-right">
                    {formatRupiah(ppn11)}
                  </span>
                </div>

                {/* Garis Pemisah */}
                <div className="w-full sm:w-72 border-t border-gray-300 my-1"></div>

                {/* 3. Jumlah Harga HPS (Total Akhir Termasuk PPN) */}
                <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto pt-1">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-navy-900 block sm:text-right">
                      Jumlah Harga HPS:
                    </span>
                    <span className="text-[10px] text-gray-400 block sm:text-right">
                      (Termasuk PPN 11%)
                    </span>
                  </div>
                  <span className="text-xl font-black text-navy-900 font-mono min-w-[150px] text-right">
                    {formatRupiah(jumlahHargaHps)}
                  </span>
                </div>
              </div>

              {/* Terbilang */}
              {jumlahHargaHps > 0 && (
                <div className="pt-2.5 border-t border-gray-100 text-[11px] text-gray-600 flex flex-wrap items-baseline gap-1.5 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-gray-100">
                  <span className="font-bold text-navy-900 uppercase tracking-wider text-[10px]">Terbilang:</span>
                  <span className="italic font-medium text-navy-800">
                    {terbilang(jumlahHargaHps)}
                  </span>
                </div>
              )}
            </div>
          </CardBody>

          <CardFooter>
            <Link to="/hps">
              <Button type="button" variant="secondary" pill>
                Batal
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="md"
              pill
              isLoading={createMutation.isPending || updateMutation.isPending}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-blue-300" />}
            >
              {isEditMode ? 'Simpan Perubahan Draf HPS' : 'Simpan Draf HPS'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* ── Modal Import Excel HPS ─────────────────────────────────── */}
      <HpsExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        existingItemsCount={items.length}
      />
    </div>
  )
}

export default HpsCreatePage

