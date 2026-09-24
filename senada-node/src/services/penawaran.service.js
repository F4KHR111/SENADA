'use strict'

const { Op } = require('sequelize')
const {
  Penawaran,
  PenawaranItem,
  Undangan,
  UndanganVendor,
  VendorProfile,
  Hps,
  HpsItem,
  User,
  Negosiasi,
  Document,
  sequelize,
} = require('../models')
const { auditLog } = require('../audit/auditLogger')

class PenawaranService {
  /**
   * Mengirimkan penawaran harga pengadaan (Role: Penyedia / Rekanan)
   * AGENTS.md §4 Tahap 3: Rincian barang & volume fixed dari HPS, penyedia hanya input harga.
   */
  static async createPenawaran(data, user, file = null, meta = {}) {
    const { undangan_id, items } = data

    // 1. Validasi bahwa user adalah akun vendor/penyedia
    const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
    if (!vendorProfile) {
      const err = new Error('Hanya akun rekanan/penyedia yang dapat mengajukan penawaran harga.')
      err.statusCode = 403
      throw err
    }

    // 2. Cek undangan dan statusnya
    const undangan = await Undangan.findByPk(undangan_id, {
      include: [{ model: Hps, as: 'hps', include: [{ model: HpsItem, as: 'items' }] }],
    })

    if (!undangan) {
      const err = new Error(`Data undangan dengan ID '${undangan_id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (undangan.status !== 'sent') {
      const err = new Error(`Penawaran tidak dapat diajukan karena status undangan adalah '${undangan.status}'.`)
      err.statusCode = 400
      throw err
    }

    // Cek batas waktu penawaran
    if (undangan.batas_waktu_penawaran && new Date() > new Date(undangan.batas_waktu_penawaran)) {
      const err = new Error('Batas waktu pengajuan penawaran untuk undangan ini telah berakhir.')
      err.statusCode = 400
      throw err
    }

    // 3. Validasi bahwa vendor diundang pada undangan ini
    const invitation = await UndanganVendor.findOne({
      where: {
        undangan_id: undangan.id,
        vendor_id:   vendorProfile.id,
      },
    })

    if (!invitation) {
      const err = new Error('Perusahaan Anda tidak terdaftar sebagai penyedia yang diundang pada paket ini.')
      err.statusCode = 403
      throw err
    }

    if (invitation.status === 'declined') {
      const err = new Error('Anda telah menolak undangan ini dan tidak dapat mengajukan penawaran.')
      err.statusCode = 400
      throw err
    }

    // 4. Cek apakah penawaran sudah pernah diajukan
    const existingPenawaran = await Penawaran.findOne({
      where: { undangan_vendor_id: invitation.id },
    })

    if (existingPenawaran) {
      const err = new Error('Penawaran harga untuk paket ini sudah pernah diajukan oleh perusahaan Anda.')
      err.statusCode = 409
      throw err
    }

    // 5. Validasi dan kalkulasi harga item mengacu ke volume HPS (fixed)
    const hpsItemsMap = new Map(undangan.hps.items.map((i) => [i.id, i]))
    let totalPenawaran = 0

    const processedItems = items.map((item) => {
      const hpsItem = hpsItemsMap.get(item.hps_item_id)
      if (!hpsItem) {
        const err = new Error(`Item HPS dengan ID '${item.hps_item_id}' tidak valid untuk paket ini.`)
        err.statusCode = 400
        throw err
      }

      const volume = parseFloat(hpsItem.volume)
      const hargaSatuan = parseFloat(item.harga_satuan)
      const subtotal = volume * hargaSatuan
      totalPenawaran += subtotal

      return {
        hps_item_id:  hpsItem.id,
        harga_satuan: hargaSatuan,
        subtotal:     subtotal,
      }
    })

    // 6. Eksekusi transaksi DB
    const createdPenawaran = await sequelize.transaction(async (t) => {
      const penawaran = await Penawaran.create(
        {
          undangan_vendor_id: invitation.id,
          total_penawaran:    totalPenawaran,
          status:             'submitted',
          submitted_at:       new Date(),
        },
        { transaction: t }
      )

      const itemsWithPenawaranId = processedItems.map((pi) => ({
        ...pi,
        penawaran_id: penawaran.id,
      }))

      await PenawaranItem.bulkCreate(itemsWithPenawaranId, { transaction: t })

      // Ubah status undangan_vendor menjadi 'submitted'
      invitation.status = 'submitted'
      await invitation.save({ transaction: t })

      // Simpan dokumen surat penawaran (jika ada file diunggah)
      if (file) {
        await Document.create(
          {
            entity_type: 'penawaran',
            entity_id:   penawaran.id,
            file_name:   file.originalname,
            file_path:   file.path,
            file_type:   file.mimetype,
            file_size:   file.size,
            uploaded_by: user.id,
          },
          { transaction: t }
        )
      }

      return penawaran
    })

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'create_penawaran',
      entityType: 'penawaran',
      entityId:   createdPenawaran.id,
      after: {
        undangan_id:     undangan.id,
        total_penawaran: totalPenawaran,
        vendor:          vendorProfile.company_name,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return this.getPenawaranById(createdPenawaran.id, user)
  }

  /**
   * Mengambil daftar penawaran (terisolasi untuk vendor)
   */
  static async getPenawaranList(query = {}, user) {
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const offset = (page - 1) * limit

    const whereClause = {}
    const isVendor = user.roles && user.roles.includes('penyedia')

    if (query.status) {
      whereClause.status = query.status
    }

    const includeUndanganVendor = {
      model: UndanganVendor,
      as:    'undanganVendor',
      include: [
        {
          model: VendorProfile,
          as:    'vendor',
          attributes: ['id', 'company_name', 'npwp', 'city'],
        },
        {
          model: Undangan,
          as:    'undangan',
          attributes: ['id', 'nomor_undangan', 'status', 'batas_waktu_penawaran'],
          include: [
            {
              model: Hps,
              as:    'hps',
              attributes: ['id', 'nomor_hps', 'nama_paket', 'total_harga'],
            },
          ],
        },
      ],
    }

    // Jika user adalah vendor: filter hanya penawaran milik perusahaannya
    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile) {
        return { rows: [], pagination: { totalData: 0, totalPages: 0, currentPage: page, limit } }
      }
      includeUndanganVendor.where = { vendor_id: vendorProfile.id }
      includeUndanganVendor.required = true
    } else if (query.undangan_id) {
      includeUndanganVendor.where = { undangan_id: query.undangan_id }
      includeUndanganVendor.required = true
    }

    const { count, rows } = await Penawaran.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [includeUndanganVendor],
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
   * Mengambil detail satu penawaran beserta item dan riwayat negosiasi
   */
  static async getPenawaranById(id, user) {
    const penawaran = await Penawaran.findByPk(id, {
      include: [
        {
          model: PenawaranItem,
          as:    'items',
          include: [
            {
              model: HpsItem,
              as:    'hpsItem',
            },
          ],
        },
        {
          model: UndanganVendor,
          as:    'undanganVendor',
          include: [
            {
              model: VendorProfile,
              as:    'vendor',
            },
            {
              model: Undangan,
              as:    'undangan',
              include: [
                {
                  model: Hps,
                  as:    'hps',
                },
                {
                  model: User,
                  as:    'pbj',
                  attributes: ['id', 'name', 'email', 'phone'],
                },
              ],
            },
          ],
        },
        {
          model: Negosiasi,
          as:    'negosiasiList',
          include: [
            {
              model: User,
              as:    'pengaju',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
      order: [[{ model: Negosiasi, as: 'negosiasiList' }, 'round', 'ASC']],
    })

    if (!penawaran) {
      const err = new Error(`Data penawaran dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // Validasi otorisasi vendor
    const isVendor = user.roles && user.roles.includes('penyedia')
    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile || penawaran.undanganVendor.vendor_id !== vendorProfile.id) {
        const err = new Error('Anda tidak memiliki hak untuk melihat penawaran ini.')
        err.statusCode = 403
        throw err
      }
    }

    // Ambil dokumen pendukung penawaran
    const documents = await Document.findAll({
      where: {
        entity_type: 'penawaran',
        entity_id:   penawaran.id,
      },
      include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
    })

    const result = penawaran.toJSON()
    result.documents = documents

    return result
  }

  /**
   * Mengubah harga penawaran (Hanya diizinkan jika status masih 'submitted' dan sebelum batas waktu)
   */
  static async updatePenawaran(id, data, user, file = null, meta = {}) {
    const penawaran = await Penawaran.findByPk(id, {
      include: [
        {
          model: UndanganVendor,
          as:    'undanganVendor',
          include: [{ model: Undangan, as: 'undangan', include: [{ model: Hps, as: 'hps', include: [{ model: HpsItem, as: 'items' }] }] }],
        },
      ],
    })

    if (!penawaran) {
      const err = new Error(`Data penawaran dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // 1. Validasi kepemilikan vendor terlebih dahulu
    const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
    if (!vendorProfile || penawaran.undanganVendor?.vendor_id !== vendorProfile.id) {
      const err = new Error('Anda tidak memiliki hak untuk mengubah penawaran ini.')
      err.statusCode = 403
      throw err
    }

    // 2. State machine: Hanya boleh jika 'submitted'
    if (penawaran.status !== 'submitted') {
      const err = new Error(`Penawaran berstatus '${penawaran.status}' sudah tidak dapat diubah lagi.`)
      err.statusCode = 400
      throw err
    }

    // 3. Cek batas waktu penawaran
    const batasWaktu = penawaran.undanganVendor?.undangan?.batas_waktu_penawaran
    if (batasWaktu && new Date() > new Date(batasWaktu)) {
      const err = new Error('Batas waktu penawaran telah berakhir. Pembaruan harga ditolak.')
      err.statusCode = 400
      throw err
    }

    const beforeState = penawaran.toJSON()

    await sequelize.transaction(async (t) => {
      if (Array.isArray(data.items) && data.items.length > 0) {
        const hpsItemsMap = new Map(penawaran.undanganVendor.undangan.hps.items.map((i) => [i.id, i]))
        let newTotal = 0

        const newItems = data.items.map((item) => {
          const hpsItem = hpsItemsMap.get(item.hps_item_id)
          if (!hpsItem) {
            const err = new Error(`Item HPS dengan ID '${item.hps_item_id}' tidak valid.`)
            err.statusCode = 400
            throw err
          }

          const volume = parseFloat(hpsItem.volume)
          const hargaSatuan = parseFloat(item.harga_satuan)
          const subtotal = volume * hargaSatuan
          newTotal += subtotal

          return {
            penawaran_id: penawaran.id,
            hps_item_id:  hpsItem.id,
            harga_satuan: hargaSatuan,
            subtotal:     subtotal,
          }
        })

        // Hapus item lama dan insert item baru
        await PenawaranItem.destroy({ where: { penawaran_id: penawaran.id }, transaction: t })
        await PenawaranItem.bulkCreate(newItems, { transaction: t })

        penawaran.total_penawaran = newTotal
        await penawaran.save({ transaction: t })
      }

      // Simpan dokumen baru jika ada file diunggah
      if (file) {
        await Document.create(
          {
            entity_type: 'penawaran',
            entity_id:   penawaran.id,
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

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'update_penawaran',
      entityType: 'penawaran',
      entityId:   penawaran.id,
      before:     { total_penawaran: beforeState.total_penawaran },
      after:      { total_penawaran: penawaran.total_penawaran },
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return this.getPenawaranById(penawaran.id, user)
  }

  /**
   * Upload dokumen penawaran bertandatangan / cap basah
   */
  static async uploadDocument(id, file, user, meta = {}) {
    const penawaran = await Penawaran.findByPk(id, {
      include: [{ model: UndanganVendor, as: 'undanganVendor' }],
    })

    if (!penawaran) {
      const err = new Error(`Data penawaran dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (!file) {
      const err = new Error('File dokumen wajib dilampirkan.')
      err.statusCode = 400
      throw err
    }

    // Validasi kepemilikan vendor
    const isVendor = user.roles && user.roles.includes('penyedia')
    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile || penawaran.undanganVendor?.vendor_id !== vendorProfile.id) {
        const err = new Error('Anda tidak memiliki hak untuk mengunggah dokumen pada penawaran ini.')
        err.statusCode = 403
        throw err
      }
    }

    const doc = await Document.create({
      entity_type: 'penawaran',
      entity_id:   penawaran.id,
      file_name:   file.originalname,
      file_path:   file.path,
      file_type:   file.mimetype,
      file_size:   file.size,
      uploaded_by: user.id,
    })

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'upload_document_penawaran',
      entityType: 'documents',
      entityId:   doc.id,
      after:      { penawaran_id: penawaran.id, file_name: file.originalname },
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return doc
  }
}

module.exports = PenawaranService
