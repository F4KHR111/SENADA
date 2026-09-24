'use strict'

const { z } = require('zod')

const penawaranItemSchema = z.object({
  hps_item_id: z
    .string({ required_error: 'ID item HPS (hps_item_id) wajib diisi' })
    .uuid('Format ID item HPS harus UUID valid'),
  harga_satuan: z.coerce
    .number({ required_error: 'Harga satuan penawaran wajib diisi' })
    .nonnegative('Harga satuan penawaran tidak boleh bernilai negatif'),
})

// Helper untuk parse `items` jika dikirim via form-data
const parsePenawaranItems = z.preprocess((val) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val)
    } catch {
      return val
    }
  }
  return val
}, z.array(penawaranItemSchema).min(1, 'Minimal harus menyertakan 1 rincian harga item penawaran'))

const createPenawaranSchema = z.object({
  body: z.object({
    undangan_id: z
      .string({ required_error: 'ID Undangan (undangan_id) wajib disertakan' })
      .uuid('Format ID Undangan harus UUID valid'),
    items: parsePenawaranItems,
  }),
})

const updatePenawaranSchema = z.object({
  body: z.object({
    items: parsePenawaranItems.optional(),
  }),
})

const queryPenawaranSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    undangan_id: z.string().uuid().optional(),
    status: z.enum(['submitted', 'negotiating', 'approved', 'rejected']).optional(),
  }),
})

module.exports = {
  createPenawaranSchema,
  updatePenawaranSchema,
  queryPenawaranSchema,
}
