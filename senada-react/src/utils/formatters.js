/**
 * Format angka ke format mata uang Rupiah (Rp XX.XXX.XXX)
 */
export function formatRupiah(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'Rp 0'
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numeric)
}

/**
 * Format tanggal ke format bahasa Indonesia (mis. 2 September 2026)
 */
export function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Format tanggal dan waktu (mis. 2 September 2026, 14:30 WIB)
 */
export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '-'
  const date = new Date(dateTimeString)
  if (isNaN(date.getTime())) return '-'
  return (
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date) + ' WIB'
  )
}

/**
 * Format ukuran file ke byte, KB, atau MB
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Konversi angka rupiah ke kalimat terbilang bahasa Indonesia
 */
export function terbilang(n) {
  if (isNaN(n) || n === null || n === undefined) return ''
  const angka = Math.floor(Math.abs(Number(n)))
  if (angka === 0) return 'Nol rupiah'

  const huruf = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas']

  function baca(num) {
    if (num < 12) return huruf[num]
    if (num < 20) return baca(num - 10) + ' belas'
    if (num < 100) return baca(Math.floor(num / 10)) + ' puluh ' + (num % 10 !== 0 ? baca(num % 10) : '')
    if (num < 200) return 'seratus ' + (num - 100 !== 0 ? baca(num - 100) : '')
    if (num < 1000) return baca(Math.floor(num / 100)) + ' ratus ' + (num % 100 !== 0 ? baca(num % 100) : '')
    if (num < 2000) return 'seribu ' + (num - 1000 !== 0 ? baca(num - 1000) : '')
    if (num < 1000000) return baca(Math.floor(num / 1000)) + ' ribu ' + (num % 1000 !== 0 ? baca(num % 1000) : '')
    if (num < 1000000000) return baca(Math.floor(num / 1000000)) + ' juta ' + (num % 1000000 !== 0 ? baca(num % 1000000) : '')
    if (num < 1000000000000) return baca(Math.floor(num / 1000000000)) + ' milyar ' + (num % 1000000000 !== 0 ? baca(num % 1000000000) : '')
    return baca(Math.floor(num / 1000000000000)) + ' triliun ' + (num % 1000000000000 !== 0 ? baca(num % 1000000000000) : '')
  }

  const hasil = baca(angka).replace(/\s+/g, ' ').trim()
  return hasil.charAt(0).toUpperCase() + hasil.slice(1) + ' rupiah'
}
