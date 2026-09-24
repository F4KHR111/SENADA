import React, { useState, useRef } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../../components/Modal'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import { formatRupiah, formatFileSize, terbilang } from '../../../utils/formatters'
import { parseHpsExcel, downloadHpsTemplate } from '../utils/excelHpsHelper'
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Layers,
  ArrowRight,
  Info,
  Loader2,
  X,
} from 'lucide-react'

export function HpsExcelImportModal({
  isOpen,
  onClose,
  onImportSuccess,
  existingItemsCount = 0,
}) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [importMode, setImportMode] = useState('replace') // 'replace' | 'append'

  const handleReset = () => {
    setParsedData(null)
    setParseError('')
    setIsParsing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleFile = async (file) => {
    if (!file) return

    const validExtensions = ['.xlsx', '.xls', '.csv']
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    )

    if (!hasValidExt) {
      setParseError('Format file tidak didukung. Harap pilih file Excel (.xlsx, .xls) atau .csv.')
      return
    }

    setParseError('')
    setIsParsing(true)

    try {
      const res = await parseHpsExcel(file)
      if (res.success) {
        setParsedData(res)
      } else {
        setParseError(res.message || 'Gagal membaca isi file Excel.')
        setParsedData(null)
      }
    } catch (err) {
      setParseError(err.message || 'Terjadi kesalahan saat memproses file Excel.')
      setParsedData(null)
    } finally {
      setIsParsing(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleApply = () => {
    if (!parsedData || !parsedData.items || parsedData.items.length === 0) return
    onImportSuccess(parsedData.items, importMode, parsedData.fileName, parsedData.metadata)
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalHeader
        title="Import Rincian HPS dari Excel"
        subtitle="Unggah berkas Excel (.xlsx / .xls) untuk memasukkan daftar barang & harga perkiraan ke sistem secara otomatis."
        onClose={handleClose}
      />

      <ModalBody className="space-y-6">
        {/* Banner Unduh Template Format Excel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-navy-50 to-blue-50/50 border border-navy-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-xs font-bold text-navy-900">
                Gunakan Template Resmi Format Excel SENADA
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Pastikan susunan kolom sesuai agar seluruh angka harga dan volume terbaca sempurna.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            pill
            leftIcon={<FileDown className="w-4 h-4 text-navy-500" />}
            onClick={downloadHpsTemplate}
            className="shrink-0 font-bold"
          >
            Unduh Template (.xlsx)
          </Button>
        </div>

        {/* Drop Zone Area */}
        {!parsedData && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              isDragging
                ? 'border-navy-500 bg-navy-50/40 scale-[0.99]'
                : 'border-gray-200 bg-gray-50/60 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0])
                }
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-navy-500 shadow-xs">
                {isParsing ? (
                  <Loader2 className="w-7 h-7 animate-spin text-navy-500" />
                ) : (
                  <Upload className="w-7 h-7 text-navy-500" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-navy-900">
                  {isParsing
                    ? 'Sedang membaca dan memverifikasi data Excel...'
                    : 'Tarik & Letakkan file Excel di sini'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Mendukung format Microsoft Excel (.xlsx, .xls) atau .csv
                </p>
              </div>

              {!isParsing && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  pill
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Pilih File dari Komputer
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {parseError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Gagal Mengimpor File Excel</p>
              <p>{parseError}</p>
            </div>
          </div>
        )}

        {/* Preview Hasil Parsing Data */}
        {parsedData && (
          <div className="space-y-4">
            {/* Header info file */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-gray-200/90 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-navy-900 truncate max-w-xs sm:max-w-md">
                      {parsedData.fileName}
                    </p>
                    <Badge variant="success" size="sm">
                      {parsedData.count} Item Terdeteksi
                    </Badge>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Ukuran: {formatFileSize(parsedData.fileSize)} · Estimasi Total:{' '}
                    <strong className="text-navy-900 font-mono">
                      {formatRupiah(parsedData.totalEstimated)}
                    </strong>
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                pill
                onClick={handleReset}
                leftIcon={<X className="w-4 h-4" />}
                className="text-gray-500 hover:text-red-600"
              >
                Ganti File
              </Button>
            </div>

            {/* Pilihan Mode Import jika sudah ada baris sebelumnya */}
            {existingItemsCount > 0 && (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                <p className="text-xs font-bold text-navy-900">
                  Pilihan Penempatan Data:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      importMode === 'replace'
                        ? 'bg-white border-navy-500 ring-2 ring-navy-500/10'
                        : 'bg-white/60 border-gray-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-navy-900"
                    />
                    <div>
                      <span className="font-bold text-navy-900 block">
                        Ganti Semua Baris yang Ada
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Hapus {existingItemsCount} baris saat ini dan isi dengan {parsedData.count} baris dari Excel.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      importMode === 'append'
                        ? 'bg-white border-navy-500 ring-2 ring-navy-500/10'
                        : 'bg-white/60 border-gray-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-navy-900"
                    />
                    <div>
                      <span className="font-bold text-navy-900 block">
                        Tambahkan ke Baris yang Ada
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Pertahankan data saat ini dan sisipkan {parsedData.count} baris baru di bawahnya.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Preview Tabel Rincian */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
                <span>Pratinjau Data (Maksimal 5 baris pertama):</span>
                <span>Total {parsedData.count} data</span>
              </div>

              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50/80 sticky top-0 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">No</th>
                      <th className="py-2.5 px-3">Nama Barang / Jasa</th>
                      <th className="py-2.5 px-3">Spesifikasi</th>
                      <th className="py-2.5 px-2 text-center w-16">Satuan</th>
                      <th className="py-2.5 px-2 text-right w-16">Vol</th>
                      <th className="py-2.5 px-3 text-right w-28">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right w-28">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedData.items.slice(0, 5).map((it, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-2 px-3 text-center text-gray-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-semibold text-navy-900 truncate max-w-[180px]">
                          {it.nama_barang}
                        </td>
                        <td className="py-2 px-3 text-gray-500 truncate max-w-[180px]">
                          {it.spesifikasi || '-'}
                        </td>
                        <td className="py-2 px-2 text-center text-gray-700">
                          {it.satuan}
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-semibold text-navy-900">
                          {it.volume}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-gray-700">
                          {formatRupiah(it.harga_satuan)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-navy-900">
                          {formatRupiah(it.volume * it.harga_satuan)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ringkasan Kalkulasi Format Template Excel */}
            {parsedData.totalEstimated > 0 && (() => {
              const jumlahHarga = parsedData.totalEstimated
              const ppn11 = Math.round(jumlahHarga * 0.11)
              const jumlahHargaHps = jumlahHarga + ppn11
              return (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-navy-50/30 border border-gray-200 space-y-2.5">
                  <div className="flex flex-col sm:items-end space-y-1.5 text-xs">
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <span className="text-gray-500 font-medium">Jumlah Harga:</span>
                      <span className="font-mono font-bold text-navy-900 min-w-[140px] text-right">
                        {formatRupiah(jumlahHarga)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <span className="text-gray-500 font-medium">PPN 11 %:</span>
                      <span className="font-mono font-bold text-navy-900 min-w-[140px] text-right">
                        {formatRupiah(ppn11)}
                      </span>
                    </div>
                    <div className="w-full sm:w-64 border-t border-gray-300 my-0.5"></div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <span className="text-xs font-black uppercase text-navy-900">
                        Jumlah Harga HPS:
                      </span>
                      <span className="font-mono font-black text-navy-900 text-sm min-w-[140px] text-right">
                        {formatRupiah(jumlahHargaHps)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200/70 text-[11px] text-gray-500 italic flex items-baseline gap-1.5">
                    <span className="font-semibold text-navy-900 not-italic">Terbilang:</span>
                    <span>{terbilang(jumlahHargaHps)}</span>
                  </div>
                </div>
              )
            })()}

            {/* Catatan Kemudahan Edit Harga */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-navy-900 text-xs">
              <Info className="w-4 h-4 text-navy-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Catatan Fleksibilitas:</strong> Seluruh angka yang masuk ke dalam sistem{' '}
                <strong>dapat diubah kembali secara bebas</strong> (harga satuan, volume, nama barang) langsung pada tabel sebelum disimpan.
              </p>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button type="button" variant="secondary" onClick={handleClose}>
          Batal
        </Button>

        <Button
          type="button"
          variant="primary"
          pill
          disabled={!parsedData || !parsedData.items || parsedData.items.length === 0}
          onClick={handleApply}
          leftIcon={<CheckCircle2 className="w-4 h-4 text-blue-300" />}
        >
          Terapkan ke Sistem ({parsedData ? parsedData.count : 0} Item)
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default HpsExcelImportModal
