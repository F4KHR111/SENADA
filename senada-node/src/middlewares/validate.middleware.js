'use strict'

/**
 * validateMiddleware — validasi request body/query/params dengan Zod schema.
 *
 * @param {import('zod').ZodSchema} schema — Zod schema untuk { body, query, params }
 */
function validateMiddleware(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body:   req.body,
      query:  req.query,
      params: req.params,
    })

    if (!result.success) {
      const issues = result.error.issues || result.error.errors || []
      const errors = issues.map((e) => ({
        field:   e.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.') || e.path.join('.'),
        message: e.message,
      }))

      return res.status(422).json({
        success: false,
        message: 'Validasi input gagal.',
        errors,
      })
    }

    // Override req dengan data yang sudah divalidasi & disanitasi oleh Zod secara aman (tanpa menimpa getter)
    if (result.data.body !== undefined) {
      req.body = result.data.body
    }
    if (result.data.query !== undefined && typeof req.query === 'object' && req.query !== null) {
      try {
        req.query = result.data.query
      } catch {
        // Pada Node/Express tertentu req.query hanya memiliki getter, modifikasi in-place:
        Object.keys(req.query).forEach((key) => delete req.query[key])
        Object.assign(req.query, result.data.query)
      }
    }
    if (result.data.params !== undefined && typeof req.params === 'object' && req.params !== null) {
      try {
        req.params = result.data.params
      } catch {
        Object.assign(req.params, result.data.params)
      }
    }

    next()
  }
}

module.exports = validateMiddleware
