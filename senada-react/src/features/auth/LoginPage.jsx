import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import authService from '../../services/authService'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Card, CardBody } from '../../components/Card'
import { Badge } from '../../components/Badge'
import {
  Building2,
  Lock,
  Mail,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from 'lucide-react'

// Skema validasi Zod untuk Login (konsisten dengan backend di AGENTS.md §2 & §6)
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi.')
    .email('Format alamat email tidak valid.'),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi.')
    .min(6, 'Kata sandi minimal 6 karakter.'),
})

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()

  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Akun cepat untuk pengujian seluruh peran di SENADA
  const quickTestAccounts = [
    { role: 'Admin', email: 'admin@senada.go.id', pass: 'Admin#SENADA2026' },
    { role: 'PPK', email: 'ppk@senada.go.id', pass: 'Ppk12345!' },
    { role: 'PBJ', email: 'pbj@senada.go.id', pass: 'Pbj12345!' },
    { role: 'Penyedia (Vendor)', email: 'vendor1@test.com', pass: 'Vendor123!' },
    { role: 'PPSPM (SAKTI)', email: 'ppspm@senada.go.id', pass: 'Ppspm123!' },
    { role: 'Petugas Laporan', email: 'petugas@senada.go.id', pass: 'Petugas123!' },
  ]

  const setDemoAccount = (email, pass) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', pass, { shouldValidate: true })
    setServerError('')
  }

  const onSubmit = async (formData) => {
    setIsLoading(true)
    setServerError('')

    try {
      const response = await authService.login(formData)

      if (response.success && response.data) {
        const { user, accessToken } = response.data
        setAuth(user, accessToken)

        // Alihkan ke URL tujuan awal jika ada, atau ke dashboard
        const destination = location.state?.from?.pathname || '/dashboard'
        navigate(destination, { replace: true })
      } else {
        setServerError(response.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.')
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Terjadi kesalahan saat menghubungi server pengadaan.'
      setServerError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-navy-900 border border-navy-700 flex items-center justify-center shadow-md mb-3">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 tracking-tight">
            Masuk ke SENADA
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Sistem Pengadaan Barang dan Jasa Instansi Pemerintah
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-card border-gray-200">
          <CardBody className="p-8">
            {/* Alert Pesan Error dari Server */}
            {serverError && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{serverError}</div>
              </div>
            )}

            {/* Form Login */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <Input
                label="Alamat Email"
                type="email"
                placeholder="nama@instansi.go.id"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Kata Sandi"
                type="password"
                placeholder="••••••••"
                required
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-500">Aplikasi Terautentikasi Penuh (Zero-Trust)</span>
                <span className="text-navy-500 font-medium">Bantuan</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full mt-2"
              >
                Masuk ke Sistem
              </Button>
            </form>

            {/* Section Akun Cepat Pengujian Role */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-navy-500" />
                  Pilih Akun Demo (Uji Coba RBAC)
                </span>
                <Badge variant="navy" size="sm">
                  Dev Mode
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {quickTestAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => setDemoAccount(acc.email, acc.pass)}
                    className="p-2 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-navy-900 hover:text-white hover:border-navy-900 text-left transition-colors duration-150 group"
                  >
                    <p className="text-[11px] font-semibold text-navy-900 group-hover:text-white">
                      {acc.role}
                    </p>
                    <p className="text-[10px] text-gray-500 group-hover:text-gray-300 truncate">
                      {acc.email}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Keamanan Sesi JWT & Refresh Token Terenkripsi (AGENTS.md §6)</span>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
