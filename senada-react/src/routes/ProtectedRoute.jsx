import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import authService from '../services/authService'
import { Loader2 } from 'lucide-react'

/**
 * ProtectedRoute — Route guard sesuai AGENTS.md §5 & §6
 * 1. Memeriksa keberadaan access token & session user
 * 2. Mencoba silent refresh token jika halaman di-reload (F5)
 * 3. Memvalidasi role / permission jika disyaratkan
 */
export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  requiredPermission,
  requiredAnyPermission,
}) {
  const location = useLocation()
  const {
    user,
    accessToken,
    setAuth,
    clearAuth,
    hasRole,
    hasPermission,
    hasAnyPermission,
  } = useAuthStore()

  const [isChecking, setIsChecking] = useState(!accessToken && !!user)

  useEffect(() => {
    let isMounted = true

    async function attemptSilentRefresh() {
      // Jika ada session user lama tetapi token di memori kosong (karena reload browser)
      if (!accessToken && user) {
        try {
          const refreshRes = await authService.refreshToken()
          const newAccessToken = refreshRes.data?.accessToken

          if (newAccessToken && isMounted) {
            // Sinkronkan data permission terbaru dari server
            useAuthStore.getState().setAccessToken(newAccessToken)
            const meRes = await authService.getMe()
            if (meRes.data?.user && isMounted) {
              setAuth(meRes.data.user, newAccessToken)
            }
          }
        } catch {
          if (isMounted) {
            clearAuth()
          }
        } finally {
          if (isMounted) {
            setIsChecking(false)
          }
        }
      } else {
        setIsChecking(false)
      }
    }

    attemptSilentRefresh()

    return () => {
      isMounted = false
    }
  }, [accessToken, user, setAuth, clearAuth])

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-navy-900">
        <Loader2 className="w-8 h-8 animate-spin text-navy-700 mb-3" />
        <p className="text-sm font-medium text-gray-500">Memverifikasi sesi SENADA...</p>
      </div>
    )
  }

  // Jika belum login, alihkan ke /login dengan state URL asal
  if (!user || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Cek Otorisasi Peran Tunggal (Role)
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Cek Otorisasi Daftar Peran (Allowed Roles)
  if (allowedRoles && allowedRoles.length > 0) {
    const isUserAllowed =
      user.roles?.includes('admin') ||
      allowedRoles.some((role) => user.roles?.includes(role))

    if (!isUserAllowed) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  // Cek Otorisasi Izin (Granular Permission)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Cek Otorisasi Salah Satu Izin
  if (
    requiredAnyPermission &&
    requiredAnyPermission.length > 0 &&
    !hasAnyPermission(requiredAnyPermission)
  ) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

/**
 * PublicOnlyRoute — Memastikan rute seperti /login tidak dapat diakses
 * oleh pengguna yang sudah memiliki sesi aktif (dialihkan ke /dashboard)
 */
export function PublicOnlyRoute({ children }) {
  const { user, accessToken } = useAuthStore()

  if (user && accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
