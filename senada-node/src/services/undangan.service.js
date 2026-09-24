'use strict'

const crypto = require('crypto')
const { Op }   = require('sequelize')
const {
  Undangan,
  UndanganVendor,
  Hps,
  HpsItem,
  VendorProfile,
  Penawaran,
  PenawaranItem,
  User,
  Document,
  sequelize,
} = require('../models')
const { auditLog } = require('../audit/auditLogger')

/**
 * Generate nomor undangan otomatis jika tidak diinput manual
 * Format: UND/{TAHUN}/{BULAN}/{NOMOR_URUT} -> Contoh: UND/2026/09/0001
 */
async function generateNomorUndangan(fiscalYear) {
  const currentYear = fiscalYear || new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')

  const count = await Undangan.count()
  const sequence = String(count + 1).padStart(4, '0')
  return `UND/${currentYear}/${month}/${sequence}`
}

class UndanganService {
  /**
   * Membuat paket Undangan baru untuk para vendor (Role: PBJ / Admin)
   * Mengacu pada HPS yang sudah berstatus 'verified' / 'fixed'
   */
  static async createUndangan(data, user, meta = {}) {
    const { hps_id, tanggal_undangan, batas_waktu_penawaran, vendor_ids } = data
    let { nomor_undangan } = data

    // 1. Validasi keberadaan & status HPS
    const hps = await Hps.findByPk(hps_id)
    if (!hps) {
      const err = new Error(`Data HPS dengan ID '${hps_id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // Aturan Alur Bisnis (AGENTS.md §4 Tahap 2): HPS harus sudah verified/fixed sebelum dibuatkan undangan
    if (hps.status === 'draft') {
      const err = new Error('Undangan hanya dapat diterbitkan untuk paket HPS yang sudah diverifikasi (status: verified / fixed).')
      err.statusCode = 400
      throw err
    }

    // 2. Cek apakah HPS sudah memiliki Undangan (relasi 1-1)
    const existingUndangan = await Undangan.findOne({ where: { hps_id } })
    if (existingUndangan) {
      const err = new Error(`Paket HPS '${hps.nama_paket}' sudah memiliki undangan (${existingUndangan.nomor_undangan}).`)
      err.statusCode = 409
      throw err
    }

    // 3. Validasi vendor_ids
    const validVendors = await VendorProfile.findAll({
      where: { id: { [Op.in]: vendor_ids } },
    })

    if (validVendors.length !== vendor_ids.length) {
      const err = new Error('Satu atau lebih penyedia/vendor yang dipilih tidak valid.')
      err.statusCode = 400
      throw err
    }

    // 4. Generate nomor undangan jika kosong
    if (!nomor_undangan) {
      nomor_undangan = await generateNomorUndangan(hps.fiscal_year)
    } else {
      const dup = await Undangan.findOne({ where: { nomor_undangan } })
      if (dup) {
        const err = new Error(`Nomor undangan '${nomor_undangan}' sudah digunakan.`)
        err.statusCode = 409
        throw err
      }
    }

    // 5. Eksekusi transaksi DB
    const createdUndangan = await sequelize.transaction(async (t) => {
      const undangan = await Undangan.create(
        {
          nomor_undangan,
          hps_id,
          pbj_id:                 user.id,
          status:                 'draft',
          tanggal_undangan:       tanggal_undangan || null,
          batas_waktu_penawaran:  new Date(batas_waktu_penawaran),
        },
        { transaction: t }
      )

      const pivotRows = vendor_ids.map((vendorId) => ({
        id:          crypto.randomUUID(),
        undangan_id: undangan.id,
        vendor_id:   vendorId,
        status:      'invited',
        invited_at:  new Date(),
      }))

      await UndanganVendor.bulkCreate(pivotRows, { transaction: t })

      return undangan
    })

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'create_undangan',
      entityType: 'undangan',
      entityId:   createdUndangan.id,
      after: {
        nomor_undangan:        createdUndangan.nomor_undangan,
        hps_id:                createdUndangan.hps_id,
        total_invited_vendors: vendor_ids.length,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return this.getUndanganById(createdUndangan.id, user)
  }

  /**
   * Mengambil daftar Undangan (RBAC aware: Vendor hanya melihat undangan miliknya)
   */
  static async getUndanganList(query = {}, user) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const offset = (page - 1) * limit

    const whereClause = {}
    const isVendor = user.roles && user.roles.includes('penyedia')

    if (query.status) {
      whereClause.status = query.status
    }

    // Jika user adalah vendor: hanya tampilkan undangan berstatus 'sent'/'closed' yang mengundang vendor ini (AGENTS.md §6.2)
    let vendorProfileId = null
    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile) {
        return { rows: [], pagination: { totalData: 0, totalPages: 0, currentPage: page, limit } }
      }
      vendorProfileId = vendorProfile.id

      // Vendor tidak boleh melihat draft undangan
      whereClause.status = { [Op.in]: ['sent', 'closed'] }
    }

    if (query.search) {
      whereClause[Op.or] = [
        { nomor_undangan: { [Op.like]: `%${query.search}%` } },
        { '$hps.nama_paket$': { [Op.like]: `%${query.search}%` } },
      ]
    }

    const includeOptions = [
      {
        model: Hps,
        as: 'hps',
        attributes: ['id', 'nomor_hps', 'nama_paket', 'fiscal_year', 'total_harga'],
        include: [
          {
            model: User,
            as: 'ppk',
            attributes: ['id', 'name', 'email'],
          },
        ],
      },
      {
        model: User,
        as: 'pbj',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: UndanganVendor,
        as: 'undanganVendors',
        required: isVendor ? true : false,
        ...(isVendor ? { where: { vendor_id: vendorProfileId } } : {}),
        include: [
          {
            model: VendorProfile,
            as: 'vendor',
            attributes: ['id', 'company_name', 'npwp', 'city', 'verification_status'],
          },
        ],
      },
    ]

    const { count, rows } = await Undangan.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: includeOptions,
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
   * Mengambil detail Undangan
   * Jika diakses oleh Vendor: otomatis update status undangan_vendor menjadi 'viewed' & catat viewed_at
   */
  static async getUndanganById(id, user) {
    const undangan = await Undangan.findByPk(id, {
      include: [
        {
          model: Hps,
          as: 'hps',
          include: [
            {
              model: HpsItem,
              as: 'items',
            },
            {
              model: User,
              as: 'ppk',
              attributes: ['id', 'name', 'email', 'phone'],
            },
          ],
        },
        {
          model: User,
          as: 'pbj',
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: UndanganVendor,
          as: 'undanganVendors',
          include: [
            {
              model: VendorProfile,
              as: 'vendor',
            },
            {
              model: Penawaran,
              as: 'penawaran',
              include: [
                {
                  model: PenawaranItem,
                  as: 'items',
                },
              ],
            },
          ],
        },
      ],
      order: [[{ model: Hps, as: 'hps' }, { model: HpsItem, as: 'items' }, 'urutan', 'ASC']],
    })

    if (!undangan) {
      const err = new Error(`Data undangan dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    const isVendor = user.roles && user.roles.includes('penyedia')

    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile) {
        const err = new Error('Profil penyedia tidak ditemukan.')
        err.statusCode = 403
        throw err
      }

      const vendorInvitation = undangan.undanganVendors.find(
        (uv) => uv.vendor_id === vendorProfile.id
      )

      if (!vendorInvitation) {
        const err = new Error('Anda tidak memiliki akses ke undangan ini.')
        err.statusCode = 403
        throw err
      }

      // Tracking aktivitas vendor (AGENTS.md §4 Tahap 3): Ubah status 'invited' -> 'viewed' saat pertama kali dilihat
      if (vendorInvitation.status === 'invited') {
        vendorInvitation.status = 'viewed'
        vendorInvitation.viewed_at = new Date()
        await vendorInvitation.save()
      }
    }

    // Ambil dokumen pendukung HPS / Undangan
    const documents = await Document.findAll({
      where: {
        [Op.or]: [
          { entity_type: 'hps', entity_id: undangan.hps_id },
          { entity_type: 'undangan', entity_id: undangan.id },
        ],
      },
      include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
    })

    const result = undangan.toJSON()
    result.documents = documents

    // Jika user adalah vendor: hanya sertakan undangan vendor miliknya sendiri (AGENTS.md §6.2)
    // dan sembunyikan harga satuan per item HPS (hanya tampilkan Jumlah Harga HPS / total pagu)
    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (vendorProfile) {
        result.undanganVendors = result.undanganVendors.filter(
          (uv) => uv.vendor_id === vendorProfile.id
        )
      }
      if (result.hps && Array.isArray(result.hps.items)) {
        result.hps.items = result.hps.items.map((item) => ({
          ...item,
          harga_satuan: null,
          subtotal: null,
        }))
      }
    }

    return result
  }

  /**
   * Mengubah Undangan (Hanya boleh saat status 'draft')
   */
  static async updateUndangan(id, data, user, meta = {}) {
    const undangan = await Undangan.findByPk(id)
    if (!undangan) {
      const err = new Error(`Data undangan dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (undangan.status !== 'draft') {
      const err = new Error(`Undangan berstatus '${undangan.status}' tidak dapat diubah lagi.`)
      err.statusCode = 400
      throw err
    }

    const isAdmin = user.roles && user.roles.includes('admin')
    if (!isAdmin && undangan.pbj_id !== user.id) {
      const err = new Error('Anda tidak memiliki hak untuk mengubah undangan ini.')
      err.statusCode = 403
      throw err
    }

    const beforeState = undangan.toJSON()

    await sequelize.transaction(async (t) => {
      if (data.tanggal_undangan) undangan.tanggal_undangan = data.tanggal_undangan
      if (data.batas_waktu_penawaran) undangan.batas_waktu_penawaran = new Date(data.batas_waktu_penawaran)

      if (Array.isArray(data.vendor_ids) && data.vendor_ids.length > 0) {
        // Hapus daftar vendor lama dan set yang baru
        await UndanganVendor.destroy({ where: { undangan_id: undangan.id }, transaction: t })

        const pivotRows = data.vendor_ids.map((vendorId) => ({
          id:          crypto.randomUUID(),
          undangan_id: undangan.id,
          vendor_id:   vendorId,
          status:      'invited',
          invited_at:  new Date(),
        }))

        await UndanganVendor.bulkCreate(pivotRows, { transaction: t })
      }

      await undangan.save({ transaction: t })
    })

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'update_undangan',
      entityType: 'undangan',
      entityId:   undangan.id,
      before:     beforeState,
      after:      undangan.toJSON(),
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return this.getUndanganById(undangan.id, user)
  }

  /**
   * Mengirim / Menerbitkan Undangan ke para Vendor (draft -> sent)
   */
  static async sendUndangan(id, user, meta = {}) {
    const undangan = await Undangan.findByPk(id, {
      include: [{ model: UndanganVendor, as: 'undanganVendors' }],
    })

    if (!undangan) {
      const err = new Error(`Data undangan dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (undangan.status !== 'draft') {
      const err = new Error(`Undangan sudah pernah dikirim atau berstatus '${undangan.status}'.`)
      err.statusCode = 400
      throw err
    }

    const now = new Date()
    undangan.status = 'sent'
    if (!undangan.tanggal_undangan) {
      undangan.tanggal_undangan = now
    }

    await sequelize.transaction(async (t) => {
      await undangan.save({ transaction: t })

      // Update invited_at pada seluruh vendor terkait
      await UndanganVendor.update(
        { invited_at: now },
        { where: { undangan_id: undangan.id }, transaction: t }
      )
    })

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'send_undangan',
      entityType: 'undangan',
      entityId:   undangan.id,
      after: {
        status:           'sent',
        tanggal_undangan: undangan.tanggal_undangan,
        total_vendors:    undangan.undanganVendors.length,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return this.getUndanganById(undangan.id, user)
  }

  /**
   * Menutup masa penawaran Undangan (sent -> closed)
   */
  static async closeUndangan(id, user, meta = {}) {
    const undangan = await Undangan.findByPk(id)
    if (!undangan) {
      const err = new Error(`Data undangan dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (undangan.status !== 'sent') {
      const err = new Error(`Hanya undangan dengan status 'sent' yang dapat ditutup. Status saat ini: '${undangan.status}'`)
      err.statusCode = 400
      throw err
    }

    undangan.status = 'closed'
    await undangan.save()

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'close_undangan',
      entityType: 'undangan',
      entityId:   undangan.id,
      after:      { status: 'closed' },
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return this.getUndanganById(undangan.id, user)
  }

  /**
   * Menghapus Undangan (Hanya boleh saat status masih 'draft')
   */
  static async deleteUndangan(id, user, meta = {}) {
    const undangan = await Undangan.findByPk(id)
    if (!undangan) {
      const err = new Error(`Data undangan dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (undangan.status !== 'draft') {
      const err = new Error(`Undangan berstatus '${undangan.status}' tidak dapat dihapus.`)
      err.statusCode = 400
      throw err
    }

    const beforeState = undangan.toJSON()
    await undangan.destroy() // Cascade deletes undangan_vendors

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'delete_undangan',
      entityType: 'undangan',
      entityId:   id,
      before:     beforeState,
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return true
  }

  /**
   * Respon Vendor terhadap Undangan (misal: Vendor menolak / decline undangan)
   */
  static async respondUndangan(id, data, user, meta = {}) {
    const { status, catatan } = data

    const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
    if (!vendorProfile) {
      const err = new Error('Hanya akun rekanan/penyedia yang dapat merespon undangan.')
      err.statusCode = 403
      throw err
    }

    const invitation = await UndanganVendor.findOne({
      where: {
        undangan_id: id,
        vendor_id:   vendorProfile.id,
      },
    })

    if (!invitation) {
      const err = new Error('Undangan tidak ditemukan untuk profil penyedia Anda.')
      err.statusCode = 404
      throw err
    }

    const beforeStatus = invitation.status
    invitation.status = status
    await invitation.save()

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'respond_undangan',
      entityType: 'undangan_vendors',
      entityId:   invitation.id,
      before:     { status: beforeStatus },
      after:      { status: invitation.status, catatan: catatan || null },
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return invitation
  }

  /**
   * Mengambil daftar penyedia/vendor terverifikasi yang siap diundang beserta rekam jejak ratingnya (Role: PBJ / Admin)
   */
  static async getAvailableVendors() {
    const { VendorEvaluation } = require('../models')
    const vendors = await VendorProfile.findAll({
      where: { verification_status: 'verified' },
      attributes: ['id', 'company_name', 'npwp', 'city', 'phone'],
      include: [
        {
          model: VendorEvaluation,
          as: 'evaluations',
          attributes: ['skor_akhir'],
          required: false,
        },
      ],
      order: [['company_name', 'ASC']],
    })

    return vendors.map((v) => {
      const vJson = v.toJSON()
      const evals = vJson.evaluations || []
      const count = evals.length
      const avg =
        count > 0
          ? (
              evals.reduce((sum, e) => sum + parseFloat(e.skor_akhir || 0), 0) /
              count
            ).toFixed(2)
          : 0

      return {
        id: vJson.id,
        company_name: vJson.company_name,
        npwp: vJson.npwp,
        city: vJson.city,
        phone: vJson.phone,
        total_evaluations: count,
        average_score: parseFloat(avg),
      }
    })
  }

  /**
   * Mengambil daftar HPS yang berstatus verified/fixed dan belum memiliki undangan (Role: PBJ / Admin)
   */
  static async getAvailableHps() {
    const verifiedHps = await Hps.findAll({
      where: { status: { [Op.in]: ['verified', 'fixed'] } },
      attributes: ['id', 'nomor_hps', 'nama_paket', 'total_harga', 'fiscal_year', 'status'],
      include: [
        {
          model: Undangan,
          as: 'undangan',
          attributes: ['id', 'nomor_undangan', 'status'],
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
    })

    return verifiedHps.filter((h) => !h.undangan)
  }
}

module.exports = UndanganService
