import React from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { Card, CardHeader, CardBody } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { useAdminStats } from '../admin/hooks/useAdmin'
import { useHpsList } from '../hps/hooks/useHps'
import { useSpkList } from '../spk/hooks/useSpk'
import { usePenawaranList } from '../penawaran/hooks/usePenawaran'
import { useUndanganList } from '../undangan/hooks/useUndangan'
import { useSpmList, useRealisasiList } from '../laporan/hooks/useLaporan'
import { formatRupiah, formatDate } from '../../utils/formatters'
import {
  FileSpreadsheet,
  Mail,
  Send,
  Scale,
  FileSignature,
  CheckSquare,
  BarChart3,
  Shield,
  ArrowRight,
  Users,
  CheckCircle2,
  History,
  Truck,
  Building2,
  FileCheck,
  ClipboardList,
  AlertTriangle,
  UserCheck,
  FileText,
  Landmark,
  Clock,
  ExternalLink,
  Plus,
} from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuthStore()

  const roleDescriptions = {
    admin: 'Sebagai Administrator, Anda memiliki akses penuh terhadap manajemen pengguna, verifikasi berkas vendor, dan audit log sistem pengadaan.',
    ppk: 'Sebagai Pejabat Pembuat Komitmen (PPK), Anda bertanggung jawab dalam penyusunan HPS, penerbitan & penandatanganan SPK, serta penerimaan hasil serah terima pengadaan.',
    pbj: 'Sebagai Pejabat Pengadaan (PBJ), Anda bertugas memverifikasi HPS, membuat undangan pengadaan, memeriksa perbandingan penawaran, dan menjalankan proses negosiasi.',
    penyedia: 'Sebagai Penyedia / Rekanan, Anda dapat mengelola profil perusahaan, menerima undangan masuk, mengajukan penawaran harga, merespon negosiasi, memantau SPK, dan mengunggah dokumen pengiriman.',
    ppspm: 'Sebagai PPSPM, Anda memiliki akses monitoring Resume SPK dan integrasi pencatatan nomor SPM aplikasi SAKTI.',
    petugas_laporan: 'Sebagai Petugas Laporan Realisasi, Anda bertugas memantau Resume SPK dan mencatat realisasi anggaran belanja pengadaan.',
  }

  const primaryRole = user?.roles?.[0] || 'penyedia'
  const roleDescription = roleDescriptions[primaryRole] || 'Selamat datang di Sistem Pengadaan Barang dan Jasa SENADA.'

  // Kartu modul yang disesuaikan secara presisi per role (AGENTS.md Â§5)
  const roleModuleMap = {
    admin: [
      {
        title: 'User Management',
        description: 'Kelola data pengguna, penetapan peran (role), dan status akses akun sistem.',
        path: '/admin/users',
        icon: <Users className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'Verifikasi Vendor',
        description: 'Pemeriksaan kelengkapan legalitas perusahaan rekanan (NPWP, NIB, rekening bank).',
        path: '/admin/vendors',
        icon: <CheckCircle2 className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'Audit Log Sistem',
        description: 'Pencatatan jejak audit seluruh tindakan krusial pengguna (approval, penawaran, TTE SPK).',
        path: '/admin/audit-logs',
        icon: <History className="w-5 h-5 text-navy-500" />,
      },
    ],
    ppk: [
      {
        title: 'HPS (Harga Perkiraan Sendiri)',
        description: 'Penyusunan rincian barang, volume, estimasi harga HPS, dan penetapan spesifikasi.',
        path: '/hps',
        icon: <FileSpreadsheet className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'Surat Pesanan / SPK',
        description: 'Penerbitan kontrak SPK dari hasil negosiasi yang disetujui dan ekspor dokumen PDF.',
        path: '/spk',
        icon: <FileSignature className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'Serah Terima Barang / Jasa',
        description: 'Pemeriksaan berkas serah terima pengiriman dan penerbitan Berita Acara (BAST).',
        path: '/serah-terima',
        icon: <CheckSquare className="w-5 h-5 text-navy-500" />,
      },
    ],
    pbj: [
      {
        title: 'Verifikasi HPS',
        description: 'Pemeriksaan dan persetujuan rancangan HPS yang diajukan oleh PPK.',
        path: '/hps',
        icon: <FileSpreadsheet className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'Undangan Pengadaan',
        description: 'Pemilihan rekanan penyedia dan penerbitan surat undangan paket pengadaan.',
        path: '/undangan',
        icon: <Mail className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'Perbandingan Penawaran',
        description: 'Monitoring dan evaluasi berkas penawaran harga yang masuk dari para rekanan.',
        path: '/penawaran',
        icon: <Send className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'Negosiasi Harga',
        description: 'Pelaksanaan ronde klarifikasi teknis dan tawar-menawar harga dengan penyedia.',
        path: '/negosiasi',
        icon: <Scale className="w-5 h-5 text-navy-500" />,
      },
    ],
    penyedia: [
      {
        title: 'Profil Perusahaan',
        description: 'Kelola data legalitas perusahaan, nomor NPWP, alamat domisili, dan rekening bank.',
        path: '/vendor/profil',
        icon: <Building2 className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'Undangan Masuk',
        description: 'Daftar paket pengadaan aktif yang mengundang perusahaan Anda untuk ikut menawar.',
        path: '/undangan',
        icon: <Mail className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'Penawaran Saya',
        description: 'Riwayat dan status berkas penawaran harga yang telah diajukan perusahaan Anda.',
        path: '/penawaran',
        icon: <Send className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'Negosiasi',
        description: 'Ronde usulan harga nego dari PBJ yang memerlukan persetujuan dari perusahaan Anda.',
        path: '/negosiasi',
        icon: <Scale className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'SPK Saya',
        description: 'Daftar kontrak kerja / Surat Pesanan resmi yang diterbitkan untuk perusahaan Anda.',
        path: '/spk',
        icon: <FileSignature className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'Pengiriman & Serah Terima',
        description: 'Unggah bukti pengiriman barang, surat jalan, dan pantau status Berita Acara.',
        path: '/serah-terima',
        icon: <Truck className="w-5 h-5 text-navy-500" />,
      },
    ],
    ppspm: [
      {
        title: 'Resume SPK',
        description: 'Tinjauan rekapitulasi data kontrak SPK dan ekspor format terstandar SAKTI.',
        path: '/laporan?tab=rekap',
        icon: <ClipboardList className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'SPM Reference',
        description: 'Pencatatan nomor referensi Surat Perintah Membayar (SPM) dari aplikasi SAKTI.',
        path: '/laporan?tab=spm',
        icon: <FileCheck className="w-5 h-5 text-navy-500" />,
      },
    ],
    petugas_laporan: [
      {
        title: 'Resume SPK',
        description: 'Tinjauan rekapitulasi data kontrak SPK aktif dan riwayat serah terima pekerjaan.',
        path: '/laporan?tab=rekap',
        icon: <ClipboardList className="w-5 h-5 text-navy-500" />,
      },
      {
        title: 'Laporan Realisasi Anggaran',
        description: 'Penginputan realisasi anggaran belanja pengadaan ke modul laporan keuangan internal.',
        path: '/laporan?tab=realisasi',
        icon: <BarChart3 className="w-5 h-5 text-navy-500" />,
      },
    ],
  }

  const accessibleModules = roleModuleMap[primaryRole] || roleModuleMap.penyedia

  // Query stats jika role adalah admin
  const { data: adminStatsData } = useAdminStats()
  const adminStats = adminStatsData?.data

  const isPPK = primaryRole === 'ppk'
  const isPBJ = primaryRole === 'pbj'
  const isVendor = primaryRole === 'penyedia'
  const isPPSPM = primaryRole === 'ppspm'
  const isPetugasLaporan = primaryRole === 'petugas_laporan'

  const { data: hpsData } = useHpsList({ limit: 100 })
  const { data: spkData } = useSpkList({ limit: 100 })
  const { data: penawaranData } = usePenawaranList({ limit: 100 })
  const { data: undanganData } = useUndanganList({ limit: 100 })
  const { data: spmData } = useSpmList()
  const { data: realisasiData } = useRealisasiList()

  const allHps = Array.isArray(hpsData?.data) ? hpsData.data : (hpsData?.data?.rows || [])
  const myHps = isPPK ? allHps.filter((h) => h.ppk_id === user?.id) : allHps

  const hpsDraftCount = myHps.filter((h) => h.status === 'draft').length
  const hpsVerifiedCount = myHps.filter((h) => h.status === 'verified').length
  const hpsFixedCount = myHps.filter((h) => h.status === 'fixed').length

  const allSpk = spkData?.data || []
  const mySpk = isPPK ? allSpk.filter((s) => s.ppk_id === user?.id) : allSpk
  const activeSpkCount = mySpk.filter((s) => s.status === 'active' || s.status === 'signed').length
  const draftSpkCount = mySpk.filter((s) => s.status === 'draft').length

  // Stats khusus PBJ
  const hpsWaitingVerifyCount = allHps.filter((h) => h.status === 'draft').length
  const hpsVerifiedPBJCount = allHps.filter((h) => h.status === 'verified' || h.status === 'fixed').length
  const allPenawaran = penawaranData?.data || []
  const activeNegosiasiCount = allPenawaran.filter((p) => p.status === 'negotiating').length
  const submittedPenawaranCount = allPenawaran.filter((p) => p.status === 'submitted').length

  // Stats khusus Vendor / Penyedia
  const myInvitations = undanganData?.data || []
  const newInvitationCount = myInvitations.filter((u) => u.status === 'sent').length
  const myPenawaranList = penawaranData?.data || []
  const vendorSubmittedPenawaranCount = myPenawaranList.filter((p) => p.status === 'submitted').length
  const vendorNegotiatingCount = myPenawaranList.filter((p) => p.status === 'negotiating').length
  const vendorApprovedCount = myPenawaranList.filter((p) => p.status === 'approved').length
  const mySpkList = spkData?.data || []
  const vendorSpkActiveCount = mySpkList.filter((s) => s.status === 'active' || s.status === 'signed').length

  // Stats & List khusus PPSPM: SPK completed / BAST selesai yang belum ada SPM Reference (AGENTS.md Â§4 Tahap 7)
  const spmReferenceList = spmData?.data || []
  const existingSpmSpkIds = new Set(spmReferenceList.map((s) => s.spk_id))
  const spkCompletedWithoutSpm = allSpk.filter((s) => {
    const isCompleted = s.status === 'completed' || s.serahTerima?.status === 'completed'
    const hasSpm = existingSpmSpkIds.has(s.id) || (s.spmReferences && s.spmReferences.length > 0)
    return isCompleted && !hasSpm
  })

  // Stats & List khusus Petugas Laporan Realisasi: SPK completed yang belum dilaporkan realisasinya (AGENTS.md Â§4 Tahap 7)
  const realisasiList = realisasiData?.data || []
  const existingRealisasiSpkIds = new Set(realisasiList.map((r) => r.spk_id))
  const spkCompletedWithoutRealisasi = allSpk.filter((s) => {
    const isCompleted = s.status === 'completed' || s.serahTerima?.status === 'completed'
    const hasRealisasi = existingRealisasiSpkIds.has(s.id) || (s.laporanRealisasiList && s.laporanRealisasiList.length > 0)
    return isCompleted && !hasRealisasi
  })

  // Stat cards per role
  const statCards = {
    admin: adminStats ? [
      { label: 'Total Pengguna', value: adminStats.total_users || 0, sub: `${adminStats.active_users || 0} akun aktif`, accent: 'blue' },
      { label: 'Vendor Menunggu', value: adminStats.vendors?.pending || 0, sub: 'Perlu verifikasi', accent: 'amber', alert: (adminStats.vendors?.pending || 0) > 0 },
      { label: 'Vendor Terverifikasi', value: adminStats.vendors?.verified || 0, sub: 'Rekanan aktif', accent: 'green' },
    ] : [],
    ppk: [
      { label: 'HPS Draf', value: hpsDraftCount, sub: 'Bisa diedit', accent: 'gray' },
      { label: 'HPS Diverifikasi', value: hpsVerifiedCount, sub: 'Siap diundang', accent: 'blue' },
      { label: 'HPS Fixed', value: hpsFixedCount, sub: 'Terkunci', accent: 'green' },
      { label: 'SPK Aktif', value: activeSpkCount, sub: draftSpkCount > 0 ? `${draftSpkCount} menunggu TTE` : 'Berjalan', accent: 'navy' },
    ],
    pbj: [
      { label: 'HPS Menunggu Verifikasi', value: hpsWaitingVerifyCount, sub: 'Perlu dikunci', accent: 'amber', alert: hpsWaitingVerifyCount > 0 },
      { label: 'HPS Siap Diundang', value: hpsVerifiedPBJCount, sub: 'Buat undangan', accent: 'blue' },
      { label: 'Penawaran Masuk', value: submittedPenawaranCount, sub: 'Menunggu evaluasi', accent: 'gray' },
      { label: 'Negosiasi Berjalan', value: activeNegosiasiCount, sub: 'Perlu respons', accent: 'navy' },
    ],
    penyedia: [
      { label: 'Undangan Masuk', value: newInvitationCount, sub: 'Perlu direspons', accent: 'blue', alert: newInvitationCount > 0 },
      { label: 'Penawaran Diajukan', value: vendorSubmittedPenawaranCount, sub: 'Menunggu evaluasi', accent: 'gray' },
      { label: 'Sedang Negosiasi', value: vendorNegotiatingCount, sub: 'Perlu persetujuan', accent: 'amber' },
      { label: 'SPK Aktif', value: vendorSpkActiveCount, sub: 'Pekerjaan berjalan', accent: 'green' },
    ],
    ppspm: [
      { label: 'SPK Menunggu SPM', value: spkCompletedWithoutSpm.length, sub: 'Belum ada referensi SPM', accent: 'amber', alert: spkCompletedWithoutSpm.length > 0 },
      { label: 'Total SPM Tercatat', value: spmReferenceList.length, sub: 'Sudah diproses', accent: 'green' },
    ],
    petugas_laporan: [
      { label: 'SPK Belum Dilaporkan', value: spkCompletedWithoutRealisasi.length, sub: 'Perlu input realisasi', accent: 'amber', alert: spkCompletedWithoutRealisasi.length > 0 },
      { label: 'Total Realisasi Tercatat', value: realisasiList.length, sub: 'Sudah dilaporkan', accent: 'green' },
    ],
  }

  const cards = statCards[primaryRole] || []

  const accentColors = {
    blue:  { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500' },
    gray:  { bg: 'bg-gray-50',   text: 'text-gray-600',   dot: 'bg-gray-400' },
    navy:  { bg: 'bg-[#EEF2F9]', text: 'text-[#1B3A66]',  dot: 'bg-[#2E5090]' },
  }

  return (
    <div className="font-sans min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">

        {/* ════════════════════════════════════════════════════════════════
            SECTION 1: SPLIT ARCHITECTURAL HERO (Inspired by Spaciaz)
            Left: Contained Architectural Card
            Right: Editorial Typography, Action Buttons, & Big Stats
            ════════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* LEFT: Contained Architectural Photo Card */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden min-h-[460px] lg:min-h-[560px] shadow-[0_16px_40px_rgba(11,30,61,0.10)] border border-gray-200/80 group flex flex-col justify-between p-6 sm:p-8">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: `url('/gedung-hero.jpg')`,
                backgroundPosition: 'center 40%',
              }}
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/25 to-navy-900/10" />

            {/* Top Floating Glass Badge */}
            <div className="relative z-10 self-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-white/40 shadow-sm text-navy-900 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sistem Aktif &amp; Terintegrasi</span>
              </div>
            </div>

            {/* Bottom Caption Card inside Photo */}
            <div className="relative z-10 bg-navy-900/70 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-white shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-200">
                  Pusat Operasional Pengadaan
                </p>
                <span className="text-[10px] bg-white/20 text-white font-medium px-2 py-0.5 rounded-full">
                  SENADA v2.0
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                Tata Kelola Pengadaan Barang &amp; Jasa Pemerintah
              </h3>
              <p className="text-xs text-white/75 mt-1 leading-relaxed">
                Platform digital terintegrasi untuk akuntabilitas, transparansi, dan efisiensi pengadaan publik.
              </p>
            </div>
          </div>

          {/* RIGHT: Editorial Content, Headline, Subtext, CTAs, & Big Stats */}
          <div className="lg:col-span-7 flex flex-col justify-between py-2 lg:py-4">
            
            {/* Top Eyebrow & Main Typography */}
            <div>
              {/* Eyebrow Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-50 border border-navy-200/80 text-navy-800 text-xs font-bold tracking-wider uppercase mb-5">
                <Building2 className="w-3.5 h-3.5 text-navy-500" />
                <span>{primaryRole === 'petugas_laporan' ? 'Petugas Laporan' : primaryRole.toUpperCase()} · SENADA</span>
              </div>

              {/* Bold Editorial Headline (Spaciaz Style) */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-navy-900 leading-[1.08] tracking-tight">
                Standar Baru<br />
                Pengadaan Digital<br />
                <span className="text-navy-500">Transparan &amp; Akuntabel.</span>
              </h1>

              {/* Descriptive Paragraph */}
              <p className="mt-5 text-base sm:text-lg text-gray-600 font-normal leading-relaxed max-w-xl">
                Selamat datang kembali, <strong className="text-navy-900 font-bold">{user?.name || 'Pengguna'}</strong>. {roleDescription}
              </p>

              {/* CTA Action Buttons Row (Spaciaz Pill Button) */}
              <div className="flex flex-wrap items-center gap-3.5 mt-8">
                {accessibleModules[0] && (
                  <Link
                    to={accessibleModules[0].path}
                    className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-navy-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-navy-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
                  >
                    <span>Buka {accessibleModules[0].title}</span>
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                )}

                {accessibleModules[1] && (
                  <Link
                    to={accessibleModules[1].path}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-gray-200/90 bg-white text-navy-900 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-all shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>{accessibleModules[1].title}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Bottom Highlight Stat Metrics (Matching Spaciaz "40 years of experiences") */}
            {cards.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-200/90 grid grid-cols-2 sm:grid-cols-3 gap-6">
                {cards.slice(0, 3).map((card, idx) => (
                  <div key={card.label} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-navy-900 tracking-tight">
                        {card.value}
                      </span>
                      {card.alert && (
                        <span className="inline-flex w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                      )}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1 leading-snug">
                      {card.label}
                    </p>
                    <p className={`text-[11px] font-medium mt-0.5 ${card.alert ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                      {card.sub}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2: MODUL KERJA TERPADU (Matching Spaciaz Lower Section)
            ════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-navy-500">
                Alur &amp; Layanan Sistem
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight mt-1">
                Modul Kerja yang Ditugaskan
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md">
              Akses cepat seluruh tahapan pengadaan barang &amp; jasa berdasarkan wewenang akun Anda.
            </p>
          </div>

          <div
            className={`grid gap-4 ${
              accessibleModules.length <= 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : accessibleModules.length === 4
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {accessibleModules.map((mod, index) => (
              <Link
                key={mod.path}
                to={mod.path}
                className="group p-6 rounded-2xl bg-white border border-gray-200/85 shadow-[0_1px_3px_rgba(11,30,61,0.03),0_6px_16px_rgba(11,30,61,0.02)] hover:border-navy-500/30 hover:shadow-[0_6px_20px_rgba(11,30,61,0.07),0_16px_32px_rgba(11,30,61,0.03)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-navy-50 group-hover:bg-navy-900 text-navy-500 group-hover:text-white flex items-center justify-center transition-colors duration-200 [&>svg]:w-5 [&>svg]:h-5">
                      {mod.icon}
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-navy-500 transition-colors">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-navy-900 group-hover:text-navy-700 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-navy-500 group-hover:text-navy-900 transition-colors">
                  <span>Buka Modul</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3: RINGKASAN STATUS & MONITORING AKTIVITAS
            ════════════════════════════════════════════════════════════════ */}
        {cards.length > 0 && (
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-navy-500">
                  Monitoring &amp; Audit
                </span>
                <h2 className="text-2xl font-black text-navy-900 tracking-tight mt-1">
                  Ringkasan Aktivitas Terkini
                </h2>
              </div>
            </div>

            <div
              className={`grid gap-4 ${
                cards.length <= 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : cards.length === 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              }`}
            >
              {cards.map((card) => {
                const colors = accentColors[card.accent] || accentColors.gray
                return (
                  <div
                    key={card.label}
                    className={`relative p-6 rounded-2xl border transition-all duration-200 ${
                      card.alert
                        ? 'border-amber-200 bg-amber-50/50 shadow-xs'
                        : 'border-gray-200/85 bg-white shadow-[0_1px_3px_rgba(11,30,61,0.03),0_6px_16px_rgba(11,30,61,0.02)]'
                    }`}
                  >
                    {/* Alert pulse dot */}
                    {card.alert && (
                      <span className="absolute top-5 right-5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                      </span>
                    )}

                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {card.label}
                    </p>
                    <p className={`text-3xl sm:text-4xl font-black leading-none ${card.alert ? 'text-amber-700' : 'text-navy-900'}`}>
                      {card.value}
                    </p>
                    <p className={`text-xs mt-3 font-medium ${card.alert ? 'text-amber-700 font-semibold' : 'text-gray-400'}`}>
                      {card.sub}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Admin: breakdown user per role */}
            {primaryRole === 'admin' && adminStats?.users_by_role && adminStats.users_by_role.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
                    Distribusi Pengguna per Peran Sistem
                  </h3>
                  <Link to="/admin/users" className="text-xs font-semibold text-navy-500 hover:text-navy-700 flex items-center gap-1">
                    <span>Kelola Pengguna</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {adminStats.users_by_role.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white rounded-2xl border border-gray-200/85 shadow-2xs text-center"
                    >
                      <p className="text-2xl font-black text-navy-900">{item.total}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mt-1 truncate">{item.name}</p>
                      <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">{item.active} aktif</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin: alert vendor pending */}
            {primaryRole === 'admin' && adminStats?.vendors?.pending > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-amber-50/80 border border-amber-200 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      {adminStats.vendors.pending} Rekanan Menunggu Verifikasi Dokumen
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Periksa kelengkapan legalitas perusahaan rekanan (NPWP, NIB, dan rekening bank) sebelum disetujui.
                    </p>
                  </div>
                </div>
                <Link to="/admin/vendors">
                  <Button variant="secondary" size="sm" pill className="border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0">
                    Verifikasi Sekarang
                  </Button>
                </Link>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  )
}

export default DashboardPage

