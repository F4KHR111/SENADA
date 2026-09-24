'use strict'

const {
  SerahTerima,
  Spk,
  VendorProfile,
  User,
  Document,
  Negosiasi,
  Penawaran,
  PenawaranItem,
  UndanganVendor,
  Undangan,
  Hps,
  HpsItem,
  sequelize,
} = require('../models')
const { auditLog } = require('../audit/auditLogger')

class SerahTerimaService {
  /**
   * Upload dokumen pengiriman / surat jalan / BAST oleh rekanan (Role: Penyedia)
   * AGENTS.md §4 Tahap 6: upload dokumen surat jalan/pengiriman/izin mulai kerja
   */
  static async uploadDokumenPengiriman(spkId, file, user, meta = {}) {
    const spk = await Spk.findByPk(spkId, {
      include: [{ model: SerahTerima, as: 'serahTerima' }],
    })

    if (!spk) {
      const err = new Error(`Data SPK dengan ID '${spkId}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (!spk.serahTerima) {
      const err = new Error('Entitas Berita Acara Serah Terima tidak ditemukan untuk SPK ini.')
      err.statusCode = 404
      throw err
    }

    if (!file) {
      const err = new Error('File dokumen surat jalan / BAST wajib dilampirkan.')
      err.statusCode = 400
      throw err
    }

    // Validasi kepemilikan vendor
    const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
    if (!vendorProfile || spk.vendor_id !== vendorProfile.id) {
      const err = new Error('Hanya penyedia pelaksana kontrak yang dapat mengunggah dokumen serah terima.')
      err.statusCode = 403
      throw err
    }

    const doc = await Document.create({
      entity_type: 'serah_terima',
      entity_id:   spk.serahTerima.id,
      file_name:   file.originalname,
      file_path:   file.path,
      file_type:   file.mimetype,
      file_size:   file.size,
      uploaded_by: user.id,
    })

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'upload_document_serah_terima',
      entityType: 'documents',
      entityId:   doc.id,
      after: {
        spk_id:          spk.id,
        serah_terima_id: spk.serahTerima.id,
        file_name:       file.originalname,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return doc
  }

  /**
   * Menyelesaikan proses serah terima barang/jasa oleh PPK (pending -> completed)
   * Mengubah status SPK menjadi 'completed' (AGENTS.md §4 Tahap 6)
   */
  static async completeSerahTerima(spkId, data, user, meta = {}) {
    const spk = await Spk.findByPk(spkId, {
      include: [{ model: SerahTerima, as: 'serahTerima' }, { model: VendorProfile, as: 'vendor' }],
    })

    if (!spk) {
      const err = new Error(`Data SPK dengan ID '${spkId}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (!spk.serahTerima) {
      const err = new Error('Data serah terima untuk SPK ini tidak ditemukan.')
      err.statusCode = 404
      throw err
    }

    if (spk.serahTerima.status === 'completed') {
      const err = new Error('Serah terima untuk SPK ini sudah diselesaikan sebelumnya.')
      err.statusCode = 400
      throw err
    }

    // SPK harus berstatus 'signed' atau 'active' untuk dapat diserahterimakan
    if (!['signed', 'active'].includes(spk.status)) {
      const err = new Error(`Serah terima hanya dapat dilakukan pada SPK yang telah ditandatangani. Status SPK saat ini: '${spk.status}'.`)
      err.statusCode = 400
      throw err
    }

    const isAdmin = user.roles && user.roles.includes('admin')
    if (!isAdmin && spk.ppk_id !== user.id) {
      const err = new Error('Hanya Pejabat Pembuat Komitmen (PPK) yang berwenang yang dapat menerima hasil pekerjaan.')
      err.statusCode = 403
      throw err
    }

    const tglSerahTerima = data.tanggal_serah_terima || new Date().toISOString().split('T')[0]

    await sequelize.transaction(async (t) => {
      // 1. Update Serah Terima
      spk.serahTerima.status = 'completed'
      spk.serahTerima.tanggal_serah_terima = tglSerahTerima
      spk.serahTerima.diterima_oleh = user.id
      await spk.serahTerima.save({ transaction: t })

      // 2. Update status SPK menjadi completed
      spk.status = 'completed'
      await spk.save({ transaction: t })
    })

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'complete_serah_terima',
      entityType: 'serah_terima',
      entityId:   spk.serahTerima.id,
      after: {
        spk_id:               spk.id,
        nomor_spk:            spk.nomor_spk,
        tanggal_serah_terima: tglSerahTerima,
        status:               'completed',
        vendor:               spk.vendor?.company_name,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return this.getResumeSpk(spkId, user)
  }

  /**
   * Mengambil Resume SPK lengkap (untuk kebutuhan PPSPM / SAKTI dan Laporan Realisasi)
   * AGENTS.md §4 Tahap 6 & 7: Menghasilkan Berita Acara Serah Terima & Berita Acara Pembayaran -> Resume SPK
   */
  static async getResumeSpk(spkId, user) {
    const spk = await Spk.findByPk(spkId, {
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
                      include: [{ model: Hps, as: 'hps' }],
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
      const err = new Error(`Data SPK dengan ID '${spkId}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // Validasi kepemilikan jika diakses oleh akun vendor
    const isVendor = user?.roles && user.roles.includes('penyedia')
    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile || spk.vendor_id !== vendorProfile.id) {
        const err = new Error('Anda tidak memiliki hak untuk melihat resume SPK ini.')
        err.statusCode = 403
        throw err
      }
    }

    // Ambil dokumen serah terima (Surat Jalan, BAST, dll)
    const documents = await Document.findAll({
      where: {
        entity_type: 'serah_terima',
        entity_id:   spk.serahTerima?.id || '',
      },
      include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
    })

    const hps = spk.negosiasi?.penawaran?.undanganVendor?.undangan?.hps
    const items = spk.negosiasi?.penawaran?.items || []

    return {
      nomor_spk:       spk.nomor_spk,
      nilai_kontrak:   spk.nilai_kontrak,
      status:          spk.status,
      tanggal_spk:     spk.tanggal_spk,
      tanggal_mulai:   spk.tanggal_mulai,
      tanggal_selesai: spk.tanggal_selesai,
      ppk:             spk.ppk,
      vendor:          spk.vendor,
      hps:             hps,
      spk: {
        id:              spk.id,
        nomor_spk:       spk.nomor_spk,
        status:          spk.status,
        tanggal_spk:     spk.tanggal_spk,
        tanggal_mulai:   spk.tanggal_mulai,
        tanggal_selesai: spk.tanggal_selesai,
        nilai_kontrak:   spk.nilai_kontrak,
        signed_at:       spk.signed_at,
      },
      pihak: {
        ppk:    spk.ppk,
        vendor: spk.vendor,
      },
      pengadaan: {
        hps_id:     hps?.id,
        nomor_hps:  hps?.nomor_hps,
        nama_paket: hps?.nama_paket,
        total_hps:  hps?.total_harga,
      },
      kesepakatan_negosiasi: {
        harga_final:  spk.negosiasi?.harga_usulan,
        catatan:      spk.negosiasi?.catatan,
        responded_at: spk.negosiasi?.responded_at,
      },
      serah_terima: {
        id:                   spk.serahTerima?.id,
        status:               spk.serahTerima?.status,
        tanggal_serah_terima: spk.serahTerima?.tanggal_serah_terima,
        diterima_oleh:        spk.serahTerima?.penerima,
        documents,
      },
      items,
    }
  }

  /**
   * Mengambil daftar serah terima dengan filter dan paginasi (terisolasi untuk vendor)
   */
  static async getList(query = {}, user) {
    const page     = parseInt(query.page)  || 1
    const limit    = parseInt(query.limit) || 10
    const offset   = (page - 1) * limit
    const isVendor = user.roles && user.roles.includes('penyedia')

    const whereClause = {}
    if (query.status) whereClause.status = query.status
    if (query.spk_id) whereClause.spk_id = query.spk_id

    const spkWhere = {}
    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile) {
        return { rows: [], pagination: { totalData: 0, totalPages: 0, currentPage: page, limit } }
      }
      spkWhere.vendor_id = vendorProfile.id
    }

    const { count, rows } = await SerahTerima.findAndCountAll({
      where:  whereClause,
      limit,
      offset,
      order:  [['created_at', 'DESC']],
      include: [
        {
          model:    Spk,
          as:       'spk',
          where:    isVendor ? spkWhere : spkWhere,
          required: isVendor,
          attributes: ['id', 'nomor_spk', 'nilai_kontrak', 'status', 'tanggal_spk'],
          include: [
            { model: VendorProfile, as: 'vendor', attributes: ['id', 'company_name', 'npwp'] },
            { model: User, as: 'ppk', attributes: ['id', 'name', 'email'] },
          ],
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
   * Mengambil detail serah terima berdasarkan spkId (dengan validasi kepemilikan vendor)
   */
  static async getBySpkId(spkId, user) {
    const spk = await Spk.findByPk(spkId, {
      include: [
        {
          model: SerahTerima,
          as:    'serahTerima',
          include: [
            { model: User, as: 'penerima', attributes: ['id', 'name', 'email'] },
          ],
        },
        { model: VendorProfile, as: 'vendor', attributes: ['id', 'company_name', 'npwp', 'city'] },
        { model: User, as: 'ppk', attributes: ['id', 'name', 'email'] },
      ],
    })

    if (!spk) {
      const err = new Error(`Data SPK dengan ID '${spkId}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // Validasi kepemilikan vendor
    const isVendor = user.roles && user.roles.includes('penyedia')
    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile || spk.vendor_id !== vendorProfile.id) {
        const err = new Error('Anda tidak memiliki hak untuk melihat data serah terima ini.')
        err.statusCode = 403
        throw err
      }
    }

    const documents = spk.serahTerima
      ? await Document.findAll({
          where: { entity_type: 'serah_terima', entity_id: spk.serahTerima.id },
          include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
        })
      : []

    return { spk, serahTerima: spk.serahTerima, documents }
  }
}

module.exports = SerahTerimaService
