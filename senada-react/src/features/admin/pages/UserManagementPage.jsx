import React, { useState } from 'react'
import {
  useAdminUsers,
  useAdminRoles,
  useCreateUser,
  useUpdateUser,
  useToggleUserStatus,
} from '../hooks/useAdmin'
import { Card, CardHeader, CardBody } from '../../../components/Card'
import { Button } from '../../../components/Button'
import { Badge } from '../../../components/Badge'
import { Input } from '../../../components/Input'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmpty,
  TablePagination,
} from '../../../components/Table'
import { formatDate, formatDateTime } from '../../../utils/formatters'
import {
  Users,
  UserPlus,
  Search,
  RotateCcw,
  Edit2,
  Power,
  Shield,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react'

export function UserManagementPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employee_id: '',
    phone: '',
    status: 'active',
    role_ids: [],
  })
  const [formError, setFormError] = useState('')

  // Queries
  const { data: userData, isLoading, isError, error, refetch } = useAdminUsers({
    page,
    limit,
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
  })

  const { data: rolesData } = useAdminRoles()
  const availableRoles = rolesData?.data || []

  const users = userData?.data || []
  const pagination = userData?.pagination || {
    totalData: 0,
    totalPages: 1,
    currentPage: 1,
  }

  // Mutations
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const toggleMutation = useToggleUserStatus()

  const handleOpenCreate = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      employee_id: '',
      phone: '',
      status: 'active',
      role_ids: [],
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      employee_id: user.employee_id || '',
      phone: user.phone || '',
      status: user.status || 'active',
      role_ids: user.roles ? user.roles.map((r) => r.id) : [],
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const handleToggleRole = (roleId) => {
    setFormData((prev) => {
      const exists = prev.role_ids.includes(roleId)
      return {
        ...prev,
        role_ids: exists
          ? prev.role_ids.filter((id) => id !== roleId)
          : [...prev.role_ids, roleId],
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Nama lengkap dan email wajib diisi.')
      return
    }

    if (!editingUser && !formData.password.trim()) {
      setFormError('Kata sandi wajib diisi untuk pengguna baru.')
      return
    }

    if (formData.role_ids.length === 0) {
      setFormError('Pilih minimal satu peran (role) untuk pengguna ini.')
      return
    }

    try {
      if (editingUser) {
        const payload = {
          name: formData.name,
          email: formData.email,
          employee_id: formData.employee_id,
          phone: formData.phone,
          status: formData.status,
          role_ids: formData.role_ids,
        }
        if (formData.password.trim()) {
          payload.password = formData.password.trim()
        }
        await updateMutation.mutateAsync({ id: editingUser.id, payload })
      } else {
        await createMutation.mutateAsync(formData)
      }
      setIsModalOpen(false)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data pengguna.')
    }
  }

  const handleToggleStatus = async (user) => {
    const actionLabel = user.status === 'active' ? 'menonaktifkan' : 'mengaktifkan'
    if (window.confirm(`Yakin ingin ${actionLabel} akun ${user.name}?`)) {
      try {
        await toggleMutation.mutateAsync(user.id)
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal mengubah status akun.')
      }
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-navy-900 text-white rounded-lg inline-flex">
              <Users className="w-5 h-5 text-blue-300" />
            </span>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              User Management
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Kelola akun seluruh pengguna internal dan vendor rekanan, penugasan peran (RBAC), serta status akses akun (AGENTS.md §5).
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Tambah Pengguna Baru
        </Button>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <Card>
        <CardBody className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Cari nama, email, NIP..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                className="w-full"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPage(1)
              }}
              className="w-full sm:w-48 text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500"
            >
              <option value="">Semua Peran (Role)</option>
              {availableRoles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full sm:w-40 text-xs bg-white text-navy-900 rounded-lg border border-gray-200 py-2.5 px-3 focus:outline-none focus:border-navy-500"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Total: <strong>{pagination.totalData || 0}</strong> pengguna
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setRoleFilter('')
                setStatusFilter('')
                setPage(1)
                refetch()
              }}
              className="text-gray-500"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* ── Table Data ─────────────────────────────────────────────── */}
      <Card>
        <CardBody noPadding>
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-navy-700 mb-2" />
              <p className="text-xs font-medium text-gray-500">Memuat data pengguna sistem...</p>
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-danger text-xs">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              {error?.response?.data?.message || 'Gagal memuat data pengguna.'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Nama & Identitas</TableHead>
                  <TableHead>Kontak & Email</TableHead>
                  <TableHead className="w-48">Peran / Role</TableHead>
                  <TableHead align="center" className="w-32">Status Akun</TableHead>
                  <TableHead className="w-40">Terdaftar</TableHead>
                  <TableHead align="center" className="w-28">Aksi</TableHead>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableEmpty message="Tidak ada pengguna yang cocok dengan kriteria filter." colSpan={7} />
                  ) : (
                    users.map((item, idx) => (
                      <TableRow key={item.id} isZebra={idx % 2 === 1}>
                        <TableCell align="center" className="text-gray-400 font-mono text-xs">
                          {(page - 1) * limit + idx + 1}
                        </TableCell>

                        <TableCell>
                          <p className="font-semibold text-navy-900 line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            {item.employee_id ? `NIP: ${item.employee_id}` : 'Pegawai Eksternal/Vendor'}
                          </p>
                        </TableCell>

                        <TableCell>
                          <p className="font-mono text-xs text-navy-900">{item.email}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {item.phone || '-'}
                          </p>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.roles && item.roles.length > 0 ? (
                              item.roles.map((r) => (
                                <span
                                  key={r.id}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-navy-50 text-navy-700 border border-navy-200/60"
                                >
                                  {r.label}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">Tanpa Peran</span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell align="center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              item.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-danger border border-red-200'
                            }`}
                          >
                            {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </TableCell>

                        <TableCell className="text-xs text-gray-500">
                          {formatDate(item.created_at)}
                        </TableCell>

                        <TableCell align="center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-md transition-colors"
                              title="Edit Pengguna & Peran"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              disabled={toggleMutation.isPending}
                              className={`p-1.5 rounded-md transition-colors ${
                                item.status === 'active'
                                  ? 'text-gray-400 hover:text-danger hover:bg-red-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={item.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {users.length > 0 && (
                <TablePagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalData={pagination.totalData}
                  limit={pagination.limit}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* ── Modal Form Create / Edit User ───────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-navy-900 text-white">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-base">
                  {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Ahmad Fauzi, S.T."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-navy-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Alamat Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@instansi.go.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-navy-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    NIP / ID Pegawai
                  </label>
                  <input
                    type="text"
                    placeholder="19850101..."
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-navy-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-navy-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Status Akun
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-navy-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  {editingUser ? 'Ganti Kata Sandi (Kosongkan jika tidak diubah)' : 'Kata Sandi *'}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? '••••••••' : 'Minimal 8 karakter'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-navy-500 font-mono"
                />
              </div>

              {/* Assign Role Section */}
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-2">
                  Penugasan Peran / Roles (RBAC) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  {availableRoles.map((role) => {
                    const isSelected = formData.role_ids.includes(role.id)
                    return (
                      <button
                        type="button"
                        key={role.id}
                        onClick={() => handleToggleRole(role.id)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all border text-xs ${
                          isSelected
                            ? 'bg-navy-900 text-white border-navy-900 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-navy-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                            isSelected ? 'bg-white text-navy-900 border-white' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-navy-900 fill-current" />}
                        </div>
                        <div>
                          <p className="font-semibold leading-tight">{role.label}</p>
                          <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                            {role.name}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                >
                  {editingUser ? 'Simpan Perubahan' : 'Buat Pengguna'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagementPage
