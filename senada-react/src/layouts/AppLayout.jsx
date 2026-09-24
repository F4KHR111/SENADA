import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import authService from '../services/authService'
import { Badge } from '../components/Badge'
import ErrorBoundary from '../components/ErrorBoundary'
import {
  FileSpreadsheet,
  Mail,
  Send,
  Scale,
  FileSignature,
  CheckSquare,
  BarChart3,
  LayoutDashboard,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  History,
  Truck,
  FileCheck,
  ClipboardList,
  ChevronDown,
} from 'lucide-react'

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  // Deteksi scroll untuk efek glassmorphism adaptif
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = () => setIsUserDropdownOpen(false)
    if (isUserDropdownOpen) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isUserDropdownOpen])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authService.logout()
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  const primaryRole = user?.roles?.[0] || 'penyedia'

  const roleMenus = {
    admin: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'User Management', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
      { label: 'Verifikasi Vendor', path: '/admin/vendors', icon: <CheckCircle2 className="w-4 h-4" /> },
      { label: 'Audit Log', path: '/admin/audit-logs', icon: <History className="w-4 h-4" /> },
    ],
    ppk: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'HPS', path: '/hps', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { label: 'SPK', path: '/spk', icon: <FileSignature className="w-4 h-4" /> },
      { label: 'Serah Terima', path: '/serah-terima', icon: <CheckSquare className="w-4 h-4" /> },
    ],
    pbj: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Verifikasi HPS', path: '/hps', icon: <FileSpreadsheet className="w-4 h-4" /> },
      { label: 'Undangan', path: '/undangan', icon: <Mail className="w-4 h-4" /> },
      { label: 'Penawaran', path: '/penawaran', icon: <Send className="w-4 h-4" /> },
      { label: 'Negosiasi', path: '/negosiasi', icon: <Scale className="w-4 h-4" /> },
    ],
    penyedia: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Profil Perusahaan', path: '/vendor/profil', icon: <Building2 className="w-4 h-4" /> },
      { label: 'Undangan Masuk', path: '/undangan', icon: <Mail className="w-4 h-4" /> },
      { label: 'Penawaran Saya', path: '/penawaran', icon: <Send className="w-4 h-4" /> },
      { label: 'Negosiasi', path: '/negosiasi', icon: <Scale className="w-4 h-4" /> },
      { label: 'SPK Saya', path: '/spk', icon: <FileSignature className="w-4 h-4" /> },
      { label: 'Pengiriman', path: '/serah-terima', icon: <Truck className="w-4 h-4" /> },
    ],
    ppspm: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Resume SPK', path: '/laporan?tab=rekap', basePath: '/laporan', icon: <ClipboardList className="w-4 h-4" /> },
      { label: 'SPM Reference', path: '/laporan?tab=spm', basePath: '/laporan', icon: <FileCheck className="w-4 h-4" /> },
    ],
    petugas_laporan: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Resume SPK', path: '/laporan?tab=rekap', basePath: '/laporan', icon: <ClipboardList className="w-4 h-4" /> },
      { label: 'Laporan Realisasi', path: '/laporan?tab=realisasi', basePath: '/laporan', icon: <BarChart3 className="w-4 h-4" /> },
    ],
  }

  const visibleNavItems = roleMenus[primaryRole] || roleMenus.penyedia

  const roleLabels = {
    admin: 'Administrator',
    ppk: 'PPK',
    pbj: 'PBJ',
    penyedia: 'Penyedia',
    ppspm: 'PPSPM',
    petugas_laporan: 'Petugas Laporan',
  }

  const displayRoleLabel = roleLabels[primaryRole] || primaryRole.toUpperCase()

  const isActive = (item) => {
    const currentFull = location.pathname + location.search
    return (
      currentFull === item.path ||
      location.pathname === item.path ||
      (item.basePath &&
        location.pathname === item.basePath &&
        location.search.includes(item.path.split('?')[1] || '')) ||
      (!item.path.includes('?') &&
        item.path !== '/dashboard' &&
        location.pathname.startsWith(item.path))
    )
  }

  // Apakah halaman ini adalah dashboard? Jika ya, navbar akan overlay di atas hero
  const isDashboard = location.pathname === '/dashboard'

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-navy-900 font-sans">
      {/* ── Glassmorphism Navbar (Light Luxury inspired by Spaciaz) ─── */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-200 ease-in-out
          bg-white/90 backdrop-blur-xl border-b border-gray-200/80
          ${isScrolled ? 'shadow-[0_4px_20px_rgba(11,30,61,0.05)]' : 'shadow-none'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">

            {/* Brand Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-navy-900 flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105">
                <Building2 className="w-5 h-5 text-blue-300" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-black text-navy-900 tracking-tight leading-none">SENADA</span>
                <p className="text-[10px] text-gray-500 font-semibold tracking-wide uppercase leading-none mt-1">Pengadaan Barang &amp; Jasa</p>
              </div>
            </Link>

            {/* Desktop Nav Links — Pill Shape (Spaciaz Style) */}
            <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-gray-100/70 border border-gray-200/60 rounded-full">
              {visibleNavItems.map((item) => {
                const active = isActive(item)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold
                      transition-all duration-150 select-none
                      ${active
                        ? 'bg-navy-900 text-white shadow-xs'
                        : 'text-gray-600 hover:text-navy-900 hover:bg-white/80'
                      }
                    `}
                  >
                    <span className={active ? 'text-blue-300' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right: Security pill + Role badge + User profile */}
            <div className="flex items-center gap-2.5">
              {/* Encrypted indicator */}
              <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terenkripsi</span>
              </div>

              {/* Role badge */}
              <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-navy-50 text-navy-800 border border-navy-200/70">
                {displayRoleLabel}
              </span>

              {/* User Avatar Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsUserDropdownOpen((prev) => !prev)
                  }}
                  className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-full border border-gray-200 hover:border-navy-300 bg-white hover:bg-gray-50 transition-all duration-150 shadow-2xs group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <span className="hidden md:block text-xs font-semibold text-navy-900 max-w-[120px] truncate">
                    {user?.name || 'Pengguna'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Card */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200/90 rounded-2xl shadow-[0_12px_32px_rgba(11,30,61,0.12)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3.5 bg-gray-50/80 border-b border-gray-100">
                      <p className="text-xs font-bold text-navy-900 truncate">{user?.name || 'Pengguna SENADA'}</p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{user?.email}</p>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-navy-100 text-navy-800">
                          Peran: {displayRoleLabel}
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>{isLoggingOut ? 'Keluar...' : 'Keluar Aplikasi'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-navy-900 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 px-4 py-3 space-y-1 shadow-lg">
            {visibleNavItems.map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-navy-900 text-white'
                      : 'text-gray-700 hover:text-navy-900 hover:bg-gray-100'
                  }`}
                >
                  <span className={active ? 'text-blue-300' : 'text-gray-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="pt-2 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Aplikasi</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content Container ──────────────────────────────────── */}
      <main className={`flex-1 ${isDashboard ? 'pt-18' : 'pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'}`}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default AppLayout
