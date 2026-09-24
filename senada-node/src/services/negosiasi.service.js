'use strict'

const {
  Negosiasi,
  Penawaran,
  UndanganVendor,
  VendorProfile,
  Undangan,
  Hps,
  User,
  sequelize,
} = require('../models')
const { auditLog } = require('../audit/auditLogger')

class NegosiasiService {
  /**
   * Mengajukan ronde negosiasi harga baru oleh PBJ (Role: PBJ / Admin)
   * AGENTS.md §4 Tahap 4: PBJ melakukan negosiasi ya/tidak dengan penyedia, hasil harga nego dicatat
   */
  static async createUsulanNegosiasi(data, user, meta = {}) {
    const { penawaran_id, harga_usulan, catatan } = data

    // 1. Validasi penawaran
    const penawaran = await Penawaran.findByPk(penawaran_id, {
      include: [
        {
          model: UndanganVendor,
          as:    'undanganVendor',
          include: [{ model: VendorProfile, as: 'vendor' }, { model: Undangan, as: 'undangan', include: [{ model: Hps, as: 'hps' }] }],
        },
        {
          model: Negosiasi,
          as:    'negosiasiList',
        },
      ],
    })

    if (!penawaran) {
      const err = new Error(`Data penawaran dengan ID '${penawaran_id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // State machine: Hanya boleh jika status 'submitted' atau 'negotiating'
    if (!['submitted', 'negotiating'].includes(penawaran.status)) {
      const err = new Error(`Negosiasi tidak dapat dilakukan karena status penawaran adalah '${penawaran.status}'.`)
      err.statusCode = 400
      throw err
    }

    // Cek apakah ada ronde negosiasi sebelumnya yang masih berstatus 'pending' (menunggu respon vendor)
    const pendingRound = penawaran.negosiasiList.find((n) => n.status === 'pending')
    if (pendingRound) {
      const err = new Error(`Ronde negosiasi #${pendingRound.round} masih menunggu respon penyedia. Tidak dapat mengajukan ronde baru.`)
      err.statusCode = 400
      throw err
    }

    // Hitung nomor ronde berikutnya
    const currentMaxRound = penawaran.negosiasiList.reduce(
      (max, curr) => (curr.round > max ? curr.round : max),
      0
    )
    const nextRound = currentMaxRound + 1

    // Eksekusi transaksi DB
    const createdNegosiasi = await sequelize.transaction(async (t) => {
      const negosiasi = await Negosiasi.create(
        {
          penawaran_id,
          round:         nextRound,
          diajukan_oleh: user.id,
          harga_usulan:  parseFloat(harga_usulan),
          status:        'pending',
          catatan:       catatan || null,
        },
        { transaction: t }
      )

      // Ubah status penawaran menjadi 'negotiating'
      penawaran.status = 'negotiating'
      await penawaran.save({ transaction: t })

      return negosiasi
    })

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'create_negosiasi_round',
      entityType: 'negosiasi',
      entityId:   createdNegosiasi.id,
      after: {
        penawaran_id,
        round:        nextRound,
        harga_usulan: parseFloat(harga_usulan),
        vendor:       penawaran.undanganVendor?.vendor?.company_name,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return this.getNegosiasiById(createdNegosiasi.id, user)
  }

  /**
   * Respon penyedia terhadap usulan harga negosiasi (accepted / rejected)
   * AGENTS.md §4 Tahap 4: penyedia approve/reject (setuju/tidak)
   */
  static async respondNegosiasi(id, data, user, meta = {}) {
    const { status, catatan } = data

    const negosiasi = await Negosiasi.findByPk(id, {
      include: [
        {
          model: Penawaran,
          as:    'penawaran',
          include: [
            {
              model: UndanganVendor,
              as:    'undanganVendor',
              include: [{ model: VendorProfile, as: 'vendor' }],
            },
          ],
        },
      ],
    })

    if (!negosiasi) {
      const err = new Error(`Data negosiasi dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    if (negosiasi.status !== 'pending') {
      const err = new Error(`Ronde negosiasi #${negosiasi.round} sudah direspon sebelumnya dengan status '${negosiasi.status}'.`)
      err.statusCode = 400
      throw err
    }

    // Validasi kepemilikan penyedia
    const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
    if (!vendorProfile || negosiasi.penawaran.undanganVendor.vendor_id !== vendorProfile.id) {
      const err = new Error('Anda tidak memiliki hak untuk merespon negosiasi ini.')
      err.statusCode = 403
      throw err
    }

    const beforeStatus = negosiasi.status

    await sequelize.transaction(async (t) => {
      negosiasi.status = status
      negosiasi.responded_at = new Date()
      if (catatan) {
        negosiasi.catatan = negosiasi.catatan
          ? `${negosiasi.catatan} | Respon Penyedia: ${catatan}`
          : catatan
      }
      await negosiasi.save({ transaction: t })

      // Jika disetujui (accepted): status penawaran menjadi 'approved' (siap diterbitkan SPK)
      if (status === 'accepted') {
        negosiasi.penawaran.status = 'approved'
        await negosiasi.penawaran.save({ transaction: t })
      }
    })

    // Audit Log
    await auditLog({
      userId:     user.id,
      action:     'respond_negosiasi',
      entityType: 'negosiasi',
      entityId:   negosiasi.id,
      before:     { status: beforeStatus },
      after: {
        status:           negosiasi.status,
        penawaran_status: negosiasi.penawaran.status,
        harga_kesepakatan: status === 'accepted' ? negosiasi.harga_usulan : null,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    })

    return this.getNegosiasiById(negosiasi.id, user)
  }

  /**
   * Mengambil riwayat histori seluruh ronde negosiasi untuk suatu penawaran
   */
  static async getNegosiasiHistory(penawaranId, user) {
    const penawaran = await Penawaran.findByPk(penawaranId, {
      include: [
        {
          model: UndanganVendor,
          as:    'undanganVendor',
          include: [{ model: VendorProfile, as: 'vendor' }],
        },
      ],
    })

    if (!penawaran) {
      const err = new Error(`Data penawaran dengan ID '${penawaranId}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // Validasi vendor
    const isVendor = user.roles && user.roles.includes('penyedia')
    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile || penawaran.undanganVendor.vendor_id !== vendorProfile.id) {
        const err = new Error('Anda tidak memiliki hak untuk melihat riwayat negosiasi ini.')
        err.statusCode = 403
        throw err
      }
    }

    const history = await Negosiasi.findAll({
      where: { penawaran_id: penawaranId },
      order: [['round', 'ASC']],
      include: [
        {
          model: User,
          as:    'pengaju',
          attributes: ['id', 'name', 'email'],
        },
      ],
    })

    return {
      penawaran: {
        id:              penawaran.id,
        total_penawaran: penawaran.total_penawaran,
        status:          penawaran.status,
        vendor:          penawaran.undanganVendor?.vendor?.company_name,
      },
      total_rounds: history.length,
      history,
    }
  }

  /**
   * Mengambil detail satu ronde negosiasi
   */
  static async getNegosiasiById(id, user) {
    const negosiasi = await Negosiasi.findByPk(id, {
      include: [
        {
          model: User,
          as:    'pengaju',
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: Penawaran,
          as:    'penawaran',
          attributes: ['id', 'total_penawaran', 'status'],
          include: [
            {
              model: UndanganVendor,
              as:    'undanganVendor',
              attributes: ['id', 'vendor_id'],
            },
          ],
        },
      ],
    })

    if (!negosiasi) {
      const err = new Error(`Data negosiasi dengan ID '${id}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    const isVendor = user?.roles && user.roles.includes('penyedia')
    if (isVendor) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile || negosiasi.penawaran?.undanganVendor?.vendor_id !== vendorProfile.id) {
        const err = new Error('Anda tidak memiliki hak untuk melihat data negosiasi ini.')
        err.statusCode = 403
        throw err
      }
    }

    return negosiasi
  }
}

module.exports = NegosiasiService
