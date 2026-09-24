'use strict'

const { z } = require('zod')

// Regex sederhana untuk validasi format tanggal ISO 8601 (YYYY-MM-DD)
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/

const completeSerahTerimaSchema = z.object({
  body: z.object({
    tanggal_serah_terima: z
      .string()
      .trim()
      .regex(isoDateRegex, 'Format tanggal serah terima harus YYYY-MM-DD')
      .optional(),
    catatan: z.string().trim().optional().nullable(),
  }),
})

const querySerahTerimaSchema = z.object({
  query: z.object({
    page:   z.coerce.number().int().positive().default(1),
    limit:  z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(['pending', 'completed']).optional(),
    spk_id: z.string().uuid().optional(),
  }),
})

module.exports = {
  completeSerahTerimaSchema,
  querySerahTerimaSchema,
}

