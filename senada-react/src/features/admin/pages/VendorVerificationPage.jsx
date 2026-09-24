import React, { useState } from 'react'
import { useAdminVendors, useVerifyVendor } from '../hooks/useAdmin'
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
  CheckCircle2,
  XCircle,
  Building2,
  Search,
  RotateCcw,
  Eye,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react'

export function VendorVerificationPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending') // default pending seperti instruksi

  // Modal Detail & Verifikasi
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const { data, isLoading, isError, error, refetch } = useAdminVendors({
    page,
    limit,
    search: search || undefined,
    verification_status: statusFilter || undefined,
  })

  const vendors = data?.data || []
  const pagination = data?.pagination || {
    totalData: 0,
    totalPages: 1,
    currentPage: 1,
  }

  const verifyMutation = useVerifyVendor()

  const handleOpenDetail = (vendor) => {
    setSelectedVendor(vendor)
    setIsDetailModalOpen(true)
  }

  const handleVerify = async (vendorId, action) => {
    const actionText = action === 'verified' ? 'menyetujui' : 'menolak'
    if (window.confirm(`Yakin ingin ${actionText} verifikasi perusahaan ini?`)) {
      try {
        await verifyMutation.mutateAsync({ id: vendorId, action })
        if (selectedVendor && selectedVendor.id === vendorId) {
          setIsDetailModalOpen(false)
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal memproses verifikasi vendor.')
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-navy-900 text-white rounded-lg inline-flex">
              <CheckCircle2 className="w-5 h-5 text-blue-300" />
            </span>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">
              Verifikasi Rekanan & Vendor
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Validasi legalitas berkas, NPWP, domisili, dan rekening bank penyedia sebelum dapat diundang ke pengadaan (AGENTS.md §5 & §10.2).
          </p>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <Card>
        <CardBody className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Cari nama PT/CV, NPWP, kota..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('pending')
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Menunggu Verifikasi
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('verified')
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'verified'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Terverifikasi
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('rejected')
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'rejected'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Ditolak
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('')
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === ''
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Semua
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Total: <strong>{pagination.totalData || 0}</strong> rekanan
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setStatusFilter('pending')
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
              <p className="text-xs font-medium text-gray-500">Memuat berkas legalitas rekanan...</p>
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-danger text-xs">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              {error?.response?.data?.message || 'Gagal memuat data vendor.'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Nama Perusahaan (Badan Usaha)</TableHead>
                  <TableHead className="w-44">NPWP Resmi</TableHead>
                  <TableHead className="w-40">Kota / Domisili</TableHead>
                  <TableHead>Kontak PIC Rekanan</TableHead>
                  <TableHead align="center" className="w-36">Status Verifikasi</TableHead>
                  <TableHead align="center" className="w-36">Aksi Keputusan</TableHead>
                </TableHeader>
                <TableBody>
                  {vendors.length === 0 ? (
                    <TableEmpty
                      message={
                        statusFilter === 'pending'
                          ? 'Tidak ada berkas vendor yang sedang menunggu verifikasi saat ini.'
                          : 'Belum ada data vendor yang cocok dengan filter.'
                      }
                      colSpan={7}
                    />
                  ) : (
                    vendors.map((item, idx) => (
                      <TableRow key={item.id} isZebra={idx % 2 === 1}>
                        <TableCell align="center" className="text-gray-400 font-mono text-xs">
                          {(page - 1) * limit + idx + 1}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-navy-50 rounded text-navy-700">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-navy-900">{item.company_name}</p>
                              <p className="text-[11px] text-gray-400 font-mono">
                                Akun: {item.user?.email || '-'}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="font-mono text-xs text-navy-900 font-medium">
                          {item.npwp}
                        </TableCell>

                        <TableCell className="text-xs text-gray-700">
                          {item.city || '-'}
                        </TableCell>

                        <TableCell>
                          <p className="text-xs text-navy-900 font-medium">{item.user?.name || '-'}</p>
                          <p className="text-[11px] text-gray-500 font-mono">{item.phone || item.user?.phone || '-'}</p>
                        </TableCell>

                        <TableCell align="center">
                          {item.verification_status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Menunggu
                            </span>
                          ) : item.verification_status === 'verified' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
                              <XCircle className="w-3 h-3 text-red-600" />
                              Ditolak
                            </span>
                          )}
                        </TableCell>

                        <TableCell align="center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(item)}
                              className="p-1.5 text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-md transition-colors"
                              title="Lihat Detail Legalitas"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {item.verification_status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleVerify(item.id, 'verified')}
                                  disabled={verifyMutation.isPending}
                                  className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                                  title="Approve / Setujui Vendor"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVerify(item.id, 'rejected')}
                                  disabled={verifyMutation.isPending}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Tolak Verifikasi"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {vendors.length > 0 && (
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

      {/* ── Modal Detail Legalitas Rekanan ───────────────────────────── */}
      {isDetailModalOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-navy-900 text-white">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="font-bold text-base">{selectedVendor.company_name}</h3>
                  <p className="text-[11px] text-gray-300 font-mono">NPWP: {selectedVendor.npwp}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Status Badge Info */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <span className="font-semibold text-gray-600">Status Verifikasi Sistem:</span>
                <span className="font-bold uppercase tracking-wider text-navy-900">
                  {selectedVendor.verification_status}
                </span>
              </div>

              {/* Data Perusahaan */}
              <div>
                <h4 className="font-bold text-navy-900 uppercase tracking-wider mb-3 text-[11px] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-navy-500" />
                  Identitas Legalitas Perusahaan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50/60 rounded-xl border border-gray-200">
                  <div>
                    <span className="text-gray-400 text-[11px]">Nama Perusahaan</span>
                    <p className="font-semibold text-navy-900 text-sm mt-0.5">{selectedVendor.company_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px]">Nomor Pokok Wajib Pajak (NPWP)</span>
                    <p className="font-mono font-bold text-navy-900 text-sm mt-0.5">{selectedVendor.npwp}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px]">Kota / Domisili Kantor</span>
                    <p className="font-medium text-navy-900 mt-0.5">{selectedVendor.city || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px]">Telepon Kantor</span>
                    <p className="font-mono text-navy-900 mt-0.5">{selectedVendor.phone || '-'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 text-[11px]">Alamat Lengkap</span>
                    <p className="text-navy-900 mt-0.5 leading-relaxed">{selectedVendor.address || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Rekening Bank */}
              <div>
                <h4 className="font-bold text-navy-900 uppercase tracking-wider mb-3 text-[11px] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-navy-500" />
                  Informasi Rekening Bank Pencairan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50/60 rounded-xl border border-gray-200">
                  <div>
                    <span className="text-gray-400 text-[11px]">Nama Bank</span>
                    <p className="font-semibold text-navy-900 mt-0.5">{selectedVendor.bank_name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px]">Nomor Rekening</span>
                    <p className="font-mono font-bold text-navy-900 mt-0.5">
                      {selectedVendor.bank_account_number || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px]">Atas Nama Rekening</span>
                    <p className="font-medium text-navy-900 mt-0.5">
                      {selectedVendor.bank_account_holder || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Akun PIC */}
              <div>
                <h4 className="font-bold text-navy-900 uppercase tracking-wider mb-3 text-[11px] flex items-center gap-1.5">
                  <User className="w-4 h-4 text-navy-500" />
                  Akun Person in Charge (PIC)
                </h4>
                <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy-900">{selectedVendor.user?.name || '-'}</p>
                    <p className="text-gray-500 font-mono text-[11px]">{selectedVendor.user?.email || '-'}</p>
                  </div>
                  <span className="text-gray-400 text-[11px]">
                    Terdaftar: {formatDate(selectedVendor.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Tutup
              </Button>

              {selectedVendor.verification_status === 'pending' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<XCircle className="w-4 h-4" />}
                    onClick={() => handleVerify(selectedVendor.id, 'rejected')}
                    isLoading={verifyMutation.isPending}
                  >
                    Tolak Verifikasi
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleVerify(selectedVendor.id, 'verified')}
                    isLoading={verifyMutation.isPending}
                  >
                    Setujui / Verifikasi Vendor
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorVerificationPage
