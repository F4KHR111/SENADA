'use strict'

const ROLES = [
  {
    id:          '00000000-0000-4000-8000-000000000001',
    name:        'admin',
    label:       'Administrator',
    description: 'Mengelola user, role, master data, dan konfigurasi sistem',
    created_at:  new Date(),
    updated_at:  new Date(),
  },
  {
    id:          '00000000-0000-4000-8000-000000000002',
    name:        'ppk',
    label:       'Pejabat Pembuat Komitmen (PPK)',
    description: 'Pemilik proses pengadaan, create HPS, terbitkan & tanda tangan SPK, terima Berita Acara',
    created_at:  new Date(),
    updated_at:  new Date(),
  },
  {
    id:          '00000000-0000-4000-8000-000000000003',
    name:        'pbj',
    label:       'Pejabat Pengadaan (PBJ)',
    description: 'Menjalankan proses pemilihan penyedia, buat undangan, verifikasi penawaran, negosiasi harga',
    created_at:  new Date(),
    updated_at:  new Date(),
  },
  {
    id:          '00000000-0000-4000-8000-000000000004',
    name:        'penyedia',
    label:       'Penyedia / Rekanan',
    description: 'Vendor eksternal: terima undangan, input penawaran harga, respon negosiasi, upload dokumen pengiriman',
    created_at:  new Date(),
    updated_at:  new Date(),
  },
  {
    id:          '00000000-0000-4000-8000-000000000005',
    name:        'ppspm',
    label:       'Pejabat Penandatangan SPM (PPSPM)',
    description: 'Bagian keuangan penerbit SPM, melihat Resume SPK untuk keperluan pembuatan SPM di aplikasi SAKTI',
    created_at:  new Date(),
    updated_at:  new Date(),
  },
  {
    id:          '00000000-0000-4000-8000-000000000006',
    name:        'petugas_laporan',
    label:       'Petugas Laporan Realisasi',
    description: 'Melihat Resume SPK dan menginput data realisasi ke modul laporan keuangan internal',
    created_at:  new Date(),
    updated_at:  new Date(),
  },
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', ROLES, {
      updateOnDuplicate: ['label', 'description', 'updated_at'],
    })
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', {
      id: ROLES.map((r) => r.id),
    })
  },
}
