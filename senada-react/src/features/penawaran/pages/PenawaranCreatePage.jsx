import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCreatePenawaran } from '../hooks/usePenawaran'
import { useUndanganDetail, useUndanganList } from '../../undangan/hooks/useUndangan'
import { Card, CardHeader, CardBody, CardFooter } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { formatRupiah, formatDateTime, formatDate } from '../../../utils/formatters'
import {
  ArrowLeft,
  Send,
  Building2,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'

export function PenawaranCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialUndanganId = searchParams.get('undangan_id') || ''

  const [selectedUndanganId, setSelectedUndanganId] = useState(initialUndanganId)
  const [selectedFile, setSelectedFile] = useState(null)
  const [formError, setFormError] = useState('')

  // Query daftar undangan aktif jika belum memilih
  const { data: undanganListData } = useUndanganList({ status: 'sent' })
  const activeInvitations = undanganListData?.data || []

  // Query detail undangan terpilih untuk load rincian HPS
  const {
    data: detailData,
    isLoading: isLoadingDetail,
  } = useUndanganDetail(selectedUndanganId)
  const selectedUndangan = detailData?.data

  // Item prices state
  const [itemPrices, setItemPrices] = useState({})

  // Saat undangan berhasil diload, inisialisasi input harga satuan kosong agar diinput murni oleh penyedia
  useEffect(() => {
    if (selectedUndangan?.hps?.items) {
      const initialPrices = {}
      selectedUndangan.hps.items.forEach((item) => {
        // Vendor menginput sendiri harga satuannya (tidak boleh prefill harga HPS internal)
        initialPrices[item.id] = ''
      })
      setItemPrices(initialPrices)
    }
  }, [selectedUndangan])

  const createMutation = useCreatePenawaran()

  const handlePriceChange = (itemId, val) => {
    setItemPrices((prev) => ({
      ...prev,
      [itemId]: val,
    }))
  }

  // Hitung total penawaran secara realtime
  const hpsItems = selectedUndangan?.hps?.items || []
  const totalPenawaran = hpsItems.reduce((acc, item) => {
    const vol = parseFloat(item.volume) || 0
    const price = parseFloat(itemPrices[item.id]) || 0
    return acc + vol * price
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!selectedUndanganId) {
      setFormError('Silakan pilih paket pengadaan yang ingin diajukan penawaran.')
      return
    }

    if (hpsItems.length === 0) {
      setFormError('Paket pengadaan tidak memiliki rincian barang/jasa.')
      return
    }

    // Validasi harga
    for (const item of hpsItems) {
      const price = parseFloat(itemPrices[item.id])
      if (isNaN(price) || price <= 0) {
        setFormError(`Harga satuan untuk '${item.nama_barang}' harus lebih besar dari Rp 0.`)
        return
      }
    }

    try {
      const formData = new FormData()
      formData.append('undangan_id', selectedUndanganId)

      const payloadItems = hpsItems.map((item) => ({
        hps_item_id: item.id,
        harga_satuan: parseFloat(itemPrices[item.id]),
      }))

      formData.append('items', JSON.stringify(payloadItems))

      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const res = await createMutation.mutateAsync(formData)

      if (res.success && res.data) {
        navigate(`/penawaran/${res.data.id}`)
      } else {
        navigate('/penawaran')
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          'Gagal mengirimkan penawaran harga.'
      )
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* ── Header & Breadcrumb ────────────────────────────────────── */}
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
          <Send className="w-5 h-5 text-blue-300" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight">
            Pemasukan Penawaran Harga Rekanan
          </h1>
          <p className="text-xs text-gray-500">
            Tahap 3: Penyedia menginput harga satuan penawaran. Rincian barang & volume bersifat fixed mengacu pada HPS resmi.
          </p>
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────── */}
      {formError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="font-medium">{formError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Card 1: Paket Pengadaan Acuan ──────────────────────────── */}
        <Card>
          <CardHeader
            title="1. Paket Pengadaan & Undangan"
            subtitle="Pilih paket pengadaan aktif yang mengundang perusahaan Anda"
          />
          <CardBody className="p-6 space-y-4">
            {!initialUndanganId && (
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Pilih Paket Undangan Pengadaan Aktif *
                </label>
                <select
                  required
                  value={selectedUndanganId}
                  onChange={(e) => setSelectedUndanganId(e.target.value)}
                  className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500"
                >
                  <option value="">-- Pilih Undangan Pengadaan --</option>
                  {activeInvitations.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nomor_undangan} — {u.hps?.nama_paket}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedUndangan && (
              <div className="p-4 bg-navy-900/5 rounded-xl border border-navy-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-navy-500">
                    {selectedUndangan.nomor_undangan}
                  </span>
                  <h3 className="text-base font-bold text-navy-900">
                    {selectedUndangan.hps?.nama_paket}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Batas Akhir Penawaran: <strong>{formatDateTime(selectedUndangan.batas_waktu_penawaran)}</strong>
                  </p>
                </div>

                <div className="sm:text-right bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-2xs space-y-0.5">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                    Jumlah Harga HPS (Pagu Paket)
                  </span>
                  <p className="text-sm font-black font-mono text-navy-900">
                    {formatRupiah(
                      Math.round(
                        (parseFloat(selectedUndangan.hps?.total_harga) || 0) * 1.11
                      )
                    )}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium block">
                    Termasuk PPN 11%
                  </span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* ── Card 2: Input Rincian Harga Satuan (Fixed Volume) ───────── */}
        <Card>
          <CardHeader
            title="2. Rincian Harga Satuan Penawaran"
            subtitle="Volume dan spesifikasi teknis baku dari pengadaan. Silakan masukkan harga satuan penawaran perusahaan Anda."
          />
          <CardBody className="p-6 space-y-4">
            {isLoadingDetail ? (
              <p className="text-xs text-gray-400 py-4 text-center">Memuat rincian kebutuhan paket...</p>
            ) : hpsItems.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                Pilih paket undangan di atas untuk menampilkan rincian barang.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-2 w-10 text-center">No</th>
                      <th className="py-2.5 px-2">Nama Barang & Spesifikasi Teknis</th>
                      <th className="py-2.5 px-2 w-20 text-center">Satuan</th>
                      <th className="py-2.5 px-2 w-24 text-right">Volume</th>
                      <th className="py-2.5 px-2 w-48 text-right">Harga Tawaran Satuan (Rp) *</th>
                      <th className="py-2.5 px-2 w-44 text-right">Subtotal Tawaran (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {hpsItems.map((item, index) => {
                      const userPrice = parseFloat(itemPrices[item.id]) || 0
                      const volume = parseFloat(item.volume) || 0
                      const subtotal = volume * userPrice

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-2 text-center text-gray-400 font-mono font-bold">
                            {index + 1}
                          </td>

                          <td className="py-3 px-2">
                            <p className="font-semibold text-navy-900">{item.nama_barang}</p>
                            {item.spesifikasi && (
                              <p className="text-[11px] text-gray-500 mt-0.5">{item.spesifikasi}</p>
                            )}
                          </td>

                          <td className="py-3 px-2 text-center text-gray-700 font-medium">
                            {item.satuan}
                          </td>

                          <td className="py-3 px-2 text-right font-mono font-bold text-navy-900">
                            {volume.toLocaleString('id-ID')}
                          </td>

                          <td className="py-3 px-2">
                            <input
                              type="number"
                              min="1"
                              step="any"
                              required
                              placeholder="Masukkan harga satuan..."
                              value={itemPrices[item.id] !== undefined ? itemPrices[item.id] : ''}
                              onChange={(e) => handlePriceChange(item.id, e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-md py-1.5 px-2.5 text-xs font-mono text-right focus:outline-none focus:border-navy-500 font-semibold text-navy-900 placeholder:font-normal placeholder:text-gray-300"
                            />
                          </td>

                          <td className="py-3 px-2 text-right font-mono font-bold text-navy-900 whitespace-nowrap">
                            {formatRupiah(subtotal)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total Penawaran */}
            {hpsItems.length > 0 && (
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-4 p-4 bg-navy-900/5 rounded-xl border border-navy-900/10">
                <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Total Nilai Penawaran Diajukan:
                </span>
                <span className="text-xl font-bold font-mono text-navy-900">
                  {formatRupiah(totalPenawaran)}
                </span>
              </div>
            )}
          </CardBody>
        </Card>

        {/* ── Card 3: Lampiran Surat Penawaran ───────────────────────── */}
        <Card>
          <CardHeader
            title="3. Berkas Surat Penawaran (Opsional)"
            subtitle="Unggah dokumen surat penawaran resmi bertandatangan pimpinan dan cap basah"
          />
          <CardBody className="p-6">
            <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-lg border border-gray-200 text-gray-500">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy-900">
                    {selectedFile ? selectedFile.name : 'Pilih dokumen PDF/JPG/PNG'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Format: PDF, JPG, PNG (Maks 10 MB). Dapat juga diunggah setelah formulir disimpan.
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
              disabled={hpsItems.length === 0}
              isLoading={createMutation.isPending}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Kirimkan Penawaran Harga
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default PenawaranCreatePage
