'use strict'

const { Op } = require('sequelize')
const {
  Hps,
  HpsItem,
  User,
  Document,
  sequelize,
} = require('../models')
const { auditLog } = require('../audit/auditLogger')

/**
 * Generate nomor HPS otomatis jika tidak diinput manual
 * Format: HPS/{TAHUN}/{BULAN}/{NOMOR_URUT} -> Contoh: HPS/2026/09/0001
 */
async function generateNomorHps(fiscalYear) {
  const currentYear = fiscalYear || new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')

  const count = await Hps.count({
    where: { fiscal_year: currentYear },
  })

  const sequence = String(count + 1).padStart(4, '0')
  return `HPS/${currentYear}/${month}/${sequence}`
}

class HpsService {
  /**
   * Membuat paket HPS baru beserta rincian barang/jasa & dokumen pendukung
   */
  static async createHps(data, user, file = null, meta = {}) {
    const { nama_paket, deskripsi, fiscal_year, items } = data
    let { nomor_hps } = data

    if (!nomor_hps) {
      nomor_hps = await generateNomorHps(fiscal_year)
    } else {
      // Cek keunikan nomor_hps jika diinput manual
      const existing = await Hps.findOne({ where: { nomor_hps } })
      if (existing) {
        const err = new Error(`Nomor HPS '${nomor_hps}' sudah terdaftar.`)
        err.statusCode = 409
        throw err
      }
    }

    // Hitung subtotal tiap item dan total harga keseluruhan HPS
    let totalHarga = 0
    const processedItems = items.map((item, index) => {
      const volume = parseFloat(item.volume)
      const hargaSatuan = parseFloat(item.harga_satuan)
      const subtotal = volume * hargaSatuan
      totalHarga += subtotal

      return {
        nama_barang:  item.nama_barang,
        spesifikasi:  item.spesifikasi || null,
        satuan:       item.satuan,
        volume:       volume,
        harga_satuan: hargaSatuan,
        subtotal:     subtotal,
        urutan:       item.urutan !== undefined ? item.urutan : index + 1,
      }
    })

    // Eksekusi transaksi DB
    const createdHps = await sequelize.transaction(async (t) => {
      const hps = await Hps.create(
        {
          nomor_hps,
          nama_paket,
          deskripsi:   deskripsi || null,
          fiscal_year: parseInt(fiscal_year),
          ppk_id:      user.id,
          status:      'draft',
          total_harga: totalHarga,
        },
        { transaction: t }
      )

      const itemsWithHpsId = processedItems.map((item) => ({
        ...item,
        hps_id: hps.id,
      }))

      await HpsItem.bulkCreate(itemsWithHpsId, { transaction: t })

      // Simpan dokumen jika ada file diunggah
      if (file) {
        await Document.create(
          {
            entity_type: 'hps',
            entity_id:   hps.id,
            file_name:   file.originalname,
            file_path:   file.path,
            file_type:   file.mimetype,
            file_size:   file.size,
            uploaded_by: user.id,
          },
          { transaction: t }
        )
      }

      return hps
    })

    // Audit Trail
    await auditLog({
      userId:     user.id,
      action:     'create_hps',
      entityType: 'hps',
      entityId:   createdHps.id,
      after: {
        nomor_hps:   createdHps.nomor_hps,
        nama_paket:  createdHps.nama_paket,
        total_harga: totalHarga,
        items_count: processedItems.length,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return this.getHpsById(createdHps.id)
  }

  /**
   * Mengambil daftar HPS dengan pagination, search, dan filter
   */
  static async getHpsList(query = {}) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const offset = (page - 1) * limit

    const whereClause = {}

    if (query.status) {
      whereClause.status = query.status
    }

    if (query.fiscal_year) {
      whereClause.fiscal_year = parseInt(query.fiscal_year)
    }

    if (query.search) {
      whereClause[Op.or] = [
        { nomor_hps: { [Op.like]: `%${query.search}%` } },
        { nama_paket: { [Op.like]: `%${query.search}%` } },
      ]
    }

    const { count, rows } = await Hps.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'ppk',
          attributes: ['id', 'name', 'email', 'employee_id'],
        },
        {
          model: User,
          as: 'pbj',
          attributes: ['id', 'name', 'email', 'employee_id'],
        },
        {
          model: HpsItem,
          as: 'items',
          attributes: ['id', 'nama_barang', 'satuan', 'volume', 'harga_satuan', 'subtotal', 'urutan'],
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
   * Mengambil detail satu HPS beserta rincian barang dan dokumen pendukung
   */
  static async getHpsById(id) {
    const hps = await Hps.findByPk(id, {
      include: [
        {
          model: User,
          as: 'ppk',
          attributes: ['id', 'name', 'email', 'employee_id', 'phone'],
        },
        {
          model: User,
          as: 'pbj',
          attributes: ['id', 'name', 'email', 'employee_id', 'phone'],
        },
        {
          model: HpsItem,
          as: 'items',
        },
      ],
      order: [[{ model: HpsItem, as: 'items' }, 'urutan', 'ASC']],
    })

    if (!hps) {
      const err = new Error(`Data HPS dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // Ambil dokumen pendukung polymorphic
    const documents = await Document.findAll({
      where: {
        entity_type: 'hps',
        entity_id:   hps.id,
      },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email'],
        },
      ],
    })

    const hpsData = hps.toJSON()
    hpsData.documents = documents

    return hpsData
  }

  /**
   * Mengubah paket HPS (Hanya boleh jika status masih 'draft')
   */
  static async updateHps(id, data, user, file = null, meta = {}) {
    const hps = await Hps.findByPk(id, {
      include: [{ model: HpsItem, as: 'items' }],
    })

    if (!hps) {
      const err = new Error(`Data HPS dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // Aturan State Machine (AGENTS.md §4): HPS fixed/verified tidak boleh diubah
    if (hps.status !== 'draft') {
      const err = new Error(
        `HPS berstatus '${hps.status}' sudah bersifat tetap (fixed) dan tidak dapat diubah lagi.`
      )
      err.statusCode = 400
      throw err
    }

    // Validasi kepemilikan (PPK pembuat atau Admin)
    const isAdmin = user.roles && user.roles.includes('admin')
    if (!isAdmin && hps.ppk_id !== user.id) {
      const err = new Error('Anda tidak memiliki hak untuk mengubah HPS ini.')
      err.statusCode = 403
      throw err
    }

    const beforeState = hps.toJSON()

    await sequelize.transaction(async (t) => {
      // Update data dasar HPS
      if (data.nama_paket) hps.nama_paket = data.nama_paket
      if (data.deskripsi !== undefined) hps.deskripsi = data.deskripsi
      if (data.fiscal_year) hps.fiscal_year = parseInt(data.fiscal_year)

      // Jika ada pembaruan rincian items
      if (Array.isArray(data.items) && data.items.length > 0) {
        // Hapus item lama
        await HpsItem.destroy({ where: { hps_id: hps.id }, transaction: t })

        let newTotalHarga = 0
        const newItems = data.items.map((item, index) => {
          const volume = parseFloat(item.volume)
          const hargaSatuan = parseFloat(item.harga_satuan)
          const subtotal = volume * hargaSatuan
          newTotalHarga += subtotal

          return {
            hps_id:       hps.id,
            nama_barang:  item.nama_barang,
            spesifikasi:  item.spesifikasi || null,
            satuan:       item.satuan,
            volume:       volume,
            harga_satuan: hargaSatuan,
            subtotal:     subtotal,
            urutan:       item.urutan !== undefined ? item.urutan : index + 1,
          }
        })

        await HpsItem.bulkCreate(newItems, { transaction: t })
        hps.total_harga = newTotalHarga
      }

      await hps.save({ transaction: t })

      // Simpan dokumen baru jika ada file yang diunggah
      if (file) {
        await Document.create(
          {
            entity_type: 'hps',
            entity_id:   hps.id,
            file_name:   file.originalname,
            file_path:   file.path,
            file_type:   file.mimetype,
            file_size:   file.size,
            uploaded_by: user.id,
          },
          { transaction: t }
        )
      }
    })

    // Audit Trail
    await auditLog({
      userId:     user.id,
      action:     'update_hps',
      entityType: 'hps',
      entityId:   hps.id,
      before: {
        nama_paket:  beforeState.nama_paket,
        total_harga: beforeState.total_harga,
      },
      after: {
        nama_paket:  hps.nama_paket,
        total_harga: hps.total_harga,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return this.getHpsById(hps.id)
  }

  /**
   * Menghapus paket HPS (Hanya boleh jika status masih 'draft')
   */
  static async deleteHps(id, user, meta = {}) {
    const hps = await Hps.findByPk(id)

    if (!hps) {
      const err = new Error(`Data HPS dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (hps.status !== 'draft') {
      const err = new Error(`HPS berstatus '${hps.status}' tidak dapat dihapus.`)
      err.statusCode = 400
      throw err
    }

    const isAdmin = user.roles && user.roles.includes('admin')
    if (!isAdmin && hps.ppk_id !== user.id) {
      const err = new Error('Anda tidak memiliki hak untuk menghapus HPS ini.')
      err.statusCode = 403
      throw err
    }

    const beforeState = hps.toJSON()

    // Hapus HPS (hps_items otomatis cascade per foreign key)
    await hps.destroy()

    // Audit Trail
    await auditLog({
      userId:     user.id,
      action:     'delete_hps',
      entityType: 'hps',
      entityId:   id,
      before:     beforeState,
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return true
  }

  /**
   * Verifikasi HPS oleh PBJ (mengubah status dari draft -> verified / fixed)
   * AGENTS.md §4: HPS dibuat oleh PPK, diverifikasi oleh PBJ
   */
  static async verifyHps(id, { status = 'verified', catatan }, user, meta = {}) {
    const hps = await Hps.findByPk(id)

    if (!hps) {
      const err = new Error(`Data HPS dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    const beforeStatus = hps.status

    const now = new Date()
    hps.status = status
    hps.pbj_id = user.id
    hps.verified_at = now

    if (status === 'fixed') {
      hps.fixed_at = now
    }

    await hps.save()

    // Audit Trail
    await auditLog({
      userId:     user.id,
      action:     'verify_hps',
      entityType: 'hps',
      entityId:   hps.id,
      before: {
        status: beforeStatus,
      },
      after: {
        status:      hps.status,
        verified_by: user.id,
        verified_at: hps.verified_at,
        catatan:     catatan || null,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return this.getHpsById(hps.id)
  }

  /**
   * Unggah dokumen tambahan pada HPS
   */
  static async uploadDocument(id, file, user, meta = {}) {
    const hps = await Hps.findByPk(id)

    if (!hps) {
      const err = new Error(`Data HPS dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (!file) {
      const err = new Error('File dokumen wajib dilampirkan.')
      err.statusCode = 400
      throw err
    }

    const doc = await Document.create({
      entity_type: 'hps',
      entity_id:   hps.id,
      file_name:   file.originalname,
      file_path:   file.path,
      file_type:   file.mimetype,
      file_size:   file.size,
      uploaded_by: user.id,
    })

    // Audit Trail
    await auditLog({
      userId:     user.id,
      action:     'upload_document_hps',
      entityType: 'documents',
      entityId:   doc.id,
      after: {
        hps_id:    hps.id,
        file_name: file.originalname,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return doc
  }
}

module.exports = HpsService
