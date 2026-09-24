'use strict'

const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const logger = require('../utils/logger')
const env = require('./env')

const ROLES = [
  { id: '00000000-0000-4000-8000-000000000001', name: 'admin', label: 'Administrator', description: 'Mengelola user, role, master data, dan konfigurasi sistem' },
  { id: '00000000-0000-4000-8000-000000000002', name: 'ppk', label: 'Pejabat Pembuat Komitmen (PPK)', description: 'Pemilik proses pengadaan, create HPS, terbitkan & tanda tangan SPK, terima Berita Acara' },
  { id: '00000000-0000-4000-8000-000000000003', name: 'pbj', label: 'Pejabat Pengadaan (PBJ)', description: 'Menjalankan proses pemilihan penyedia, buat undangan, verifikasi penawaran, negosiasi harga' },
  { id: '00000000-0000-4000-8000-000000000004', name: 'penyedia', label: 'Penyedia / Rekanan', description: 'Vendor eksternal: terima undangan, input penawaran harga, respon negosiasi, upload dokumen pengiriman' },
  { id: '00000000-0000-4000-8000-000000000005', name: 'ppspm', label: 'Pejabat Penandatangan SPM (PPSPM)', description: 'Bagian keuangan penerbit SPM, melihat Resume SPK untuk keperluan pembuatan SPM di aplikasi SAKTI' },
  { id: '00000000-0000-4000-8000-000000000006', name: 'petugas_laporan', label: 'Petugas Laporan Realisasi', description: 'Melihat Resume SPK dan menginput data realisasi ke modul laporan keuangan internal' },
]

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
]

const ROLE_PERMISSIONS_MAP = {
  admin: '*', // All permissions
  ppk: [
    'hps:create', 'hps:read', 'hps:update', 'hps:delete',
    'undangan:read',
    'penawaran:read',
    'negosiasi:read',
    'spk:create', 'spk:read', 'spk:update', 'spk:sign',
    'serah_terima:create', 'serah_terima:read', 'serah_terima:update',
    'laporan:read',
    'spm:read',
    'vendor:read',
    'document:read', 'document:upload',
    'audit:read',
  ],
  pbj: [
    'hps:read', 'hps:verify',
    'undangan:create', 'undangan:read', 'undangan:update', 'undangan:delete',
    'vendor:read', 'vendor:verify',
    'penawaran:read',
    'negosiasi:create', 'negosiasi:read', 'negosiasi:update',
    'spk:read',
    'serah_terima:read',
    'document:read', 'document:upload',
  ],
  penyedia: [
    'undangan:read',
    'penawaran:create', 'penawaran:read', 'penawaran:update',
    'negosiasi:read', 'negosiasi:respond',
    'spk:read',
    'serah_terima:read',
    'document:read', 'document:upload',
  ],
  ppspm: [
    'spk:read',
    'serah_terima:read',
    'spm:create', 'spm:read', 'spm:update',
    'laporan:read',
    'document:read',
  ],
  petugas_laporan: [
    'spk:read',
    'serah_terima:read',
    'laporan:create', 'laporan:read', 'laporan:update',
    'spm:read',
    'document:read',
  ],
}

let isInitialized = false

async function initDatabase(db, force = false) {
  if (isInitialized && !force) return
  try {
    const { sequelize, User, Role, UserRole, VendorProfile, Permission, RolePermission } = db

    // Fast check: jika role_permissions sudah terisi dan tidak force, skip heavy sync
    if (!force) {
      try {
        const existingCount = await RolePermission.count()
        if (existingCount > 0) {
          isInitialized = true
          return
        }
      } catch (e) {
        // Tabel mungkin belum ada, lanjutkan sync di bawah
      }
    }

    logger.info('AutoMigrate: Verifying database schema & tables...')
    await sequelize.sync()
    logger.info('AutoMigrate: Schema synchronized successfully.')

    // 1. Seed Roles jika belum ada
    for (const r of ROLES) {
      await Role.findOrCreate({
        where: { id: r.id },
        defaults: r,
      })
    }

    // 2. Seed Permissions
    await Permission.bulkCreate(PERMISSIONS, { ignoreDuplicates: true })

    // 3. Seed RolePermissions
    const roles = await Role.findAll({ attributes: ['id', 'name'] })
    const permissions = await Permission.findAll({ attributes: ['id', 'name'] })
    const roleMap = new Map(roles.map((r) => [r.name, r.id]))
    const permMap = new Map(permissions.map((p) => [p.name, p.id]))

    const pivotRows = []
    for (const [roleName, permList] of Object.entries(ROLE_PERMISSIONS_MAP)) {
      const roleId = roleMap.get(roleName)
      if (!roleId) continue

      if (permList === '*') {
        for (const perm of permissions) {
          pivotRows.push({
            id: crypto.randomUUID(),
            role_id: roleId,
            permission_id: perm.id,
          })
        }
      } else {
        for (const pName of permList) {
          const permId = permMap.get(pName)
          if (permId) {
            pivotRows.push({
              id: crypto.randomUUID(),
              role_id: roleId,
              permission_id: permId,
            })
          }
        }
      }
    }

    if (pivotRows.length > 0) {
      await RolePermission.bulkCreate(pivotRows, { ignoreDuplicates: true })
      logger.info(`AutoMigrate: Successfully seeded ${pivotRows.length} role permissions.`)
    }

    // 4. Seed / Update Admin User (Password: Admin#SENADA2026)
    const adminEmail = 'admin@senada.go.id'
    const adminPassword = 'Admin#SENADA2026'
    const adminHash = await bcrypt.hash(adminPassword, 10)

    let adminUser = await User.findOne({ where: { email: adminEmail } })
    if (!adminUser) {
      logger.info(`AutoMigrate: Creating default admin user (${adminEmail})...`)
      adminUser = await User.create({
        id: '00000000-0000-4000-8000-000000000099',
        name: 'Super Administrator',
        email: adminEmail,
        password_hash: adminHash,
        employee_id: '198001012005011001',
        phone: '081234567890',
        status: 'active',
      })
    } else {
      await adminUser.update({ password_hash: adminHash, status: 'active' })
    }

    await UserRole.findOrCreate({
      where: { user_id: adminUser.id, role_id: '00000000-0000-4000-8000-000000000001' },
      defaults: { id: crypto.randomUUID(), user_id: adminUser.id, role_id: '00000000-0000-4000-8000-000000000001' },
    })

    // 5. Seed / Update Demo Users untuk semua peran
    const demoAccounts = [
      { id: '00000000-0000-4000-8000-000000000101', email: 'ppk@senada.go.id', pass: 'Ppk12345!', name: 'Budi Santoso, ST (PPK)', roleId: '00000000-0000-4000-8000-000000000002', nip: '198203152008011002' },
      { id: '00000000-0000-4000-8000-000000000102', email: 'pbj@senada.go.id', pass: 'Pbj12345!', name: 'Siti Rahma, SE (PBJ)', roleId: '00000000-0000-4000-8000-000000000003', nip: '198506202010012003' },
      { id: '00000000-0000-4000-8000-000000000103', email: 'vendor1@test.com', pass: 'Vendor123!', name: 'PT Mitra Sukses Bersama', roleId: '00000000-0000-4000-8000-000000000004', isVendor: true },
      { id: '00000000-0000-4000-8000-000000000104', email: 'ppspm@senada.go.id', pass: 'Ppspm12345!', name: 'Drs. Ahmad Fauzi (PPSPM)', roleId: '00000000-0000-4000-8000-000000000005', nip: '197911122003121001' },
      { id: '00000000-0000-4000-8000-000000000105', email: 'petugas@senada.go.id', pass: 'Petugas12345!', name: 'Rina Wulandari, A.Md (Pelaporan)', roleId: '00000000-0000-4000-8000-000000000006', nip: '199008102015022001' },
    ]

    for (const demo of demoAccounts) {
      const demoHash = await bcrypt.hash(demo.pass, 10)
      let u = await User.findOne({ where: { email: demo.email } })

      if (!u) {
        u = await User.create({
          id: demo.id,
          name: demo.name,
          email: demo.email,
          password_hash: demoHash,
          employee_id: demo.nip || null,
          status: 'active',
        })
      } else {
        await u.update({ password_hash: demoHash, status: 'active' })
      }

      await UserRole.findOrCreate({
        where: { user_id: u.id, role_id: demo.roleId },
        defaults: { id: crypto.randomUUID(), user_id: u.id, role_id: demo.roleId },
      })

      if (demo.isVendor && VendorProfile) {
        await VendorProfile.findOrCreate({
          where: { user_id: u.id },
          defaults: {
            id: crypto.randomUUID(),
            user_id: u.id,
            company_name: 'PT Mitra Sukses Bersama',
            npwp: '01.234.567.8-901.000',
            verification_status: 'verified',
          },
        })
      }
    }

    isInitialized = true
    logger.info('AutoMigrate: Database initialized and ready.')
  } catch (err) {
    logger.error('AutoMigrate error:', err)
    throw err
  }
}

module.exports = { initDatabase }
