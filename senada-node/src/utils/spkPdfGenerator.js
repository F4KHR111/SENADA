'use strict'

const PDFDocument = require('pdfkit')

/**
 * Format angka ke format Rupiah
 */
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style:    'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number)
}

/**
 * Menghasilkan Buffer Dokumen PDF SPK resmi
 */
function generateSpkPdfBuffer(spk) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size:   'A4',
        margin: 40,
        info: {
          Title:   `SPK-${spk.nomor_spk.replace(/\//g, '_')}`,
          Author:  'SENADA - Sistem Pengadaan Barang dan Jasa',
          Subject: 'Surat Perintah Kerja',
        },
      })

      const buffers = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })

      // ── Header / Kop Surat ────────────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('PEMERINTAH REPUBLIK INDONESIA', { align: 'center' })
      doc
        .fontSize(12)
        .text('SISTEM PENGADAAN BARANG DAN JASA (SENADA)', { align: 'center' })
      doc
        .font('Helvetica')
        .fontSize(9)
        .text('Gedung Pengadaan Lantai 4, Jl. Jenderal Sudirman No. 1, Jakarta Pusat', { align: 'center' })

      doc.moveDown(0.5)
      doc.lineWidth(2).moveTo(40, doc.y).lineTo(555, doc.y).stroke('#0B1E3D')
      doc.moveDown(1)

      // ── Judul Dokumen ────────────────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#0B1E3D')
        .text('SURAT PERINTAH KERJA (SPK)', { align: 'center' })

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#333333')
        .text(`Nomor Dokumen: ${spk.nomor_spk}`, { align: 'center' })
      doc
        .text(`Tanggal Terbit: ${spk.tanggal_spk || new Date().toISOString().split('T')[0]}`, { align: 'center' })

      doc.moveDown(1)

      // ── Pembukaan & Dasar Pengadaan ──────────────────────────────────────
      const hps = spk.negosiasi?.penawaran?.undanganVendor?.undangan?.hps
      const namaPaket = hps ? hps.nama_paket : 'Pengadaan Barang/Jasa'

      doc
        .fontSize(10)
        .text(
          `Yang bertanda tangan di bawah ini, berdasarkan hasil proses pengadaan pada paket pekerjaan ` +
          `"${namaPaket}" Tahun Anggaran ${hps?.fiscal_year || new Date().getFullYear()}, menerbitkan Surat Perintah Kerja kepada:`,
          { align: 'justify' }
        )

      doc.moveDown(0.8)

      // ── Identitas Para Pihak ─────────────────────────────────────────────
      // PIHAK PERTAMA (PPK)
      doc.font('Helvetica-Bold').text('I. PEJABAT PEMBUAT KOMITMEN (PPK):')
      doc.font('Helvetica')
      doc.text(`   Nama               : ${spk.ppk?.name || '-'}`)
      doc.text(`   NIP / ID           : ${spk.ppk?.employee_id || '-'}`)
      doc.text(`   Jabatan            : Pejabat Pembuat Komitmen (PPK)`)
      doc.text(`   Email / Kontak     : ${spk.ppk?.email || '-'}`)

      doc.moveDown(0.5)

      // PIHAK KEDUA (PENYEDIA)
      doc.font('Helvetica-Bold').text('II. PENYEDIA BARANG / JASA (REKANAN):')
      doc.font('Helvetica')
      doc.text(`   Nama Perusahaan    : ${spk.vendor?.company_name || '-'}`)
      doc.text(`   NPWP               : ${spk.vendor?.npwp || '-'}`)
      doc.text(`   Alamat             : ${spk.vendor?.address || '-'}, ${spk.vendor?.city || ''}`)
      doc.text(`   Rekening Bank      : ${spk.vendor?.bank_name || '-'} a.n ${spk.vendor?.bank_account_holder || '-'}`)
      doc.text(`   Nomor Rekening     : ${spk.vendor?.bank_account_number || '-'}`)

      doc.moveDown(1)

      // ── Nilai Kontrak & Waktu Pelaksanaan ────────────────────────────────
      doc.font('Helvetica-Bold').text('III. KETENTUAN KONTRAK & HARGA KESEPAKATAN:')
      doc.font('Helvetica')
      doc.text(`   Total Nilai Kontrak: ${formatRupiah(spk.nilai_kontrak)} (Termasuk Pajak Berlaku)`)
      doc.text(`   Tanggal Mulai      : ${spk.tanggal_mulai || 'Sesuai SPMK'}`)
      doc.text(`   Tanggal Selesai    : ${spk.tanggal_selesai || 'Sesuai SPK'}`)
      doc.text(`   Status Dokumen     : ${spk.status.toUpperCase()}`)

      doc.moveDown(1)

      // ── Rincian Barang / Jasa (Tabel Sederhana) ───────────────────────────
      const items = spk.negosiasi?.penawaran?.items || []
      if (items.length > 0) {
        doc.font('Helvetica-Bold').text('IV. RINCIAN BARANG / JASA:')
        doc.moveDown(0.4)

        // Table Header
        const startY = doc.y
        doc.rect(40, startY, 515, 20).fill('#F7F8FA')
        doc.fillColor('#0B1E3D').font('Helvetica-Bold').fontSize(9)
        doc.text('No', 45, startY + 5)
        doc.text('Nama Barang / Spesifikasi', 75, startY + 5)
        doc.text('Vol', 320, startY + 5)
        doc.text('Harga Satuan', 370, startY + 5)
        doc.text('Subtotal', 465, startY + 5)

        let itemY = startY + 22
        doc.font('Helvetica').fontSize(9).fillColor('#333333')

        items.forEach((item, idx) => {
          const nama = item.hpsItem?.nama_barang || `Item #${idx + 1}`
          const vol = `${item.hpsItem?.volume || 1} ${item.hpsItem?.satuan || 'Unit'}`
          const harga = formatRupiah(item.harga_satuan)
          const subtotal = formatRupiah(item.subtotal)

          doc.text(String(idx + 1), 45, itemY)
          doc.text(nama, 75, itemY, { width: 235, lineBreak: false })
          doc.text(vol, 320, itemY)
          doc.text(harga, 370, itemY)
          doc.text(subtotal, 465, itemY)

          itemY += 18
        })

        doc.y = itemY + 10
      }

      doc.moveDown(1)

      // ── Tanda Tangan Para Pihak (PPK & Penyedia) ──────────────────────────
      // Cek jika halaman hampir penuh, pindah ke halaman baru
      if (doc.y > 660) {
        doc.addPage()
      }

      const signY = doc.y + 10
      doc.font('Helvetica').fontSize(9).fillColor('#333333')

      // Kolom Penyedia (Kiri)
      doc.text('Untuk dan atas nama Penyedia:', 60, signY)
      doc.font('Helvetica-Bold').text(spk.vendor?.company_name || 'PENYEDIA', 60, signY + 15)

      // Kotak Materai
      doc.rect(60, signY + 35, 75, 45).stroke('#CCCCCC')
      doc.fontSize(8).fillColor('#888888').text('MATERAI\nRp 10.000', 70, signY + 50, { align: 'center' })

      doc.fontSize(9).fillColor('#333333').font('Helvetica-Bold')
      doc.text(`( ${spk.vendor?.company_name || 'Direktur'} )`, 60, signY + 95)
      doc.font('Helvetica').text('Direktur / Pimpinan Perusahaan', 60, signY + 110)

      // Kolom PPK (Kanan)
      doc.text('Untuk dan atas nama Instansi Pengadaan:', 340, signY)
      doc.font('Helvetica-Bold').text('Pejabat Pembuat Komitmen (PPK)', 340, signY + 15)

      if (spk.signed_at) {
        doc.fontSize(8).fillColor('#1E7F52').text(`[ Ditandatangani Secara Elektronik ]\n${new Date(spk.signed_at).toLocaleString('id-ID')}`, 340, signY + 50)
      }

      doc.fontSize(9).fillColor('#333333').font('Helvetica-Bold')
      doc.text(`( ${spk.ppk?.name || 'Ahmad Dahlan'} )`, 340, signY + 95)
      doc.font('Helvetica').text(`NIP. ${spk.ppk?.employee_id || '198001012005011001'}`, 340, signY + 110)

      // Selesai PDF
      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = {
  generateSpkPdfBuffer,
}
