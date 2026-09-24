import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * authStore — Zustand store untuk mengelola state autentikasi pengguna (AGENTS.md §2 & §5)
 * Perhatian: Backend adalah sumber kebenaran (source of truth) utama untuk RBAC.
 * Store ini digunakan oleh antarmuka untuk UX (navigasi, sembunyikan menu, route guard).
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null, // { id, name, email, employee_id, status, roles: [], permissions: [] }
      accessToken: null,
      isInitializing: true,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isInitializing: false }),

      setAccessToken: (accessToken) =>
        set({ accessToken }),

      setUser: (user) =>
        set({ user }),

      setInitializing: (isInitializing) =>
        set({ isInitializing }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isInitializing: false }),

      isAuthenticated: () => {
        const { user, accessToken } = get()
        return !!user && !!accessToken
      },

      /**
       * Memeriksa apakah user memiliki peran (role) tertentu.
       * Admin otomatis memiliki hak akses penuh.
       */
      hasRole: (role) => {
        const { user } = get()
        if (!user || !user.roles) return false
        if (user.roles.includes('admin')) return true
        return user.roles.includes(role)
      },

      /**
       * Memeriksa apakah user memiliki izin granular tertentu.
       * Admin otomatis memiliki semua izin.
       */
      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        if (user.roles?.includes('admin')) return true
        return user.permissions?.includes(permission) ?? false
      },

      /**
       * Memeriksa apakah user memiliki salah satu dari izin yang ditentukan.
       */
      hasAnyPermission: (permissions = []) => {
        const { user } = get()
        if (!user) return false
        if (user.roles?.includes('admin')) return true
        return permissions.some((p) => user.permissions?.includes(p))
      },

      /**
       * Memeriksa apakah user memiliki semua izin yang ditentukan.
       */
      hasAllPermissions: (permissions = []) => {
        const { user } = get()
        if (!user) return false
        if (user.roles?.includes('admin')) return true
        return permissions.every((p) => user.permissions?.includes(p))
      },
    }),
    {
      name: 'senada-auth-session',
      // Hanya persist objek profil user, access token disimpan di memory (15 menit)
      // agar aman dari XSS persistent storage, dan di-refresh via httpOnly cookie saat reload
      partialize: (state) => ({ user: state.user }),
    }
  )
)

export default useAuthStore
