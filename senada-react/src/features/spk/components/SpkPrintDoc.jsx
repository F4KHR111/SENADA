import React from 'react'
import { Button } from '../../../components/Button'
import { formatRupiah, formatDate } from '../../../utils/formatters'
import { Printer, X, Download } from 'lucide-react'

export function SpkPrintDoc({ spk, onDownloadPdf, onClose }) {
  const handlePrint = () => {
    window.print()
  }

  const hps = spk?.negosiasi?.penawaran?.undanganVendor?.undangan?.hps
  const items = spk?.negosiasi?.penawaran?.items || []
  const vendor = spk?.vendor
  const ppk = spk?.ppk

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 text-navy-900 font-sans flex flex-col max-h-[90vh]">
        {/* Floating Action Bar (Hidden on print) */}
        <div className="p-4 bg-gray-100 border-b border-gray-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-navy-900" />
            <span className="text-xs font-bold text-navy-900">
              Pratinjau Dokumen Kontrak Surat Perintah Kerja (SPK)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onDownloadPdf && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={onDownloadPdf}
              >
                Unduh PDF Resmi
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Cetak Dokumen
            </Button>

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Lembar Dokumen SPK */}
        <div className="p-10 sm:p-14 overflow-y-auto space-y-6 text-xs text-gray-800 leading-relaxed">
          {/* Header Lembaga & Dokumen */}
          <div className="text-center pb-4 border-b-2 border-navy-900 space-y-1">
            <h1 className="text-base font-bold tracking-wider uppercase text-navy-900">
              SISTEM PENGADAAN BARANG DAN JASA (SENADA)
            </h1>
            <p className="text-xs font-medium text-gray-600">
              PEJABAT PEMBUAT KOMITMEN (PPK) • TAHUN ANGGARAN {hps?.fiscal_year || '2026'}
            </p>
            <div className="pt-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-navy-900 underline">
                SURAT PERINTAH KERJA (SPK)
              </h2>
              <p className="text-xs font-mono font-semibold text-navy-900 mt-0.5">
                Nomor: {spk?.nomor_spk}
              </p>
            </div>
          </div>

          {/* Para Pihak */}
          <p className="text-justify">
            Pada hari ini, tanggal <strong>{formatDate(spk?.tanggal_spk || new Date())}</strong>, kami yang bertanda tangan di bawah ini:
          </p>

          <div className="space-y-3 pl-4 border-l-2 border-navy-900/40">
            <div>
              <p className="font-bold text-navy-900">1. PIHAK PERTAMA (Pemberi Kerja):</p>
              <div className="grid grid-cols-4 gap-y-1 mt-1 text-gray-700">
                <span>Nama</span>
                <span className="col-span-3 font-semibold text-navy-900">: {ppk?.name || '-'}</span>
                <span>NIP</span>
                <span className="col-span-3 font-mono">: {ppk?.employee_id || '-'}</span>
                <span>Jabatan</span>
                <span className="col-span-3">: Pejabat Pembuat Komitmen (PPK)</span>
              </div>
            </div>

            <div>
              <p className="font-bold text-navy-900">2. PIHAK KEDUA (Penyedia Rekanan):</p>
              <div className="grid grid-cols-4 gap-y-1 mt-1 text-gray-700">
                <span>Perusahaan</span>
                <span className="col-span-3 font-semibold text-navy-900">: {vendor?.company_name || '-'}</span>
                <span>NPWP</span>
                <span className="col-span-3 font-mono">: {vendor?.npwp || '-'}</span>
                <span>Alamat</span>
                <span className="col-span-3">: {vendor?.address || '-'}, {vendor?.city || '-'}</span>
                <span>Rekening Bank</span>
                <span className="col-span-3">: {vendor?.bank_name || '-'} ({vendor?.bank_account_number || '-'}) a.n {vendor?.bank_account_holder || '-'}</span>
              </div>
            </div>
          </div>

          <p className="text-justify">
            Menyatakan sepakat untuk mengadakan perikatan perjanjian Surat Perintah Kerja untuk paket pengadaan <strong>"{hps?.nama_paket}"</strong> dengan rincian dan ketentuan sebagai berikut:
          </p>

          {/* Tabel Barang & Nilai Kontrak */}
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100 text-navy-900">
                <th className="border border-gray-300 p-2 w-10 text-center">No</th>
                <th className="border border-gray-300 p-2 text-left">Nama Barang / Uraian Pekerjaan</th>
                <th className="border border-gray-300 p-2 w-24 text-center">Satuan</th>
                <th className="border border-gray-300 p-2 w-20 text-right">Volume</th>
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
                    {item.hpsItem?.nama_barang || '-'}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item.hpsItem?.satuan || '-'}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-mono">
                    {parseFloat(item.hpsItem?.volume || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-mono">
                    {formatRupiah(item.harga_satuan)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-mono font-semibold">
                    {formatRupiah(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={5} className="border border-gray-300 p-2.5 text-right uppercase tracking-wider text-navy-900">
                  Total Nilai Kontrak Kesepakatan (Termasuk PPN):
                </td>
                <td className="border border-gray-300 p-2.5 text-right font-mono text-sm text-navy-900">
                  {formatRupiah(spk?.nilai_kontrak)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Ketentuan Jangka Waktu */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
            <p className="font-bold text-navy-900">Jangka Waktu Pelaksanaan Pekerjaan:</p>
            <p>
              Mulai tanggal: <strong>{spk?.tanggal_mulai ? formatDate(spk.tanggal_mulai) : '-'}</strong> s.d. selesai tanggal: <strong>{spk?.tanggal_selesai ? formatDate(spk.tanggal_selesai) : '-'}</strong>.
            </p>
          </div>

          {/* Blok Tanda Tangan Kedua Belah Pihak */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center">
            {/* Tanda Tangan PPK */}
            <div className="space-y-1">
              <p className="text-gray-500">Untuk dan atas nama</p>
              <p className="font-bold text-navy-900">Pejabat Pembuat Komitmen (PPK)</p>
              <div className="my-3 py-6 px-4 border border-dashed border-gray-300 rounded text-[10px] text-gray-400 max-w-[150px] mx-auto bg-gray-50">
                {spk?.status === 'signed' ? 'Telah Ditandatangani Digital' : 'Tanda Tangan PPK'}
              </div>
              <p className="font-bold underline text-navy-900 pt-2">{ppk?.name || 'Nama PPK'}</p>
              <p className="text-[10px] text-gray-500 font-mono">NIP: {ppk?.employee_id || '-'}</p>
            </div>

            {/* Tanda Tangan Penyedia */}
            <div className="space-y-1">
              <p className="text-gray-500">Untuk dan atas nama</p>
              <p className="font-bold text-navy-900 uppercase">{vendor?.company_name}</p>
              <div className="my-3 py-6 px-4 border border-dashed border-gray-300 rounded text-[10px] text-gray-400 max-w-[150px] mx-auto bg-gray-50">
                Materai Rp 10.000 & Cap Basah
              </div>
              <p className="font-bold underline text-navy-900 pt-2">
                ( Pimpinan / Direktur )
              </p>
              <p className="text-[10px] text-gray-500">Penyedia Barang / Jasa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpkPrintDoc
