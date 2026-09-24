'use strict'

const PERMISSIONS = [
  // User Management
  { id: '10000000-0000-4000-8000-000000000001', name: 'user:create', module: 'user', description: 'Membuat user baru' },
  { id: '10000000-0000-4000-8000-000000000002', name: 'user:read',   module: 'user', description: 'Melihat data user' },
  { id: '10000000-0000-4000-8000-000000000003', name: 'user:update', module: 'user', description: 'Mengubah data user' },
  { id: '10000000-0000-4000-8000-000000000004', name: 'user:delete', module: 'user', description: 'Menonaktifkan/menghapus user' },

  // Role & Permission Management
  { id: '10000000-0000-4000-8000-000000000005', name: 'role:create', module: 'role', description: 'Membuat role baru' },
  { id: '10000000-0000-4000-8000-000000000006', name: 'role:read',   module: 'role', description: 'Melihat daftar role & permission' },
  { id: '10000000-0000-4000-8000-000000000007', name: 'role:update', module: 'role', description: 'Mengubah role & permission' },
  { id: '10000000-0000-4000-8000-000000000008', name: 'role:delete', module: 'role', description: 'Menghapus role' },

  // Vendor Management
  { id: '10000000-0000-4000-8000-000000000009', name: 'vendor:read',   module: 'vendor', description: 'Melihat profil & daftar vendor' },
  { id: '10000000-0000-4000-8000-000000000010', name: 'vendor:verify', module: 'vendor', description: 'Memverifikasi atau menolak profil vendor' },

  // HPS (Harga Perkiraan Sendiri)
  { id: '10000000-0000-4000-8000-000000000011', name: 'hps:create', module: 'hps', description: 'Menyusun paket HPS & item barang' },
  { id: '10000000-0000-4000-8000-000000000012', name: 'hps:read',   module: 'hps', description: 'Melihat paket HPS' },
  { id: '10000000-0000-4000-8000-000000000013', name: 'hps:update', module: 'hps', description: 'Mengubah draft HPS' },
  { id: '10000000-0000-4000-8000-000000000014', name: 'hps:delete', module: 'hps', description: 'Menghapus draft HPS' },
  { id: '10000000-0000-4000-8000-000000000015', name: 'hps:verify', module: 'hps', description: 'Memverifikasi dan menetapkan status HPS' },

  // Undangan Pengadaan
  { id: '10000000-0000-4000-8000-000000000016', name: 'undangan:create', module: 'undangan', description: 'Membuat undangan pengadaan untuk vendor' },
  { id: '10000000-0000-4000-8000-000000000017', name: 'undangan:read',   module: 'undangan', description: 'Melihat daftar dan detail undangan' },
  { id: '10000000-0000-4000-8000-000000000018', name: 'undangan:update', module: 'undangan', description: 'Mengubah draft undangan' },
  { id: '10000000-0000-4000-8000-000000000019', name: 'undangan:delete', module: 'undangan', description: 'Membatalkan/menghapus undangan' },

  // Penawaran Vendor
  { id: '10000000-0000-4000-8000-000000000020', name: 'penawaran:create', module: 'penawaran', description: 'Mengirimkan penawaran harga pengadaan' },
  { id: '10000000-0000-4000-8000-000000000021', name: 'penawaran:read',   module: 'penawaran', description: 'Melihat data penawaran harga' },
  { id: '10000000-0000-4000-8000-000000000022', name: 'penawaran:update', module: 'penawaran', description: 'Memperbarui dokumen penawaran' },

  // Negosiasi Harga
  { id: '10000000-0000-4000-8000-000000000023', name: 'negosiasi:create',  module: 'negosiasi', description: 'Mengajukan harga usulan negosiasi baru' },
  { id: '10000000-0000-4000-8000-000000000024', name: 'negosiasi:read',    module: 'negosiasi', description: 'Melihat histori dan status negosiasi' },
  { id: '10000000-0000-4000-8000-000000000025', name: 'negosiasi:update',  module: 'negosiasi', description: 'Mengubah catatan usulan negosiasi' },
  { id: '10000000-0000-4000-8000-000000000026', name: 'negosiasi:respond', module: 'negosiasi', description: 'Menyetujui atau menolak usulan negosiasi' },

  // Surat Perintah Kerja (SPK)
  { id: '10000000-0000-4000-8000-000000000027', name: 'spk:create', module: 'spk', description: 'Menerbitkan draft SPK dari hasil negosiasi' },
  { id: '10000000-0000-4000-8000-000000000028', name: 'spk:read',   module: 'spk', description: 'Melihat data & Resume SPK' },
  { id: '10000000-0000-4000-8000-000000000029', name: 'spk:update', module: 'spk', description: 'Mengubah draft SPK' },
  { id: '10000000-0000-4000-8000-000000000030', name: 'spk:sign',   module: 'spk', description: 'Menandatangani SPK (digital/approval)' },

  // Serah Terima Barang / Jasa
  { id: '10000000-0000-4000-8000-000000000031', name: 'serah_terima:create', module: 'serah_terima', description: 'Membuat Berita Acara Serah Terima' },
  { id: '10000000-0000-4000-8000-000000000032', name: 'serah_terima:read',   module: 'serah_terima', description: 'Melihat data Berita Acara Serah Terima' },
  { id: '10000000-0000-4000-8000-000000000033', name: 'serah_terima:update', module: 'serah_terima', description: 'Mengubah status serah terima' },

  // Laporan Realisasi
  { id: '10000000-0000-4000-8000-000000000034', name: 'laporan:create', module: 'laporan', description: 'Menginput laporan realisasi keuangan' },
  { id: '10000000-0000-4000-8000-000000000035', name: 'laporan:read',   module: 'laporan', description: 'Melihat laporan realisasi pengadaan' },
  { id: '10000000-0000-4000-8000-000000000036', name: 'laporan:update', module: 'laporan', description: 'Mengubah data realisasi pengadaan' },

  // Integrasi SAKTI / SPM Reference
  { id: '10000000-0000-4000-8000-000000000037', name: 'spm:create', module: 'spm', description: 'Menginput referensi nomor SPM dari SAKTI' },
  { id: '10000000-0000-4000-8000-000000000038', name: 'spm:read',   module: 'spm', description: 'Melihat referensi SPM SAKTI' },
  { id: '10000000-0000-4000-8000-000000000039', name: 'spm:update', module: 'spm', description: 'Mengubah status pemrosesan SPM' },

  // Dokumen & Upload
  { id: '10000000-0000-4000-8000-000000000040', name: 'document:read',   module: 'document', description: 'Mengunduh dan melihat dokumen' },
  { id: '10000000-0000-4000-8000-000000000041', name: 'document:upload', module: 'document', description: 'Mengunggah file dokumen pendukung' },
  { id: '10000000-0000-4000-8000-000000000042', name: 'document:delete', module: 'document', description: 'Menghapus file dokumen' },

  // Audit Log
  { id: '10000000-0000-4000-8000-000000000043', name: 'audit:read', module: 'audit', description: 'Melihat riwayat audit trail aktivitas' },
].map((p) => ({
  ...p,
  created_at: new Date(),
  updated_at: new Date(),
}))

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('permissions', PERMISSIONS, {
      updateOnDuplicate: ['module', 'description', 'updated_at'],
    })
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('permissions', {
      id: PERMISSIONS.map((p) => p.id),
    })
  },
}
