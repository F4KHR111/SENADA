import * as XLSX from 'xlsx'

/**
 * Clean and parse numerical values from Excel cells
 * Handles formats: 15000000, "Rp 15.000.000", "15,000,000.00", "15.000.000,00"
 */
function parseNumericValue(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback
  if (typeof val === 'number') return isNaN(val) ? fallback : val

  let str = String(val).trim()
  str = str.replace(/^(Rp\.?|IDR|\$)\s*/i, '').trim()

  if (/\.\d{3}/.test(str) && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.')
  } else if (/\.\d{3}/.test(str) && !str.includes(',')) {
    str = str.replace(/\./g, '')
  } else if (/,\d{3}/.test(str)) {
    str = str.replace(/,/g, '')
  }

  const num = parseFloat(str)
  return isNaN(num) ? fallback : num
}

/**
 * Normalize unit of measurement (satuan)
 * Converts "bh" / "buah" -> "Buah", "set" -> "Set", "unit" -> "Unit", "pcs" -> "Pcs", etc.
 */
export function normalizeSatuan(rawSatuan) {
  if (!rawSatuan) return 'Unit'
  const s = String(rawSatuan).trim().toLowerCase()
  if (s === 'bh' || s === 'buah') return 'Buah'
  if (s === 'unit') return 'Unit'
  if (s === 'set') return 'Set'
  if (s === 'pcs' || s === 'pc') return 'Pcs'
  if (s === 'lbr' || s === 'lembar') return 'Lembar'
  if (s === 'pkt' || s === 'paket') return 'Paket'
  if (s === 'dus' || s === 'kotak' || s === 'box') return 'Box'
  if (s === 'm' || s === 'meter') return 'Meter'
  if (s === 'm2') return 'M2'
  if (s === 'm3') return 'M3'
  if (s === 'kg') return 'Kg'
  if (s === 'ltr' || s === 'liter') return 'Liter'
  if (s === 'rim') return 'Rim'
  if (s === 'roll') return 'Roll'
  if (s === 'btg' || s === 'batang') return 'Batang'
  if (s === 'org' || s === 'orang' || s === 'ob' || s === 'oj') return rawSatuan.toUpperCase()
  return rawSatuan.charAt(0).toUpperCase() + rawSatuan.slice(1)
}

/**
 * Generate and download standard HPS Excel template (.xlsx)
 * Modeled after real government procurement HPS (Meubelair, IT, etc.)
 */
export function downloadHpsTemplate() {
  const wsData = [
    ['HARGA PERKIRAAN SENDIRI (HPS)'],
    [''],
    ['Pekerjaan', ': Pengadaan Meubelair dan Peralatan Kerja Kantor'],
    ['Lokasi', ': Kantor Pusat Pengadaan'],
    ['Tahun', ': ' + new Date().getFullYear()],
    [''],
    ['No', 'Uraian Barang / Jasa', 'Spesifikasi Teknis', 'Satuan', 'Volume', 'Harga Satuan (Rp)', 'Subtotal (Rp)'],
    ['A.', 'RUANG UTAMA / ARSIP', '', '', '', '', ''],
    [1, 'Sofa Tunggu 2 Dudukan', 'Type: Attha 2 Seater, Uk: 152(P) x 60(L) x 78(T) cm', 'Unit', 2, 5850000, 11700000],
    [2, 'Meja Kerja Kantor dengan Laci', 'Bahan Kayu Solid / Plywood HPL, Uk: 160 x 80 x 75 cm', 'Unit', 5, 2700000, 13500000],
    [3, 'Kursi Kerja Ergonomis', 'Type: Hydrolic, Armrest, Roda Fleksibel, Busa High Density', 'Unit', 5, 1850000, 9250000],
    ['B.', 'PERALATAN IT & ELEKTRONIK', '', '', '', '', ''],
    [4, 'Komputer PC All-in-One Core i7', 'RAM 16GB, SSD 512GB, Display 23.8 Inch FHD, Windows 11 Pro', 'Unit', 3, 18500000, 55500000],
    [5, 'Printer Laser Network Multifungsi', 'Print / Scan / Copy, ADF 50 Lembar, Koneksi WiFi & LAN', 'Unit', 1, 4500000, 4500000],
    [''],
    ['', '', '', '', '', 'Jumlah Harga', 94450000],
    ['', '', '', '', '', 'PPN 11 %', 10389500],
    ['', '', '', '', '', 'Jumlah Harga HPS', 104839500],
    [''],
    ['* Petunjuk Pengisian:'],
    ['1. Format ini kompatibel langsung dengan sistem upload Excel SENADA.'],
    ['2. Angka pada kolom Volume dan Harga Satuan dapat diisi angka biasa (contoh: 5850000).'],
    ['3. Setelah file diupload ke SENADA, Anda tetap dapat mengubah harga satuan dan volume langsung pada tabel sistem.'],
  ]

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  ws['!cols'] = [
    { wch: 6 },
    { wch: 38 },
    { wch: 55 },
    { wch: 12 },
    { wch: 12 },
    { wch: 22 },
    { wch: 22 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'HPS')

  XLSX.writeFile(wb, 'Template_HPS_SENADA.xlsx')
}

/**
 * Robust HPS Excel parser supporting both standard tabular formats
 * and official government procurement HPS spreadsheets (e.g. Istana/Kementerian HPS)
 */
export async function parseHpsExcel(file) {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })

          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            return resolve({
              success: false,
              message: 'File Excel tidak memiliki lembar kerja (worksheet).',
            })
          }

          // Pick the sheet with name 'HPS' or the first sheet
          const sheetName = workbook.SheetNames.find((s) => /hps/i.test(s)) || workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

          if (!rawRows || rawRows.length === 0) {
            return resolve({
              success: false,
              message: 'Lembar kerja Excel kosong.',
            })
          }

          // 1. Extract potential metadata from top rows (e.g. Pekerjaan, Tahun, Program, Lokasi)
          let extractedNamaPaket = ''
          let extractedFiscalYear = ''
          let extractedDeskripsi = ''

          for (let i = 0; i < Math.min(rawRows.length, 16); i++) {
            const rowArr = rawRows[i].map((c) => String(c).trim())
            const firstCol = (rowArr[0] || '').toLowerCase()
            const fullText = rowArr.join(' ')

            if (firstCol.includes('pekerjaan')) {
              extractedNamaPaket = rowArr.slice(1).join(' ').replace(/^:\s*/, '').trim()
            }
            if (firstCol.includes('tahun')) {
              const yrMatch = fullText.match(/20\d{2}/)
              if (yrMatch) extractedFiscalYear = yrMatch[0]
            }
            if (firstCol.includes('program') || firstCol.includes('kegiatan') || firstCol.includes('lokasi')) {
              const cleanPart = rowArr.filter(Boolean).join(' ')
              extractedDeskripsi = extractedDeskripsi ? `${extractedDeskripsi}\n${cleanPart}` : cleanPart
            }
          }

          // 2. Find table header row
          let headerRowIndex = -1
          let colUraian = -1
          let colSpek = -1
          let colSatuan = -1
          let colVolume = -1
          let colHarga = -1

          for (let r = 0; r < Math.min(rawRows.length, 25); r++) {
            const row = rawRows[r].map((cell) => String(cell).toLowerCase().trim())

            const uraianIdx = row.findIndex((c) =>
              c === 'uraian' || c.includes('nama barang') || c.includes('nama') || c.includes('item') || c.includes('pekerjaan')
            )
            const hargaIdx = row.findIndex((c) =>
              c.includes('harga') || c.includes('tarif') || c.includes('biaya') || c.includes('estimasi')
            )
            const volumeIdx = row.findIndex((c) =>
              c.includes('vol') || c.includes('qty') || c.includes('jumlah') || c.includes('kuantitas')
            )

            if (uraianIdx !== -1 && (hargaIdx !== -1 || volumeIdx !== -1)) {
              headerRowIndex = r
              colUraian = uraianIdx
              colVolume = volumeIdx
              colHarga = hargaIdx
              colSpek = row.findIndex((c) =>
                c.includes('spesifikasi') || c.includes('spek') || c.includes('keterangan')
              )
              colSatuan = row.findIndex((c) =>
                (c === 'satuan' || (c.includes('satuan') && !c.includes('harga') && !c.includes('tarif') && !c.includes('biaya'))) ||
                c === 'unit' ||
                c === 'uom'
              )
              break
            }
          }

          // Fallback if no header row found
          if (headerRowIndex === -1) {
            headerRowIndex = 0
            colUraian = 1
            colSpek = 2
            colSatuan = 3
            colVolume = 4
            colHarga = 5
          }

          // If colSatuan is not found, or matches harga/volume, auto-detect intervening column between volume and harga
          if (colSatuan === -1 || colSatuan === colHarga || colSatuan === colVolume) {
            if (colVolume !== -1 && colHarga !== -1 && Math.abs(colHarga - colVolume) > 1) {
              const minCol = Math.min(colVolume, colHarga)
              const maxCol = Math.max(colVolume, colHarga)
              for (let c = minCol + 1; c < maxCol; c++) {
                const sample = rawRows.slice(headerRowIndex + 1, headerRowIndex + 15).map((r) => String(r[c] || '').trim()).filter(Boolean)
                if (sample.length > 0 && sample.some((s) => isNaN(Number(s)))) {
                  colSatuan = c
                  break
                }
              }
            }
          }

          // If volume column is at col 4 and satuan at col 5 in government layout
          // (No [0], Uraian [1], blank [2,3], Volume [4], Satuan [5], Harga [6], Jumlah [7])
          const items = []
          let currentCategory = ''
          let currentItem = null

          for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
            const row = rawRows[r]
            if (!row || row.length === 0) continue

            const col0 = String(row[0] || '').trim()
            const uraian = String(row[colUraian] || '').trim()
            const rowStr = row.map((c) => String(c).trim()).join(' ')

            // Stop on summary rows (e.g. Jumlah Harga, PPN, Terbilang, Pejabat)
            if (/jumlah harga|ppn|jumlah total|total hps|terbilang|yogyakarta|pejabat pembuat|mengetahui/i.test(rowStr)) {
              break
            }

            // Category row like "A. RUANG ARSIP", "B. RUANG WORKSTATION"
            if (/^[A-Z]\./.test(col0) || /^[A-Z]\.\s*[A-Z]/i.test(uraian)) {
              if (currentItem) {
                items.push(currentItem)
                currentItem = null
              }
              currentCategory = (col0 + ' ' + uraian).replace(/\s+/g, ' ').trim()
              continue
            }

            if (/^terdiri dari/i.test(uraian)) continue

            // Determine if this row is a new item or a sub-specification line
            // Check numeric columns
            const volCandidate = colVolume !== -1 ? parseNumericValue(row[colVolume], null) : null
            const hargaCandidate = colHarga !== -1 ? parseNumericValue(row[colHarga], null) : null

            // Determine satuan per item safely (never accept numeric values as unit)
            let rawSatuan = ''
            if (colSatuan !== -1 && row[colSatuan]) {
              const val = String(row[colSatuan]).trim()
              if (val && isNaN(Number(val)) && !/^[\d\.\,]+$/.test(val)) {
                rawSatuan = val
              }
            }

            // If still empty or was numeric, inspect adjacent column right after volume (e.g. col 5 in government templates)
            if (!rawSatuan && colVolume !== -1 && row[colVolume + 1]) {
              const nextColVal = String(row[colVolume + 1] || '').trim()
              if (nextColVal && isNaN(Number(nextColVal)) && !/^[\d\.\,]+$/.test(nextColVal)) {
                rawSatuan = nextColVal
              }
            }

            // Fallback search across row for standard unit terms if still empty
            if (!rawSatuan) {
              const unitRegex = /^(bh|buah|unit|set|pcs|paket|lembar|lbr|meter|m|m2|m3|kg|liter|box|kotak|dus|org|orang|kegiatan|roll|btg|batang)$/i
              for (let c = 0; c < row.length; c++) {
                const cellVal = String(row[c] || '').trim()
                if (unitRegex.test(cellVal)) {
                  rawSatuan = cellVal
                  break
                }
              }
            }

            const satuanCandidate = normalizeSatuan(rawSatuan)

            const isItemRow =
              (/^\d+[\.\)]?$/.test(col0) || typeof row[0] === 'number') &&
              volCandidate !== null &&
              volCandidate > 0 &&
              hargaCandidate !== null &&
              hargaCandidate >= 0

            // Or standard tabular format where each row has nama, vol, and harga
            const isStandardRow =
              uraian &&
              !/^\*/.test(uraian) &&
              volCandidate !== null &&
              volCandidate > 0 &&
              hargaCandidate !== null &&
              hargaCandidate >= 0

            if (isItemRow || isStandardRow) {
              if (currentItem) {
                items.push(currentItem)
              }

              const spekDirect = colSpek !== -1 && colSpek !== colUraian ? String(row[colSpek] || '').trim() : ''

              currentItem = {
                id: `item-excel-${Date.now()}-${items.length + 1}`,
                nama_barang: (currentCategory ? `${currentCategory} - ` : '') + uraian.replace(/^-\s*/, '').trim(),
                spesifikasi: spekDirect,
                satuan: satuanCandidate,
                volume: volCandidate || 1,
                harga_satuan: hargaCandidate || 0,
              }
            } else if (currentItem && uraian && !/^\d+/.test(col0)) {
              // Sub-line specifications (e.g. Type, Ukuran, Bahan)
              const cleanSubLine = uraian.trim()
              if (cleanSubLine && !cleanSubLine.startsWith('*')) {
                currentItem.spesifikasi = currentItem.spesifikasi
                  ? `${currentItem.spesifikasi}; ${cleanSubLine}`
                  : cleanSubLine
              }
            }
          }

          if (currentItem) {
            items.push(currentItem)
          }

          if (items.length === 0) {
            return resolve({
              success: false,
              message: 'Tidak ditemukan baris rincian barang/jasa yang valid di dalam file Excel.',
            })
          }

          const totalEstimated = items.reduce(
            (acc, it) => acc + (parseFloat(it.volume) || 0) * (parseFloat(it.harga_satuan) || 0),
            0
          )

          return resolve({
            success: true,
            fileName: file.name,
            fileSize: file.size,
            count: items.length,
            totalEstimated,
            items,
            metadata: {
              nama_paket: extractedNamaPaket,
              fiscal_year: extractedFiscalYear,
              deskripsi: extractedDeskripsi,
            },
          })
        } catch (err) {
          return resolve({
            success: false,
            message: `Gagal membaca file Excel: ${err.message}`,
          })
        }
      }

      reader.onerror = () => {
        resolve({
          success: false,
          message: 'Gagal membuka berkas Excel yang dipilih.',
        })
      }

      reader.readAsArrayBuffer(file)
    } catch (err) {
      resolve({
        success: false,
        message: err.message || 'Terjadi kesalahan sistem saat memproses berkas.',
      })
    }
  })
}

/**
 * Export existing HPS items to Excel file (.xlsx)
 */
export function exportHpsToExcel(hps, items = []) {
  const wsData = [
    [`HARGA PERKIRAAN SENDIRI (HPS)`],
    [`Pekerjaan`, `: ${hps?.nama_paket || 'Paket Pengadaan'}`],
    [`Nomor HPS`, `: ${hps?.nomor_hps || '-'}`],
    [`Tahun Anggaran`, `: ${hps?.fiscal_year || '-'}`],
    [''],
    ['No', 'Uraian Barang / Jasa', 'Spesifikasi Teknis', 'Satuan', 'Volume', 'Harga Satuan (Rp)', 'Subtotal (Rp)'],
  ]

  items.forEach((item, idx) => {
    const vol = parseFloat(item.volume) || 0
    const harga = parseFloat(item.harga_satuan) || 0
    const subtotal = vol * harga
    wsData.push([idx + 1, item.nama_barang || '', item.spesifikasi || '', item.satuan || '', vol, harga, subtotal])
  })

  const jumlahHarga = items.reduce(
    (acc, it) => acc + (parseFloat(it.volume) || 0) * (parseFloat(it.harga_satuan) || 0),
    0
  )
  const ppn11 = Math.round(jumlahHarga * 0.11)
  const jumlahHargaHps = jumlahHarga + ppn11

  wsData.push([])
  wsData.push(['', '', '', '', '', 'Jumlah Harga', jumlahHarga])
  wsData.push(['', '', '', '', '', 'PPN 11 %', ppn11])
  wsData.push(['', '', '', '', '', 'Jumlah Harga HPS', jumlahHargaHps])

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  ws['!cols'] = [
    { wch: 6 },
    { wch: 38 },
    { wch: 50 },
    { wch: 12 },
    { wch: 12 },
    { wch: 22 },
    { wch: 22 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'HPS')

  const safeNomor = (hps?.nomor_hps || 'HPS').replace(/[^a-zA-Z0-9_-]/g, '_')
  XLSX.writeFile(wb, `${safeNomor}_Rincian_HPS.xlsx`)
}
