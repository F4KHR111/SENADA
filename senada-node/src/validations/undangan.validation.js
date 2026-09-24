'use strict'

const { z } = require('zod')

const createUndanganSchema = z.object({
  body: z.object({
    hps_id: z
      .string({ required_error: 'ID HPS (hps_id) wajib disertakan' })
      .uuid('Format ID HPS tidak valid (harus UUID)'),
    nomor_undangan: z.string().trim().optional(),
    tanggal_undangan: z.string().trim().optional(),
    batas_waktu_penawaran: z
      .string({ required_error: 'Batas waktu penawaran wajib diisi' })
      .datetime({ message: 'Format batas waktu penawaran harus ISO datetime (contoh: 2026-09-10T17:00:00.000Z)' }),
    vendor_ids: z
      .array(z.string().uuid('ID Vendor tidak valid (harus UUID)'))
      .min(1, 'Minimal harus memilih 1 penyedia/vendor untuk diundang'),
  }),
})

const updateUndanganSchema = z.object({
  body: z.object({
    tanggal_undangan: z.string().trim().optional(),
    batas_waktu_penawaran: z.string().datetime().optional(),
    vendor_ids: z
      .array(z.string().uuid())
      .min(1, 'Minimal harus memilih 1 penyedia/vendor')
      .optional(),
  }),
})

const respondUndanganSchema = z.object({
  body: z.object({
    status: z.enum(['declined'], {
      errorMap: () => ({ message: "Status respon undangan yang valid: 'declined'" }),
    }),
    catatan: z.string().trim().optional().nullable(),
  }),
})

const queryUndanganSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    status: z.enum(['draft', 'sent', 'closed']).optional(),
  }),
})

module.exports = {
  createUndanganSchema,
  updateUndanganSchema,
  respondUndanganSchema,
  queryUndanganSchema,
}
