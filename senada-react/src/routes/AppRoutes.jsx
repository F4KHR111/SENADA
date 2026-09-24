import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute'
import AppLayout from '../layouts/AppLayout'

// Pages
import LoginPage from '../features/auth/LoginPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import DesignSystemShowcase from '../components/DesignSystemShowcase'
import UnauthorizedPage from '../features/common/UnauthorizedPage'

// Modul 1: HPS Pages
import HpsListPage from '../features/hps/pages/HpsListPage'
import HpsCreatePage from '../features/hps/pages/HpsCreatePage'
import HpsDetailPage from '../features/hps/pages/HpsDetailPage'

// Modul 2: Undangan Pages
import UndanganListPage from '../features/undangan/pages/UndanganListPage'
import UndanganCreatePage from '../features/undangan/pages/UndanganCreatePage'
import UndanganDetailPage from '../features/undangan/pages/UndanganDetailPage'

// Modul 3: Penawaran Pages
import PenawaranListPage from '../features/penawaran/pages/PenawaranListPage'
import PenawaranCreatePage from '../features/penawaran/pages/PenawaranCreatePage'
import PenawaranDetailPage from '../features/penawaran/pages/PenawaranDetailPage'

// Modul 4: Negosiasi Pages
import NegosiasiListPage from '../features/negosiasi/pages/NegosiasiListPage'

// Modul 5: SPK Pages
import SpkListPage from '../features/spk/pages/SpkListPage'
import SpkCreatePage from '../features/spk/pages/SpkCreatePage'
import SpkDetailPage from '../features/spk/pages/SpkDetailPage'

// Modul 6: Serah Terima Pages
import SerahTerimaListPage from '../features/serah-terima/pages/SerahTerimaListPage'
import SerahTerimaDetailPage from '../features/serah-terima/pages/SerahTerimaDetailPage'

// Modul 7: Pelaporan Keuangan & SPM SAKTI Pages
import LaporanDashboardPage from '../features/laporan/pages/LaporanDashboardPage'

// Modul Khusus Role Admin
import UserManagementPage from '../features/admin/pages/UserManagementPage'
import VendorVerificationPage from '../features/admin/pages/VendorVerificationPage'
import AuditLogPage from '../features/admin/pages/AuditLogPage'

// Modul Khusus Rekanan (Penyedia)
import VendorProfilePage from '../features/penyedia/pages/VendorProfilePage'

// Modul Tambahan Khusus Role Vendor
import ModulePlaceholderPage from '../features/common/ModulePlaceholderPage'
import { Building2 } from 'lucide-react'

/**
 * AppRoutes — Pengaturan routing aplikasi SENADA dengan route guard terpadu (AGENTS.md §5 & §6).
 * Matriks Akses Per Role:
 * - Admin: Dashboard, User Management, Verifikasi Vendor, Audit Log
 * - PPK: Dashboard, HPS, SPK, Serah Terima
 * - PBJ: Dashboard, Verifikasi HPS, Undangan, Perbandingan Penawaran, Negosiasi
 * - Penyedia: Dashboard, Profil Perusahaan, Undangan Masuk, Penawaran Saya, Negosiasi, SPK Saya, Pengiriman
 * - PPSPM: Dashboard, Resume SPK, SPM Reference
 * - Petugas Laporan Realisasi: Dashboard, Resume SPK, Laporan Realisasi
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* ── Public Route (Hanya bisa diakses jika belum login) ───────── */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      {/* ── Protected Routes (Wajib Login & dibungkus AppLayout) ──────── */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ── Menu Khusus Admin ────────────────────────────────────── */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <VendorVerificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />

        {/* ── Menu Khusus Rekanan (Penyedia) ────────────────────────── */}
        <Route
          path="/vendor/profil"
          element={
            <ProtectedRoute allowedRoles={['penyedia']}>
              <VendorProfilePage />
            </ProtectedRoute>
          }
        />

        {/* ── Modul 1: HPS (PPK & PBJ) ─────────────────────────────── */}
        <Route
          path="/hps"
          element={
            <ProtectedRoute allowedRoles={['ppk', 'pbj']}>
              <HpsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hps/create"
          element={
            <ProtectedRoute allowedRoles={['ppk']}>
              <HpsCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hps/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['ppk']}>
              <HpsCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hps/:id"
          element={
            <ProtectedRoute allowedRoles={['ppk', 'pbj']}>
              <HpsDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ── Modul 2: Undangan Pengadaan (PBJ & Penyedia) ──────────── */}
        <Route
          path="/undangan"
          element={
            <ProtectedRoute allowedRoles={['pbj', 'penyedia']}>
              <UndanganListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/undangan/create"
          element={
            <ProtectedRoute allowedRoles={['pbj']}>
              <UndanganCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/undangan/:id"
          element={
            <ProtectedRoute allowedRoles={['pbj', 'penyedia']}>
              <UndanganDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ── Modul 3: Penawaran Harga (PBJ & Penyedia) ─────────────── */}
        <Route
          path="/penawaran"
          element={
            <ProtectedRoute allowedRoles={['pbj', 'penyedia']}>
              <PenawaranListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/penawaran/create"
          element={
            <ProtectedRoute allowedRoles={['penyedia']}>
              <PenawaranCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/penawaran/:id"
          element={
            <ProtectedRoute allowedRoles={['pbj', 'penyedia']}>
              <PenawaranDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ── Modul 4: Negosiasi Harga (PBJ & Penyedia) ─────────────── */}
        <Route
          path="/negosiasi"
          element={
            <ProtectedRoute allowedRoles={['pbj', 'penyedia']}>
              <NegosiasiListPage />
            </ProtectedRoute>
          }
        />

        {/* ── Modul 5: Surat Pesanan / SPK (PPK & Penyedia) ─────────── */}
        <Route
          path="/spk"
          element={
            <ProtectedRoute allowedRoles={['ppk', 'penyedia']}>
              <SpkListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spk/create"
          element={
            <ProtectedRoute allowedRoles={['ppk']}>
              <SpkCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spk/:id"
          element={
            <ProtectedRoute allowedRoles={['ppk', 'penyedia']}>
              <SpkDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ── Modul 6: Serah Terima & Berita Acara (PPK & Penyedia) ──── */}
        <Route
          path="/serah-terima"
          element={
            <ProtectedRoute allowedRoles={['ppk', 'penyedia']}>
              <SerahTerimaListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/serah-terima/:spkId"
          element={
            <ProtectedRoute allowedRoles={['ppk', 'penyedia']}>
              <SerahTerimaDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ── Modul 7: Pelaporan Keuangan (PPSPM & Petugas Laporan) ──── */}
        <Route
          path="/laporan"
          element={
            <ProtectedRoute allowedRoles={['ppspm', 'petugas_laporan']}>
              <LaporanDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback rute yang tidak dikenal dialihkan ke /dashboard atau /login */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
