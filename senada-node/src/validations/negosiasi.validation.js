'use strict'

const { z } = require('zod')

const createNegosiasiSchema = z.object({
  body: z.object({
    penawaran_id: z
      .string({ required_error: 'ID Penawaran (penawaran_id) wajib disertakan' })
      .uuid('Format ID Penawaran harus UUID valid'),
    harga_usulan: z.coerce
      .number({ required_error: 'Harga usulan negosiasi wajib diisi' })
      .positive('Harga usulan negosiasi harus lebih besar dari 0'),
    catatan: z.string().trim().optional().nullable(),
  }),
})

const respondNegosiasiSchema = z.object({
  body: z.object({
    status: z.enum(['accepted', 'rejected'], {
      errorMap: () => ({ message: "Status respon negosiasi harus 'accepted' (setuju) atau 'rejected' (tidak setuju)" }),
    }),
    catatan: z.string().trim().optional().nullable(),
  }),
})

module.exports = {
  createNegosiasiSchema,
  respondNegosiasiSchema,
}
