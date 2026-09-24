'use strict'

const { z } = require('zod')

// Regex untuk format tanggal ISO 8601 (YYYY-MM-DD)
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
const dateField = z
  .string()
  .trim()
  .regex(isoDateRegex, 'Format tanggal harus YYYY-MM-DD')
  .optional()

const createLaporanRealisasiSchema = z.object({
  body: z.object({
    spk_id: z
      .string({ required_error: 'ID SPK (spk_id) wajib disertakan' })
      .uuid('Format ID SPK harus UUID valid'),
    nilai_realisasi: z.coerce
      .number({ required_error: 'Nilai realisasi wajib diisi' })
      .positive('Nilai realisasi harus lebih besar dari 0'),
    tanggal_realisasi: dateField,
    keterangan: z.string().trim().optional().nullable(),
    status: z.enum(['draft', 'submitted']).default('draft'),
  }),
})

const updateLaporanRealisasiSchema = z.object({
  body: z.object({
    nilai_realisasi: z.coerce.number().positive().optional(),
    tanggal_realisasi: dateField,
    keterangan: z.string().trim().optional().nullable(),
    status: z.enum(['draft', 'submitted']).optional(),
  }),
})

const createSpmReferenceSchema = z.object({
  body: z.object({
    spk_id: z
      .string({ required_error: 'ID SPK (spk_id) wajib disertakan' })
      .uuid('Format ID SPK harus UUID valid'),
    nomor_spm: z
      .string({ required_error: 'Nomor SPM dari aplikasi SAKTI wajib diisi' })
      .trim()
      .min(3, 'Nomor SPM minimal 3 karakter'),
    tanggal_spm: dateField,
    status: z.enum(['pending', 'processed']).default('pending'),
  }),
})

const updateSpmReferenceSchema = z.object({
  body: z.object({
    nomor_spm: z.string().trim().min(3).optional(),
    tanggal_spm: dateField,
    status: z.enum(['pending', 'processed']).optional(),
  }),
})

const queryLaporanSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    spk_id: z.string().uuid().optional(),
    status: z.string().trim().optional(),
  }),
})

module.exports = {
  createLaporanRealisasiSchema,
  updateLaporanRealisasiSchema,
  createSpmReferenceSchema,
  updateSpmReferenceSchema,
  queryLaporanSchema,
}
