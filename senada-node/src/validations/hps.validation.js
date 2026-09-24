'use strict'

const { z } = require('zod')

// Schema satu item HPS
const hpsItemSchema = z.object({
  nama_barang: z
    .string({ required_error: 'Nama barang/jasa wajib diisi' })
    .trim()
    .min(2, 'Nama barang minimal 2 karakter')
    .max(255, 'Nama barang maksimal 255 karakter'),
  spesifikasi: z.string().trim().optional().nullable(),
  satuan: z
    .string({ required_error: 'Satuan wajib diisi (misal: Unit, Paket, Rim)' })
    .trim()
    .min(1, 'Satuan tidak boleh kosong')
    .max(50, 'Satuan maksimal 50 karakter'),
  volume: z.coerce
    .number({ required_error: 'Volume wajib diisi' })
    .positive('Volume harus lebih besar dari 0'),
  harga_satuan: z.coerce
    .number({ required_error: 'Harga satuan wajib diisi' })
    .nonnegative('Harga satuan tidak boleh negatif'),
  urutan: z.coerce.number().int().optional().default(0),
})

// Helper untuk parse `items` jika dikirim via multipart/form-data sebagai JSON string
const parseItemsField = z.preprocess((val) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val)
    } catch {
      return val
    }
  }
  return val
}, z.array(hpsItemSchema).min(1, 'Minimal harus menyertakan 1 rincian barang/jasa pada HPS'))

const createHpsSchema = z.object({
  body: z.object({
    nomor_hps: z.string().trim().optional(), // Jika tidak diisi, dibuat otomatis oleh service
    nama_paket: z
      .string({ required_error: 'Nama paket pengadaan wajib diisi' })
      .trim()
      .min(3, 'Nama paket minimal 3 karakter')
      .max(255, 'Nama paket maksimal 255 karakter'),
    deskripsi: z.string().trim().optional().nullable(),
    fiscal_year: z.coerce
      .number({ required_error: 'Tahun anggaran wajib diisi' })
      .int()
      .min(2020, 'Tahun anggaran minimal 2020')
      .max(2099, 'Tahun anggaran maksimal 2099'),
    items: parseItemsField,
  }),
})

const updateHpsSchema = z.object({
  body: z.object({
    nama_paket: z
      .string()
      .trim()
      .min(3, 'Nama paket minimal 3 karakter')
      .max(255, 'Nama paket maksimal 255 karakter')
      .optional(),
    deskripsi: z.string().trim().optional().nullable(),
    fiscal_year: z.coerce
      .number()
      .int()
      .min(2020)
      .max(2099)
      .optional(),
    items: z.preprocess((val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val)
        } catch {
          return val
        }
      }
      return val
    }, z.array(hpsItemSchema).min(1, 'Minimal harus menyertakan 1 rincian barang/jasa pada HPS').optional()),
  }),
})

const verifyHpsSchema = z.object({
  body: z.object({
    status: z
      .enum(['verified', 'fixed'], {
        errorMap: () => ({ message: "Status verifikasi harus 'verified' atau 'fixed'" }),
      })
      .default('verified'),
    catatan: z.string().trim().optional().nullable(),
  }),
})

const queryHpsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    status: z.enum(['draft', 'verified', 'fixed']).optional(),
    fiscal_year: z.coerce.number().int().optional(),
  }),
})

module.exports = {
  createHpsSchema,
  updateHpsSchema,
  verifyHpsSchema,
  queryHpsSchema,
}
