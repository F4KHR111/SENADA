'use strict'
const { z } = require('zod')

const registerVendorSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Nama penanggung jawab wajib diisi' })
      .trim()
      .min(2, 'Nama minimal 2 karakter')
      .max(100, 'Nama maksimal 100 karakter'),
    email: z
      .string({ required_error: 'Email wajib diisi' })
      .trim()
      .email('Format email tidak valid')
      .max(100, 'Email maksimal 100 karakter'),
    password: z
      .string({ required_error: 'Password wajib diisi' })
      .min(8, 'Password minimal 8 karakter')
      .max(100, 'Password maksimal 100 karakter'),
    company_name: z
      .string({ required_error: 'Nama perusahaan wajib diisi' })
      .trim()
      .min(2, 'Nama perusahaan minimal 2 karakter')
      .max(150, 'Nama perusahaan maksimal 150 karakter'),
    npwp: z
      .string({ required_error: 'NPWP perusahaan wajib diisi' })
      .trim()
      .min(15, 'NPWP minimal 15 karakter')
      .max(30, 'NPWP maksimal 30 karakter'),
    address: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    phone: z.string().trim().optional().nullable(),
    bank_name: z.string().trim().optional().nullable(),
    bank_account_number: z.string().trim().optional().nullable(),
    bank_account_holder: z.string().trim().optional().nullable(),
  }),
})

const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email wajib diisi' })
      .trim()
      .email('Format email tidak valid'),
    password: z
      .string({ required_error: 'Password wajib diisi' })
      .min(1, 'Password tidak boleh kosong'),
  }),
})

const refreshTokenSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
})

module.exports = {
  registerVendorSchema,
  loginSchema,
  refreshTokenSchema,
}
