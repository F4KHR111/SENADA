'use strict'

const { z } = require('zod')

// Regex untuk format tanggal ISO 8601 (YYYY-MM-DD)
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
const dateField = z
  .string()
  .trim()
  .regex(isoDateRegex, 'Format tanggal harus YYYY-MM-DD')
  .optional()

const createSpkSchema = z.object({
  body: z.object({
    negosiasi_id: z
      .string({ required_error: 'ID Negosiasi (negosiasi_id) wajib disertakan' })
      .uuid('Format ID Negosiasi harus UUID valid'),
    nomor_spk:       z.string().trim().optional(),
    tanggal_spk:     dateField,
    tanggal_mulai:   dateField,
    tanggal_selesai: dateField,
  }),
})

const updateSpkSchema = z.object({
  body: z.object({
    tanggal_spk:     dateField,
    tanggal_mulai:   dateField,
    tanggal_selesai: dateField,
  }),
})

const querySpkSchema = z.object({
  query: z.object({
    page:   z.coerce.number().int().positive().default(1),
    limit:  z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    status: z.enum(['draft', 'signed', 'active', 'completed', 'cancelled']).optional(),
  }),
})

module.exports = {
  createSpkSchema,
  updateSpkSchema,
  querySpkSchema,
}

