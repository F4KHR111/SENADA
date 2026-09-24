import React, { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Input,
  Textarea,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from './index'
import {
  FileText,
  Send,
  Download,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

export function DesignSystemShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [inputValue, setInputValue] = useState('')

  const dummyData = [
    {
      noHps: 'HPS/2026/09/0001',
      paket: 'Pengadaan Laptop dan Perangkat IT Kantor',
      total: 'Rp 165.000.000',
      status: 'verified',
      statusLabel: 'Diverifikasi PBJ',
    },
    {
      noHps: 'HPS/2026/09/0002',
      paket: 'Pemeliharaan Server & Jaringan Fiber Optik',
      total: 'Rp 95.000.000',
      status: 'draft',
      statusLabel: 'Draft PPK',
    },
    {
      noHps: 'HPS/2026/09/0003',
      paket: 'Pengadaan Meja & Kursi Ergonomis Ruang Rapat',
      total: 'Rp 45.000.000',
      status: 'fixed',
      statusLabel: 'Fixed',
    },
    {
      noHps: 'HPS/2026/09/0004',
      paket: 'Pengadaan Lisensi Software Antivirus Enterprise',
      total: 'Rp 30.000.000',
      status: 'danger',
      statusLabel: 'Ditolak',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Showcase */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-navy-900 text-white rounded-lg inline-flex">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </span>
              <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
                SENADA Design System
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Komponen antarmuka dasar sesuai panduan visual AGENTS.md §7 (Clean, Simple, Premium)
            </p>
          </div>
          <Badge variant="navy" size="lg" dot>
            AGENTS.md §7 Standard
          </Badge>
        </div>

        {/* 1. Button Section */}
        <Card>
          <CardHeader
            title="1. Button Components"
            subtitle="Varian tombol: primary (navy-900), secondary, outline, danger, ghost, dan loading state"
          />
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Primary Button
              </Button>
              <Button variant="secondary" leftIcon={<FileText className="w-4 h-4" />}>
                Secondary Button
              </Button>
              <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                Outline Navy
              </Button>
              <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>
                Hapus Data
              </Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="primary" isLoading>
                Loading...
              </Button>
              <Button variant="secondary" disabled>
                Disabled
              </Button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button size="sm" variant="primary">
                Small (sm)
              </Button>
              <Button size="md" variant="primary">
                Medium (md)
              </Button>
              <Button size="lg" variant="primary">
                Large (lg)
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* 2. Badge Section */}
        <Card>
          <CardHeader
            title="2. Badge Status Components"
            subtitle="Label status ringkas dan berwarna untuk status alur pengadaan barang/jasa"
          />
          <CardBody>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success" dot>
                Disetujui / Selesai
              </Badge>
              <Badge variant="warning" dot>
                Menunggu Persetujuan
              </Badge>
              <Badge variant="danger" dot>
                Ditolak / Dibatalkan
              </Badge>
              <Badge variant="info" dot>
                Undangan Terkirim
              </Badge>
              <Badge variant="navy" dot>
                Tahap Negosiasi
              </Badge>
              <Badge variant="gray">Draft Pembuatan</Badge>
            </div>
          </CardBody>
        </Card>

        {/* 3. Input & Form Section */}
        <Card>
          <CardHeader
            title="3. Input & Textarea Components"
            subtitle="Elemen input formulir dengan dukungan label, helper, pesan validasi error, dan ikon"
          />
          <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nomor HPS / Kontrak"
              placeholder="Contoh: HPS/2026/09/0001"
              required
              leftIcon={<Search className="w-4 h-4" />}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="Format nomor dokumen standar SENADA."
            />

            <Input
              label="Harga Satuan (Rp)"
              type="number"
              placeholder="0"
              required
              error="Harga satuan tidak boleh kurang dari Rp 0."
            />

            <div className="md:col-span-2">
              <Textarea
                label="Spesifikasi Teknis & Keterangan Pengadaan"
                placeholder="Tuliskan spesifikasi detail barang atau jasa yang dibutuhkan..."
                rows={3}
                helperText="Maksimal 500 karakter deskripsi rincian barang."
              />
            </div>
          </CardBody>
        </Card>

        {/* 4. Table Section */}
        <Card>
          <CardHeader
            title="4. Data Table Component"
            subtitle="Tabel data bersih dengan zebra-row minimal dan kontrol pagination terpadu"
            action={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsModalOpen(true)}
              >
                Buka Modal Demo
              </Button>
            }
          />
          <CardBody noPadding>
            <Table>
              <TableHeader>
                <TableHead>Nomor Dokumen</TableHead>
                <TableHead>Nama Paket Pengadaan</TableHead>
                <TableHead align="right">Nilai Total HPS</TableHead>
                <TableHead align="center">Status</TableHead>
                <TableHead align="center">Aksi</TableHead>
              </TableHeader>
              <TableBody>
                {dummyData.map((item, idx) => (
                  <TableRow key={item.noHps} isZebra={idx % 2 === 1}>
                    <TableCell className="font-semibold text-navy-900 font-mono text-xs">
                      {item.noHps}
                    </TableCell>
                    <TableCell className="max-w-xs">{item.paket}</TableCell>
                    <TableCell align="right" className="font-semibold text-navy-900">
                      {item.total}
                    </TableCell>
                    <TableCell align="center">
                      <Badge
                        variant={
                          item.status === 'verified' || item.status === 'fixed'
                            ? 'success'
                            : item.status === 'draft'
                            ? 'warning'
                            : 'danger'
                        }
                        dot
                      >
                        {item.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell align="center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm">
                          Detail
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              currentPage={currentPage}
              totalPages={4}
              totalData={36}
              limit={10}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </CardBody>
        </Card>

        {/* 5. Modal Demo */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="md"
        >
          <ModalHeader
            title="Konfirmasi Verifikasi HPS"
            subtitle="Paket Pengadaan Laptop dan Perangkat IT Kantor 2026"
            onClose={() => setIsModalOpen(false)}
          />
          <ModalBody className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-900">
                  Data Siap Diverifikasi
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Setelah diverifikasi oleh PBJ, seluruh rincian barang, volume, dan harga HPS akan bersifat fixed (terkunci) dan siap dibuatkan paket undangan ke penyedia.
                </p>
              </div>
            </div>

            <Textarea
              label="Catatan Verifikasi (Opsional)"
              placeholder="Tambahkan catatan jika ada penyesuaian spesifikasi atau harga pasar..."
              rows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={() => setIsModalOpen(false)}
            >
              Verifikasi & Kunci HPS
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}

export default DesignSystemShowcase
