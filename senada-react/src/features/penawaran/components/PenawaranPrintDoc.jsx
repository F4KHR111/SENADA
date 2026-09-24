import React from 'react'
import { Button } from '../../../components/Button'
import { formatRupiah, formatDate } from '../../../utils/formatters'
import { Printer, X } from 'lucide-react'

export function PenawaranPrintDoc({ penawaran, onClose }) {
  const handlePrint = () => {
    window.print()
  }

  const items = penawaran?.items || []
  const vendor = penawaran?.undanganVendor?.vendor
  const undangan = penawaran?.undanganVendor?.undangan
  const hps = undangan?.hps

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* Container Kertas A4 */}
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 text-navy-900 font-sans flex flex-col max-h-[90vh]">
        {/* Floating Action Bar (Hidden on print) */}
        <div className="p-4 bg-gray-100 border-b border-gray-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-navy-900" />
            <span className="text-xs font-bold text-navy-900">
              Pratinjau Cetak Surat Penawaran Harga Resmi (Format Tanda Tangan & Cap Basah)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Cetak Dokumen / Simpan PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Lembar Dokumen Fisik */}
        <div className="p-10 sm:p-14 overflow-y-auto space-y-6 text-xs text-gray-800 leading-normal">
          {/* Header Dokumen */}
          <div className="text-center pb-4 border-b-2 border-navy-900">
            <h2 className="text-sm font-bold tracking-widest uppercase text-navy-900">
              SURAT PENAWARAN HARGA PENGADAAN BARANG / JASA
            </h2>
            <p className="text-[11px] text-gray-600 mt-1">
              Nomor Undangan: <strong className="text-navy-900 font-mono">{undangan?.nomor_undangan || '-'}</strong> • Tanggal: {formatDate(penawaran?.submitted_at || new Date())}
            </p>
          </div>

          {/* Info Kepada */}
          <div className="space-y-1">
            <p>Kepada Yth.</p>
            <p className="font-bold text-navy-900">
              Pejabat Pengadaan (PBJ) / Pejabat Pembuat Komitmen (PPK)
            </p>
            <p>{hps?.nama_paket || 'Paket Pengadaan Barang dan Jasa'}</p>
            <p>Di Tempat</p>
          </div>

          <p className="text-justify leading-relaxed">
            Sehubungan dengan undangan pengadaan nomor <strong>{undangan?.nomor_undangan}</strong>, kami yang bertanda tangan di bawah ini mewakili:
          </p>

          {/* Identitas Rekanan */}
          <div className="grid grid-cols-3 gap-y-1.5 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-gray-500">Nama Perusahaan:</span>
            <span className="col-span-2 font-bold text-navy-900">{vendor?.company_name || '-'}</span>

            <span className="text-gray-500">NPWP:</span>
            <span className="col-span-2 font-mono">{vendor?.npwp || '-'}</span>

            <span className="text-gray-500">Alamat Lengkap:</span>
            <span className="col-span-2">{vendor?.address || '-'}, {vendor?.city || '-'}</span>

            <span className="text-gray-500">Nomor Telepon:</span>
            <span className="col-span-2">{vendor?.phone || '-'}</span>
          </div>

          <p className="text-justify leading-relaxed">
            Dengan ini menyatakan sanggup dan bersedia melaksanakan pekerjaan <strong>{hps?.nama_paket}</strong> (Tahun Anggaran {hps?.fiscal_year}) dengan rincian harga penawaran sebagai berikut:
          </p>

          {/* Tabel Rincian Penawaran */}
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100 text-navy-900">
                <th className="border border-gray-300 p-2 w-10 text-center">No</th>
                <th className="border border-gray-300 p-2 text-left">Nama Barang / Jasa</th>
                <th className="border border-gray-300 p-2 text-left">Spesifikasi Teknis</th>
                <th className="border border-gray-300 p-2 w-20 text-center">Satuan</th>
                <th className="border border-gray-300 p-2 w-16 text-right">Volume</th>
                <th className="border border-gray-300 p-2 w-32 text-right">Harga Satuan (Rp)</th>
                <th className="border border-gray-300 p-2 w-36 text-right">Subtotal (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="border border-gray-300 p-2 text-center text-gray-500 font-mono">
                    {idx + 1}
                  </td>
                  <td className="border border-gray-300 p-2 font-semibold">
                    {item.hpsItem?.nama_barang || item.nama_barang || '-'}
                  </td>
                  <td className="border border-gray-300 p-2 text-[11px] text-gray-600">
                    {item.hpsItem?.spesifikasi || '-'}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item.hpsItem?.satuan || '-'}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-mono">
                    {item.hpsItem?.volume || '-'}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-mono">
                    {formatRupiah(item.harga_satuan)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-mono font-bold">
                    {formatRupiah(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={6} className="border border-gray-300 p-2.5 text-right uppercase tracking-wider text-navy-900">
                  Total Nilai Penawaran (Termasuk Pajak Berlaku):
                </td>
                <td className="border border-gray-300 p-2.5 text-right font-mono text-sm text-navy-900">
                  {formatRupiah(penawaran?.total_penawaran)}
                </td>
              </tr>
            </tfoot>
          </table>

          <p className="text-justify leading-relaxed">
            Surat penawaran ini berlaku selama proses pemilihan penyedia hingga penerbitan Surat Perintah Kerja (SPK). Demikian penawaran harga ini kami sampaikan dengan penuh rasa tanggung jawab.
          </p>

          {/* Kolom Tanda Tangan & Cap Basah */}
          <div className="pt-8 flex justify-end">
            <div className="text-center w-64 space-y-1">
              <p>{vendor?.city || 'Jakarta'}, {formatDate(penawaran?.submitted_at || new Date())}</p>
              <p className="font-bold text-navy-900 uppercase">{vendor?.company_name}</p>

              {/* Placeholder Box Materai */}
              <div className="my-3 py-6 px-4 border border-dashed border-gray-400 rounded text-[10px] text-gray-400 max-w-[140px] mx-auto bg-gray-50">
                Materai Rp 10.000 & Cap Basah
              </div>

              <div className="pt-8">
                <p className="font-bold underline text-navy-900">
                  ( {vendor?.company_name ? `Pimpinan / Direktur ${vendor.company_name}` : 'Nama Pimpinan'} )
                </p>
                <p className="text-[11px] text-gray-500">Penyedia Barang / Jasa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PenawaranPrintDoc
