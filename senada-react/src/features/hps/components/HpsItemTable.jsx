import React from 'react'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmpty,
} from '../../../components/Table'
import { formatRupiah, terbilang } from '../../../utils/formatters'

/**
 * HpsItemTable — Komponen tabel rincian item barang/jasa HPS
 */
export function HpsItemTable({ items = [], totalHarga = 0, hidePrices = false }) {
  const rawSubtotal = items.reduce((acc, curr) => acc + (parseFloat(curr.subtotal) || 0), 0)
  const jumlahHarga = rawSubtotal || Number(totalHarga) || 0
  const ppn11 = Math.round(jumlahHarga * 0.11)
  const jumlahHargaHps = jumlahHarga + ppn11

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableHead className="w-12 text-center">No</TableHead>
          <TableHead>Nama Barang / Jasa</TableHead>
          <TableHead>Spesifikasi Teknis</TableHead>
          <TableHead align="center" className="w-24">Satuan</TableHead>
          <TableHead align="right" className="w-24">Volume</TableHead>
          {!hidePrices && <TableHead align="right" className="w-36">Harga Satuan</TableHead>}
          {!hidePrices && <TableHead align="right" className="w-40">Subtotal</TableHead>}
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableEmpty message="Belum ada rincian barang untuk HPS ini." colSpan={hidePrices ? 5 : 7} />
          ) : (
            items.map((item, index) => (
              <TableRow key={item.id || index} isZebra={index % 2 === 1}>
                <TableCell align="center" className="text-gray-500 font-mono text-xs">
                  {index + 1}
                </TableCell>
                <TableCell className="font-semibold text-navy-900">
                  {item.nama_barang}
                </TableCell>
                <TableCell className="text-xs text-gray-600 max-w-xs whitespace-pre-line">
                  {item.spesifikasi || '-'}
                </TableCell>
                <TableCell align="center" className="text-xs font-medium text-gray-700">
                  {item.satuan}
                </TableCell>
                <TableCell align="right" className="font-mono text-xs text-navy-900 font-semibold">
                  {parseFloat(item.volume).toLocaleString('id-ID')}
                </TableCell>
                {!hidePrices && (
                  <TableCell align="right" className="font-mono text-xs text-gray-700">
                    {formatRupiah(item.harga_satuan)}
                  </TableCell>
                )}
                {!hidePrices && (
                  <TableCell align="right" className="font-mono text-xs font-semibold text-navy-900">
                    {formatRupiah(item.subtotal)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Ringkasan Nilai HPS Lengkap untuk Internal (PPK / PBJ / Admin) */}
      {!hidePrices && items.length > 0 && (
        <div className="p-5 bg-gradient-to-br from-gray-50 to-navy-50/20 rounded-2xl border border-gray-200/80 space-y-3">
          <div className="flex flex-col sm:items-end space-y-2 text-xs">
            {/* Jumlah Harga */}
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
              <span className="text-gray-600 font-medium">Jumlah Harga:</span>
              <span className="font-mono font-bold text-navy-900 text-sm min-w-[150px] text-right">
                {formatRupiah(jumlahHarga)}
              </span>
            </div>

            {/* PPN 11% */}
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
              <span className="text-gray-600 font-medium">PPN 11 %:</span>
              <span className="font-mono font-bold text-navy-900 text-sm min-w-[150px] text-right">
                {formatRupiah(ppn11)}
              </span>
            </div>

            {/* Divider */}
            <div className="w-full sm:w-72 border-t border-gray-300 my-1"></div>

            {/* Jumlah Harga HPS */}
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-1">
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
            <div className="pt-2 border-t border-gray-200/70 text-[11px] text-gray-600 flex flex-wrap items-baseline gap-1.5 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-gray-100">
              <span className="font-bold text-navy-900 uppercase tracking-wider text-[10px]">Terbilang:</span>
              <span className="italic font-medium text-navy-800">
                {terbilang(jumlahHargaHps)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tampilan Khusus Penyedia: Hanya Jumlah Harga HPS yang diperlihatkan (harga satuan per item tetap tersembunyi) */}
      {hidePrices && jumlahHargaHps > 0 && (
        <div className="p-5 bg-gradient-to-br from-gray-50 via-white to-navy-50/30 rounded-2xl border border-navy-900/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
                Jumlah Harga HPS (Pagu Paket)
              </span>
              <span className="text-[10px] bg-navy-100 text-navy-800 font-medium px-2 py-0.5 rounded-full">
                Termasuk PPN 11%
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1 max-w-md">
              Nilai pagu total resmi paket pengadaan yang dialokasikan instansi. Rincian estimasi harga satuan per item bersifat rahasia pengadaan.
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-xl font-black text-navy-900 font-mono block">
              {formatRupiah(jumlahHargaHps)}
            </span>
            <span className="text-[11px] text-gray-600 italic block mt-0.5">
              {terbilang(jumlahHargaHps)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default HpsItemTable
