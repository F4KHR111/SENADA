import React, { useState, useEffect } from 'react'
import useAuthStore from '../../../store/authStore'
import authService from '../../../services/authService'
import { Card, CardHeader, CardBody, CardFooter } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { Badge } from '../../../components/Badge'
import { useVendorEvaluationStats } from '../../penilaian/hooks/usePenilaian'
import { formatDate } from '../../../utils/formatters'
import {
  Building2,
  CreditCard,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Save,
  Star,
  Award,
  MessageSquare,
} from 'lucide-react'

export function VendorProfilePage() {
  const { user, setUser } = useAuthStore()
  const vp = user?.vendorProfile || {}

  const { data: evalStatsData } = useVendorEvaluationStats(vp?.id)
  const stats = evalStatsData?.data

  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    npwp: '',
    address: '',
    city: '',
    phone: '',
    pic_name: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_holder: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  useEffect(() => {
    if (user) {
      setFormData({
        company_name: vp.company_name || '',
        npwp: vp.npwp || '',
        address: vp.address || '',
        city: vp.city || '',
        phone: vp.phone || user.phone || '',
        pic_name: user.name || '',
        bank_name: vp.bank_name || '',
        bank_account_number: vp.bank_account_number || '',
        bank_account_holder: vp.bank_account_holder || '',
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setFeedback({ type: '', message: '' })

    try {
      const res = await authService.updateVendorProfile(formData)
      if (res?.data) {
        setUser(res.data)
      }
      setFeedback({
        type: 'success',
        message: 'Data profil perusahaan, nomor NPWP, dan rekening bank berhasil diperbarui!',
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan perubahan profil perusahaan.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verification badge renderer
  const renderVerificationBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Terverifikasi (Aktif Pengadaan)</span>
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold font-sans">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Verifikasi Ditolak</span>
          </span>
        )
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold font-sans animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Menunggu Verifikasi Admin</span>
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-navy-900 text-white rounded-lg inline-flex">
              <Building2 className="w-5 h-5 text-blue-300" />
            </span>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              Profil Legalitas & Rekening Perusahaan
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Kelola data legalitas badan usaha, nomor NPWP, rekening pencairan dana, serta narahubung rekanan (AGENTS.md §4 Tahap 3 & §7).
          </p>
        </div>

        <div>{renderVerificationBadge(vp.verification_status)}</div>
      </div>

      {/* ── Status Notice Banner ────────────────────────────────────── */}
      {vp.verification_status === 'pending' && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Akun Rekanan Sedang Dalam Antrean Verifikasi</p>
            <p className="text-amber-800">
              Tim Pejabat Pengadaan dan Admin instansi sedang meninjau validitas NPWP dan legalitas perusahaan Anda. Anda dapat memperbarui informasi rekening dan domisili di bawah ini kapan saja.
            </p>
          </div>
        </div>
      )}

      {vp.verification_status === 'verified' && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Perusahaan Telah Terverifikasi Resmi</p>
            <p className="text-emerald-800">
              Perusahaan Anda memenuhi syarat untuk menerima undangan pengadaan, mengajukan penawaran harga, dan menandatangani kontrak SPK.
            </p>
          </div>
        </div>
      )}

      {/* ── Feedback Message ────────────────────────────────────────── */}
      {feedback.message && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Card 1: Identitas Legalitas Usaha ───────────────────────── */}
        <Card>
          <CardHeader
            title="1. Identitas Legalitas Badan Usaha"
            subtitle="Informasi resmi perusahaan yang tercantum pada dokumen penawaran dan kontrak SPK"
          />
          <CardBody className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Nama Perusahaan / Rekanan *
              </label>
              <Input
                name="company_name"
                required
                placeholder="Contoh: PT. Sumber Makmur Abadi"
                value={formData.company_name}
                onChange={handleChange}
                leftIcon={<Building2 className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Nomor Pokok Wajib Pajak (NPWP) *
              </label>
              <Input
                name="npwp"
                required
                placeholder="00.000.000.0-000.000"
                value={formData.npwp}
                onChange={handleChange}
                leftIcon={<FileText className="w-4 h-4" />}
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Digunakan untuk pelaporan SPM via SAKTI & bukti potong pajak.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Kota / Kabupaten Domisili *
              </label>
              <Input
                name="city"
                required
                placeholder="Contoh: Jakarta Pusat"
                value={formData.city}
                onChange={handleChange}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Alamat Lengkap Perusahaan *
              </label>
              <textarea
                name="address"
                required
                rows={3}
                placeholder="Alamat kantor sesuai SK Domisili / NIB..."
                value={formData.address}
                onChange={handleChange}
                className="w-full text-xs bg-white text-navy-900 rounded-lg border border-gray-200 p-3 focus:outline-none focus:border-navy-500 font-sans"
              />
            </div>
          </CardBody>
        </Card>

        {/* ── Card 2: Rekening Bank Pencairan Dana ───────────────────── */}
        <Card>
          <CardHeader
            title="2. Rekening Bank Pembayaran Kontrak"
            subtitle="Rekening ini akan dicantumkan pada Resume SPK dan Surat Perintah Membayar (SPM)"
          />
          <CardBody className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Nama Bank Penyedia *
              </label>
              <Input
                name="bank_name"
                required
                placeholder="Contoh: Bank Mandiri / BCA / BNI / BRI"
                value={formData.bank_name}
                onChange={handleChange}
                leftIcon={<CreditCard className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Nomor Rekening Bank *
              </label>
              <Input
                name="bank_account_number"
                required
                placeholder="Nomor rekening bank penyedia"
                value={formData.bank_account_number}
                onChange={handleChange}
                className="font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Nama Pemilik Rekening *
              </label>
              <Input
                name="bank_account_holder"
                required
                placeholder="Harus sesuai buku tabungan / rekening koran"
                value={formData.bank_account_holder}
                onChange={handleChange}
              />
            </div>
          </CardBody>
        </Card>

        {/* ── Card 3: Kontak Narahubung / PIC ────────────────────────── */}
        <Card>
          <CardHeader
            title="3. Narahubung & Komunikasi (PIC)"
            subtitle="Petugas yang berwenang dalam proses penawaran harga dan negosiasi"
          />
          <CardBody className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Nama Narahubung / Penanggung Jawab *
              </label>
              <Input
                name="pic_name"
                required
                placeholder="Nama direktur / perwakilan penawar"
                value={formData.pic_name}
                onChange={handleChange}
                leftIcon={<User className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Nomor Telepon / WhatsApp Aktif *
              </label>
              <Input
                name="phone"
                required
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={handleChange}
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>
          </CardBody>
          <CardFooter className="p-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-200">
            <span className="text-[11px] text-gray-400">
              Pastikan data rekening bank dan NPWP valid untuk kelancaran administrasi keuangan.
            </span>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Simpan Perubahan Profil
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* ── Card 4: Reputasi & Riwayat Penilaian Kinerja PPK ──────────── */}
      <Card>
        <CardHeader
          title="4. Rekam Jejak & Reputasi Kinerja (Evaluasi PPK)"
          subtitle="Akumulasi skor bintang dan ulasan resmi dari Pejabat Pembuat Komitmen (PPK) pasca serah terima SPK"
          action={
            stats && stats.total_evaluations > 0 ? (
              <Badge variant="success" size="sm">
                ⭐ {stats.average_score.toFixed(2)} / 5.00 ({stats.total_evaluations} Evaluasi)
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                Belum ada penilaian
              </Badge>
            )
          }
        />
        <CardBody className="p-6 space-y-6">
          {stats && stats.total_evaluations > 0 ? (
            <div className="space-y-6">
              {/* Ringkasan Skor Header */}
              <div className="p-5 bg-gradient-to-r from-navy-900 to-navy-700 rounded-xl text-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                    <Award className="w-7 h-7 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-300 uppercase tracking-wider font-semibold">
                      Rating Rata-Rata Penyedia
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-bold font-mono text-white">
                        {stats.average_score.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-300">/ 5.00</span>
                      <div className="flex items-center gap-1 ml-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= Math.round(stats.average_score)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 w-full md:w-auto">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-300">Kualitas</p>
                    <p className="text-sm font-bold font-mono text-white">
                      {stats.avg_kualitas.toFixed(1)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-300">Waktu</p>
                    <p className="text-sm font-bold font-mono text-white">
                      {stats.avg_waktu.toFixed(1)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-300">Layanan</p>
                    <p className="text-sm font-bold font-mono text-white">
                      {stats.avg_layanan.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Daftar Riwayat Review SPK */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Riwayat Ulasan Kontrak Selesai
                </h4>
                <div className="space-y-3">
                  {stats.evaluations.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-navy-900 px-2 py-0.5 bg-white border border-gray-200 rounded-md">
                            {item.spk?.nomor_spk || 'SPK'}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">
                            Penilai: <strong>{item.evaluator?.name || 'PPK'}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="font-bold font-mono text-amber-800 text-xs">
                              {parseFloat(item.skor_akhir).toFixed(2)}
                            </span>
                          </div>
                          <span className="text-gray-400 text-[11px]">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-1 px-2.5 bg-white border border-gray-100 rounded-lg text-[11px] text-gray-600">
                        <span>Mutu Barang: <strong className="text-navy-900">{item.kualitas_skor}/5</strong></span>
                        <span>Ketepatan Waktu: <strong className="text-navy-900">{item.waktu_skor}/5</strong></span>
                        <span>Komunikasi: <strong className="text-navy-900">{item.layanan_skor}/5</strong></span>
                      </div>

                      {item.catatan ? (
                        <p className="text-gray-700 italic pt-0.5 flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-navy-500 shrink-0 mt-0.5" />
                          <span>"{item.catatan}"</span>
                        </p>
                      ) : (
                        <p className="text-gray-400 italic text-[11px]">
                          Tidak ada catatan masukan khusus.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 space-y-2">
              <Star className="w-8 h-8 mx-auto text-gray-300 stroke-[1.5]" />
              <p className="text-xs font-medium text-gray-600">
                Belum ada riwayat penilaian kinerja dari Pejabat Pembuat Komitmen (PPK).
              </p>
              <p className="text-[11px] text-gray-400 max-w-md mx-auto">
                Skor reputasi akan otomatis muncul di sini setelah perusahaan Anda menyelesaikan serah terima barang/jasa untuk SPK resmi.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default VendorProfilePage
