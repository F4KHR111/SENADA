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

let isInitialized = false

async function initDatabase(db) {
  if (isInitialized) return
  try {
    const { sequelize, User, Role, UserRole, VendorProfile } = db

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

    // 2. Seed / Update Admin User (Password: Admin#SENADA2026)
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
      // Pastikan password selalu sinkron
      await adminUser.update({ password_hash: adminHash, status: 'active' })
    }

    await UserRole.findOrCreate({
      where: { user_id: adminUser.id, role_id: '00000000-0000-4000-8000-000000000001' },
      defaults: { id: crypto.randomUUID(), user_id: adminUser.id, role_id: '00000000-0000-4000-8000-000000000001' },
    })

    // 3. Seed / Update Demo Users untuk semua peran
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
  }
}

module.exports = { initDatabase }
