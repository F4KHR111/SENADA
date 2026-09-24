'use strict'

const {
  LaporanRealisasi,
  SpmReference,
  Spk,
  VendorProfile,
  User,
  sequelize,
} = require('../models')
const { auditLog } = require('../audit/auditLogger')

class LaporanService {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. LAPORAN REALISASI KEUANGAN (Petugas Laporan Realisasi)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Menginput data laporan realisasi keuangan untuk suatu SPK (AGENTS.md §4 Tahap 7)
   */
  static async createLaporanRealisasi(data, user, meta = {}) {
    const { spk_id, nilai_realisasi, tanggal_realisasi, keterangan, status } = data

    const spk = await Spk.findByPk(spk_id, {
      include: [{ model: VendorProfile, as: 'vendor' }],
    })

    if (!spk) {
      const err = new Error(`Data SPK dengan ID '${spk_id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    const createdLaporan = await LaporanRealisasi.create({
      spk_id,
      petugas_id:        user.id,
      nilai_realisasi:   parseFloat(nilai_realisasi),
      tanggal_realisasi: tanggal_realisasi || new Date().toISOString().split('T')[0],
      keterangan:        keterangan || null,
      status:            status || 'draft',
    })

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'create_laporan_realisasi',
      entityType: 'laporan_realisasi',
      entityId:   createdLaporan.id,
      after: {
        spk_id,
        nomor_spk:       spk.nomor_spk,
        nilai_realisasi: createdLaporan.nilai_realisasi,
        status:          createdLaporan.status,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return this.getLaporanRealisasiById(createdLaporan.id, user)
  }

  /**
   * Mengambil daftar laporan realisasi
   */
  static async getLaporanRealisasiList(query = {}, _user) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const offset = (page - 1) * limit

    const whereClause = {}
    if (query.spk_id) whereClause.spk_id = query.spk_id
    if (query.status) whereClause.status = query.status

    const { count, rows } = await LaporanRealisasi.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Spk,
          as:    'spk',
          attributes: ['id', 'nomor_spk', 'nilai_kontrak', 'status', 'tanggal_spk'],
          include: [
            {
              model: VendorProfile,
              as:    'vendor',
              attributes: ['id', 'company_name', 'npwp'],
            },
          ],
        },
        {
          model: User,
          as:    'petugas',
          attributes: ['id', 'name', 'email'],
        },
      ],
      distinct: true,
    })

    return {
      rows,
      pagination: {
        totalData:   count,
        totalPages:  Math.ceil(count / limit),
        currentPage: page,
        limit,
      },
    }
  }

  /**
   * Mengambil detail laporan realisasi
   */
  static async getLaporanRealisasiById(id, _user) {
    const laporan = await LaporanRealisasi.findByPk(id, {
      include: [
        {
          model: Spk,
          as:    'spk',
          include: [
            { model: VendorProfile, as: 'vendor' },
            { model: User, as: 'ppk', attributes: ['id', 'name', 'email'] },
          ],
        },
        {
          model: User,
          as:    'petugas',
          attributes: ['id', 'name', 'email', 'employee_id'],
        },
      ],
    })

    if (!laporan) {
      const err = new Error(`Data laporan realisasi dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    return laporan
  }

  /**
   * Memperbarui laporan realisasi (status draft -> submitted)
   */
  static async updateLaporanRealisasi(id, data, user, meta = {}) {
    const laporan = await LaporanRealisasi.findByPk(id)
    if (!laporan) {
      const err = new Error(`Data laporan realisasi dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    const beforeState = laporan.toJSON()

    if (data.nilai_realisasi) laporan.nilai_realisasi = parseFloat(data.nilai_realisasi)
    if (data.tanggal_realisasi) laporan.tanggal_realisasi = data.tanggal_realisasi
    if (data.keterangan !== undefined) laporan.keterangan = data.keterangan
    if (data.status) laporan.status = data.status

    await laporan.save()

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'update_laporan_realisasi',
      entityType: 'laporan_realisasi',
      entityId:   laporan.id,
      before:     beforeState,
      after:      laporan.toJSON(),
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return this.getLaporanRealisasiById(laporan.id, user)
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. SPM REFERENCE (PPSPM / Integrasi SAKTI)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Menginput nomor referensi SPM hasil dari aplikasi SAKTI (AGENTS.md §4 Tahap 7)
   */
  static async createSpmReference(data, user, meta = {}) {
    const { spk_id, nomor_spm, tanggal_spm, status } = data

    const spk = await Spk.findByPk(spk_id, {
      include: [{ model: VendorProfile, as: 'vendor' }],
    })

    if (!spk) {
      const err = new Error(`Data SPK dengan ID '${spk_id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    const createdSpm = await SpmReference.create({
      spk_id,
      ppspm_id:    user.id,
      nomor_spm,
      tanggal_spm: tanggal_spm || new Date().toISOString().split('T')[0],
      status:      status || 'pending',
    })

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'create_spm_reference',
      entityType: 'spm_references',
      entityId:   createdSpm.id,
      after: {
        spk_id,
        nomor_spk: spk.nomor_spk,
        nomor_spm: createdSpm.nomor_spm,
        status:    createdSpm.status,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return this.getSpmReferenceById(createdSpm.id, user)
  }

  /**
   * Mengambil daftar referensi SPM
   */
  static async getSpmReferenceList(query = {}, _user) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const offset = (page - 1) * limit

    const whereClause = {}
    if (query.spk_id) whereClause.spk_id = query.spk_id
    if (query.status) whereClause.status = query.status

    const { count, rows } = await SpmReference.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Spk,
          as:    'spk',
          attributes: ['id', 'nomor_spk', 'nilai_kontrak', 'status', 'tanggal_spk'],
          include: [
            {
              model: VendorProfile,
              as:    'vendor',
              attributes: ['id', 'company_name', 'npwp', 'bank_name', 'bank_account_number', 'bank_account_holder'],
            },
          ],
        },
        {
          model: User,
          as:    'ppspm',
          attributes: ['id', 'name', 'email', 'employee_id'],
        },
      ],
      distinct: true,
    })

    return {
      rows,
      pagination: {
        totalData:   count,
        totalPages:  Math.ceil(count / limit),
        currentPage: page,
        limit,
      },
    }
  }

  /**
   * Mengambil detail referensi SPM
   */
  static async getSpmReferenceById(id, _user) {
    const spm = await SpmReference.findByPk(id, {
      include: [
        {
          model: Spk,
          as:    'spk',
          include: [
            { model: VendorProfile, as: 'vendor' },
            { model: User, as: 'ppk', attributes: ['id', 'name', 'email'] },
          ],
        },
        {
          model: User,
          as:    'ppspm',
          attributes: ['id', 'name', 'email', 'employee_id'],
        },
      ],
    })

    if (!spm) {
      const err = new Error(`Data referensi SPM dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    return spm
  }

  /**
   * Memperbarui nomor SPM atau status proses SPM
   */
  static async updateSpmReference(id, data, user, meta = {}) {
    const spm = await SpmReference.findByPk(id)
    if (!spm) {
      const err = new Error(`Data referensi SPM dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    const beforeState = spm.toJSON()

    if (data.nomor_spm) spm.nomor_spm = data.nomor_spm
    if (data.tanggal_spm) spm.tanggal_spm = data.tanggal_spm
    if (data.status) spm.status = data.status

    await spm.save()

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'update_spm_reference',
      entityType: 'spm_references',
      entityId:   spm.id,
      before:     beforeState,
      after:      spm.toJSON(),
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return this.getSpmReferenceById(spm.id, user)
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. REKAPITULASI PELAPORAN KEUANGAN (Dashboard)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Menghasilkan rekap statistik pelaporan keuangan: kontrak vs realisasi vs SPM
   */
  static async getRekapPelaporan(_user) {
    const totalSpk = await Spk.count()
    const totalNilaiKontrak = (await Spk.sum('nilai_kontrak')) || 0
    const totalRealisasi = (await LaporanRealisasi.sum('nilai_realisasi', { where: { status: 'submitted' } })) || 0
    const totalSpmProcessed = await SpmReference.count({ where: { status: 'processed' } })
    const totalSpmPending = await SpmReference.count({ where: { status: 'pending' } })

    return {
      rekap_kontrak: {
        total_spk:           totalSpk,
        total_nilai_kontrak: parseFloat(totalNilaiKontrak),
      },
      rekap_realisasi: {
        total_realisasi_submitted: parseFloat(totalRealisasi),
        persentase_realisasi: totalNilaiKontrak > 0 ? ((totalRealisasi / totalNilaiKontrak) * 100).toFixed(2) : 0,
      },
      rekap_spm_sakti: {
        processed: totalSpmProcessed,
        pending:   totalSpmPending,
      },
    }
  }
}

module.exports = LaporanService
