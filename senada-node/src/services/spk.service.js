'use strict'

const crypto = require('crypto')
const { Op } = require('sequelize')
const {
  Spk,
  Negosiasi,
  Penawaran,
  PenawaranItem,
  UndanganVendor,
  VendorProfile,
  Undangan,
  Hps,
  HpsItem,
  User,
  SerahTerima,
  SpmReference,
  LaporanRealisasi,
  Document,
  sequelize,
} = require('../models')
const { auditLog } = require('../audit/auditLogger')
const { generateSpkPdfBuffer } = require('../utils/spkPdfGenerator')

/**
 * Generate nomor SPK otomatis jika tidak diinput manual
 * Format: SPK/{TAHUN}/{BULAN}/{NOMOR_URUT} -> Contoh: SPK/2026/09/0001
 */
async function generateNomorSpk(fiscalYear) {
  const currentYear = fiscalYear || new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')

  const count = await Spk.count()
  const sequence = String(count + 1).padStart(4, '0')
  return `SPK/${currentYear}/${month}/${sequence}`
}

class SpkService {
  /**
   * Membuat Surat Perintah Kerja (SPK) baru oleh PPK (Role: PPK / Admin)
   * Mengacu pada hasil negosiasi yang berstatus 'accepted' (AGENTS.md §4 Tahap 5)
   */
  static async createSpk(data, user, meta = {}) {
    const { negosiasi_id, tanggal_spk, tanggal_mulai, tanggal_selesai } = data
    let { nomor_spk } = data

    // 1. Validasi keberadaan & status negosiasi
    const negosiasi = await Negosiasi.findByPk(negosiasi_id, {
      include: [
        {
          model: Penawaran,
          as:    'penawaran',
          include: [
            {
              model: UndanganVendor,
              as:    'undanganVendor',
              include: [
                { model: VendorProfile, as: 'vendor' },
                { model: Undangan, as: 'undangan', include: [{ model: Hps, as: 'hps' }] },
              ],
            },
          ],
        },
      ],
    })

    if (!negosiasi) {
      const err = new Error(`Data negosiasi dengan ID '${negosiasi_id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (negosiasi.status !== 'accepted') {
      const err = new Error(`SPK hanya dapat diterbitkan dari hasil negosiasi yang telah disetujui (status: accepted). Status saat ini: '${negosiasi.status}'.`)
      err.statusCode = 400
      throw err
    }

    // 2. Cek apakah SPK sudah pernah dibuat untuk negosiasi ini (relasi 1-1)
    const existingSpk = await Spk.findOne({ where: { negosiasi_id } })
    if (existingSpk) {
      const err = new Error(`SPK untuk hasil negosiasi ini sudah pernah diterbitkan (${existingSpk.nomor_spk}).`)
      err.statusCode = 409
      throw err
    }

    const vendorId = negosiasi.penawaran?.undanganVendor?.vendor_id
    if (!vendorId) {
      const err = new Error('Data profil penyedia untuk negosiasi ini tidak ditemukan.')
      err.statusCode = 400
      throw err
    }

    const fiscalYear = negosiasi.penawaran?.undanganVendor?.undangan?.hps?.fiscal_year

    // 3. Generate nomor SPK jika tidak diinput manual
    if (!nomor_spk) {
      nomor_spk = await generateNomorSpk(fiscalYear)
    } else {
      const dup = await Spk.findOne({ where: { nomor_spk } })
      if (dup) {
        const err = new Error(`Nomor SPK '${nomor_spk}' sudah digunakan.`)
        err.statusCode = 409
        throw err
      }
    }

    // 4. Eksekusi transaksi DB: buat SPK dan inisialisasi entitas Serah Terima
    const createdSpk = await sequelize.transaction(async (t) => {
      const spk = await Spk.create(
        {
          nomor_spk,
          negosiasi_id,
          ppk_id:          user.id,
          vendor_id:       vendorId,
          tanggal_spk:     tanggal_spk || new Date(),
          tanggal_mulai:   tanggal_mulai || null,
          tanggal_selesai: tanggal_selesai || null,
          nilai_kontrak:   negosiasi.harga_usulan,
          status:          'draft',
        },
        { transaction: t }
      )

      // Buat rekaman Serah Terima awal (status: 'pending') untuk SPK ini (AGENTS.md §4 Tahap 6)
      await SerahTerima.create(
        {
          id:            crypto.randomUUID(),
          spk_id:        spk.id,
          status:        'pending',
          diterima_oleh: user.id,
        },
        { transaction: t }
      )

      return spk
    })

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'create_spk',
      entityType: 'spk',
      entityId:   createdSpk.id,
      after: {
        nomor_spk:     createdSpk.nomor_spk,
        nilai_kontrak: createdSpk.nilai_kontrak,
        vendor:        negosiasi.penawaran?.undanganVendor?.vendor?.company_name,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return this.getSpkById(createdSpk.id, user)
  }

  /**
   * Tanda tangan SPK oleh PPK (draft -> signed / active)
   */
  static async signSpk(id, user, meta = {}) {
    const spk = await Spk.findByPk(id)
    if (!spk) {
      const err = new Error(`Data SPK dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (spk.status !== 'draft') {
      const err = new Error(`Hanya SPK dengan status 'draft' yang dapat ditandatangani. Status saat ini: '${spk.status}'.`)
      err.statusCode = 400
      throw err
    }

    const isAdmin = user.roles && user.roles.includes('admin')
    if (!isAdmin && spk.ppk_id !== user.id) {
      const err = new Error('Hanya PPK yang berwenang yang dapat menandatangani SPK ini.')
      err.statusCode = 403
      throw err
    }

    const beforeState = spk.toJSON()
    spk.status = 'signed'
    spk.signed_at = new Date()
    await spk.save()

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'sign_spk',
      entityType: 'spk',
      entityId:   spk.id,
      before:     { status: beforeState.status },
      after:      { status: spk.status, signed_at: spk.signed_at },
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return this.getSpkById(spk.id, user)
  }

  /**
   * Mengubah detail SPK (tanggal pelaksanaan) saat status masih draft
   */
  static async updateSpk(id, data, user, meta = {}) {
    const spk = await Spk.findByPk(id)
    if (!spk) {
      const err = new Error(`Data SPK dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (spk.status !== 'draft') {
      const err = new Error(`SPK dengan status '${spk.status}' tidak dapat diubah lagi.`)
      err.statusCode = 400
      throw err
    }

    const beforeState = spk.toJSON()

    if (data.tanggal_spk) spk.tanggal_spk = data.tanggal_spk
    if (data.tanggal_mulai) spk.tanggal_mulai = data.tanggal_mulai
    if (data.tanggal_selesai) spk.tanggal_selesai = data.tanggal_selesai

    await spk.save()

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'update_spk',
      entityType: 'spk',
      entityId:   spk.id,
      before:     beforeState,
      after:      spk.toJSON(),
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return this.getSpkById(spk.id, user)
  }

  /**
   * Mengambil daftar SPK (terisolasi jika diakses oleh vendor)
   */
  static async getSpkList(query = {}, user) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const offset = (page - 1) * limit

    const whereClause = {}
    const isVendor = user.roles && user.roles.includes('penyedia')

    if (query.status) {
      whereClause.status = query.status
    }

    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile) {
        return { rows: [], pagination: { totalData: 0, totalPages: 0, currentPage: page, limit } }
      }
      whereClause.vendor_id = vendorProfile.id
    }

    if (query.search) {
      whereClause[Op.or] = [
        { nomor_spk: { [Op.like]: `%${query.search}%` } },
        { '$vendor.company_name$': { [Op.like]: `%${query.search}%` } },
      ]
    }

    const { count, rows } = await Spk.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: VendorProfile,
          as:    'vendor',
          attributes: ['id', 'company_name', 'npwp', 'city'],
        },
        {
          model: User,
          as:    'ppk',
          attributes: ['id', 'name', 'email', 'employee_id'],
        },
        {
          model: SerahTerima,
          as:    'serahTerima',
          attributes: ['id', 'status', 'tanggal_serah_terima'],
        },
        {
          model: SpmReference,
          as:    'spmReferences',
          attributes: ['id', 'nomor_spm', 'tanggal_spm', 'status'],
        },
        {
          model: LaporanRealisasi,
          as:    'laporanRealisasiList',
          attributes: ['id', 'nilai_realisasi', 'tanggal_realisasi', 'status', 'keterangan'],
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
   * Mengambil detail lengkap SPK beserta seluruh rantai alur pengadaan
   */
  static async getSpkById(id, user) {
    const spk = await Spk.findByPk(id, {
      include: [
        {
          model: User,
          as:    'ppk',
          attributes: ['id', 'name', 'email', 'employee_id', 'phone'],
        },
        {
          model: VendorProfile,
          as:    'vendor',
        },
        {
          model: SerahTerima,
          as:    'serahTerima',
          include: [{ model: User, as: 'penerima', attributes: ['id', 'name', 'email'] }],
        },
        {
          model: Negosiasi,
          as:    'negosiasi',
          include: [
            {
              model: Penawaran,
              as:    'penawaran',
              include: [
                {
                  model: PenawaranItem,
                  as:    'items',
                  include: [{ model: HpsItem, as: 'hpsItem' }],
                },
                {
                  model: UndanganVendor,
                  as:    'undanganVendor',
                  include: [
                    {
                      model: Undangan,
                      as:    'undangan',
                      include: [
                        {
                          model: Hps,
                          as:    'hps',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })

    if (!spk) {
      const err = new Error(`Data SPK dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // Validasi vendor
    const isVendor = user.roles && user.roles.includes('penyedia')
    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile || spk.vendor_id !== vendorProfile.id) {
        const err = new Error('Anda tidak memiliki hak untuk melihat SPK ini.')
        err.statusCode = 403
        throw err
      }
    }

    // Ambil dokumen pendukung SPK & Serah Terima
    const documents = await Document.findAll({
      where: {
        [Op.or]: [
          { entity_type: 'spk', entity_id: spk.id },
          { entity_type: 'serah_terima', entity_id: spk.serahTerima?.id || '' },
        ],
      },
      include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
    })

    const result = spk.toJSON()
    result.documents = documents

    return result
  }

  /**
   * Menghasilkan file PDF resmi SPK
   */
  static async generateSpkPdf(id, user) {
    const spk = await this.getSpkById(id, user)
    return generateSpkPdfBuffer(spk)
  }

  /**
   * Mengambil daftar hasil negosiasi berstatus 'accepted' yang siap dibuatkan SPK (Role: PPK / Admin)
   */
  static async getAvailableNegosiasi() {
    const acceptedNegosiasi = await Negosiasi.findAll({
      where: { status: 'accepted' },
      include: [
        {
          model: Spk,
          as: 'spk',
          required: false,
        },
        {
          model: Penawaran,
          as: 'penawaran',
          include: [
            {
              model: UndanganVendor,
              as: 'undanganVendor',
              include: [
                { model: VendorProfile, as: 'vendor' },
                { model: Undangan, as: 'undangan', include: [{ model: Hps, as: 'hps' }] },
              ],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    })

    return acceptedNegosiasi.filter((n) => !n.spk)
  }
}

module.exports = SpkService
