import axios from 'axios'
import useAuthStore from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * apiClient — Axios instance terkonfigurasi untuk berkomunikasi dengan senada-node.
 * - withCredentials: true untuk otomatis menyertakan httpOnly cookie refresh_token
 * - Request interceptor: menyisipkan Authorization Bearer header
 * - Response interceptor: penanganan otomatis token expired (401) dengan queue refresh
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Sisipkan Access Token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Variabel untuk antrean request saat refresh token sedang berlangsung
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response Interceptor: Tangani 401 dan lakukan silent refresh otomatis
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Jika bukan error 401 atau request sudah pernah di-retry, langsung tolak
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Jangan lakukan refresh otomatis untuk endpoint login, refresh-token, atau register
    const url = originalRequest.url || ''
    if (
      url.includes('/auth/login') ||
      url.includes('/auth/refresh-token') ||
      url.includes('/auth/register')
    ) {
      return Promise.reject(error)
    }

    // Jika proses refresh token sedang berjalan, antrekan request ini
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Panggil endpoint refresh-token (cookie refreshToken otomatis terkirim via withCredentials)
      const refreshResponse = await axios.post(
        `${BASE_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      )

      const newAccessToken = refreshResponse.data?.data?.accessToken

      if (!newAccessToken) {
        throw new Error('Gagal mendapatkan access token baru dari server.')
      }

      // Update access token di Zustand store
      useAuthStore.getState().setAccessToken(newAccessToken)

      // Jalankan seluruh request yang sedang mengantre
      processQueue(null, newAccessToken)

      // Ulangi request asli dengan token baru
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      // Refresh token gagal atau telah kadaluarsa (7 hari): bersihkan session & redirect login
      processQueue(refreshError, null)
      useAuthStore.getState().clearAuth()

      // Redirect hanya jika kita sedang di browser
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient
