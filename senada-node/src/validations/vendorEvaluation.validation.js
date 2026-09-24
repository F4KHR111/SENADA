'use strict'

const { z } = require('zod')

const scoreSchema = z.coerce
  .number({ required_error: 'Skor wajib diisi' })
  .int('Skor harus berupa bilangan bulat')
  .min(1, 'Skor minimal bernilai 1')
  .max(5, 'Skor maksimal bernilai 5')

const createEvaluationSchema = z.object({
  params: z.object({
    spkId: z.string().uuid('Format ID SPK harus UUID valid'),
  }),
  body: z.object({
    kualitas_skor: scoreSchema,
    waktu_skor:    scoreSchema,
    layanan_skor:  scoreSchema,
    catatan:       z.string().trim().max(1000, 'Catatan maksimal 1000 karakter').optional().nullable(),
  }),
})

const getBySpkSchema = z.object({
  params: z.object({
    spkId: z.string().uuid('Format ID SPK harus UUID valid'),
  }),
})

const getByVendorSchema = z.object({
  params: z.object({
    vendorId: z.string().uuid('Format ID Vendor harus UUID valid'),
  }),
})

module.exports = {
  createEvaluationSchema,
  getBySpkSchema,
  getByVendorSchema,
}
