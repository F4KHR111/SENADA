'use strict'

const {
  VendorEvaluation,
  Spk,
  VendorProfile,
  User,
  SerahTerima,
  sequelize,
} = require('../models')
const auditLog = require('../audit/auditLogger')

class VendorEvaluationService {
  /**
   * Memberikan penilaian kinerja rekanan oleh PPK setelah serah terima SPK selesai
   */
  static async createEvaluation(spkId, data, user, meta = {}) {
    const spk = await Spk.findByPk(spkId, {
      include: [
        { model: VendorProfile, as: 'vendor' },
        { model: SerahTerima, as: 'serahTerima' },
        { model: User, as: 'ppk', attributes: ['id', 'name', 'employee_id'] },
      ],
    })

    if (!spk) {
      const err = new Error(`Data SPK dengan ID '${spkId}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // SPK harus berstatus 'completed' atau serah terima sudah 'completed'
    const isCompleted = spk.status === 'completed' || spk.serahTerima?.status === 'completed'
    if (!isCompleted) {
      const err = new Error('Penilaian kinerja vendor hanya dapat dilakukan setelah serah terima barang/jasa diselesaikan (SPK Completed).')
      err.statusCode = 400
      throw err
    }

    // Cek otorisasi penilai: hanya PPK pemilik SPK atau Admin
    const isAdmin = user.roles && user.roles.includes('admin')
    if (!isAdmin && spk.ppk_id !== user.id) {
      const err = new Error('Hanya Pejabat Pembuat Komitmen (PPK) yang menerbitkan SPK ini yang berhak memberikan penilaian.')
      err.statusCode = 403
      throw err
    }

    // Cek apakah sudah pernah dinilai
    const existing = await VendorEvaluation.findOne({ where: { spk_id: spkId } })
    if (existing) {
      const err = new Error('SPK ini sudah memiliki penilaian kinerja sebelumnya. Penilaian tidak dapat diduplikasi.')
      err.statusCode = 400
      throw err
    }

    const kualitas = parseInt(data.kualitas_skor, 10)
    const waktu = parseInt(data.waktu_skor, 10)
    const layanan = parseInt(data.layanan_skor, 10)
    const skorAkhir = ((kualitas + waktu + layanan) / 3).toFixed(2)

    let evaluation
    await sequelize.transaction(async (t) => {
      evaluation = await VendorEvaluation.create({
        spk_id:        spk.id,
        vendor_id:     spk.vendor_id,
        evaluator_id:  user.id,
        kualitas_skor: kualitas,
        waktu_skor:    waktu,
        layanan_skor:  layanan,
        skor_akhir:    parseFloat(skorAkhir),
        catatan:       data.catatan?.trim() || null,
      }, { transaction: t })
    })

    // Catat ke audit log forensik
    await auditLog({
      userId:     user.id,
      action:     'evaluate',
      entityType: 'vendor_evaluation',
      entityId:   evaluation.id,
      afterData:  evaluation.toJSON(),
      ipAddress:  meta.ipAddress,
      userAgent:  meta.userAgent,
    })

    return this.getBySpkId(spkId, user)
  }

  /**
   * Mengambil data evaluasi untuk satu SPK spesifik
   */
  static async getBySpkId(spkId, user) {
    const spk = await Spk.findByPk(spkId)
    if (!spk) {
      const err = new Error(`Data SPK dengan ID '${spkId}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // Jika vendor yang mengakses, pastikan SPK milik dirinya sendiri
    if (user.roles?.includes('penyedia') && !user.roles.includes('admin')) {
      const vendorProfile = await VendorProfile.findOne({ where: { user_id: user.id } })
      if (!vendorProfile || spk.vendor_id !== vendorProfile.id) {
        const err = new Error('Akses ditolak. Anda hanya dapat melihat penilaian SPK milik perusahaan Anda.')
        err.statusCode = 403
        throw err
      }
    }

    const evaluation = await VendorEvaluation.findOne({
      where: { spk_id: spkId },
      include: [
        {
          model: User,
          as: 'evaluator',
          attributes: ['id', 'name', 'employee_id', 'email'],
        },
        {
          model: VendorProfile,
          as: 'vendor',
          attributes: ['id', 'company_name', 'npwp'],
        },
      ],
    })

    return evaluation
  }

  /**
   * Mengambil rangkuman rating dan seluruh daftar evaluasi untuk suatu vendor
   */
  static async getByVendorId(vendorId, user) {
    const vendor = await VendorProfile.findByPk(vendorId)
    if (!vendor) {
      const err = new Error(`Data vendor dengan ID '${vendorId}' tidak ditemukan.`)
      err.statusCode = 404
      throw err
    }

    // Ambil seluruh evaluasi untuk vendor ini
    const evaluations = await VendorEvaluation.findAll({
      where: { vendor_id: vendorId },
      include: [
        {
          model: User,
          as: 'evaluator',
          attributes: ['id', 'name', 'employee_id'],
        },
        {
          model: Spk,
          as: 'spk',
          attributes: ['id', 'nomor_spk', 'nilai_kontrak', 'tanggal_spk'],
        },
      ],
      order: [['created_at', 'DESC']],
    })

    const count = evaluations.length
    if (count === 0) {
      return {
        vendor_id:          vendorId,
        company_name:       vendor.company_name,
        total_evaluations:  0,
        average_score:      0,
        avg_kualitas:       0,
        avg_waktu:          0,
        avg_layanan:        0,
        evaluations:        [],
      }
    }

    const sumFinal = evaluations.reduce((acc, curr) => acc + parseFloat(curr.skor_akhir), 0)
    const sumKualitas = evaluations.reduce((acc, curr) => acc + curr.kualitas_skor, 0)
    const sumWaktu = evaluations.reduce((acc, curr) => acc + curr.waktu_skor, 0)
    const sumLayanan = evaluations.reduce((acc, curr) => acc + curr.layanan_skor, 0)

    return {
      vendor_id:         vendorId,
      company_name:      vendor.company_name,
      total_evaluations: count,
      average_score:     parseFloat((sumFinal / count).toFixed(2)),
      avg_kualitas:      parseFloat((sumKualitas / count).toFixed(2)),
      avg_waktu:         parseFloat((sumWaktu / count).toFixed(2)),
      avg_layanan:       parseFloat((sumLayanan / count).toFixed(2)),
      evaluations,
    }
  }
}

module.exports = VendorEvaluationService
