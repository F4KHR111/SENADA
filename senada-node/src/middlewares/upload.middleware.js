'use strict'

const multer = require('multer')
const path   = require('path')
const fs     = require('fs')
const crypto = require('crypto')

// Pastikan direktori uploads ada
const uploadDir = path.resolve('uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Konfigurasi penyimpanan disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    // Generate nama file acak untuk mencegah conflict & directory traversal (AGENTS.md §6.5)
    const randomName = crypto.randomBytes(16).toString('hex')
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${randomName}${ext}`)
  },
})

// Filter jenis file (PDF, JPG, PNG, DOCX, XLSX)
const fileFilter = (_req, file, cb) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx']
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedExtensions.includes(ext)) {
    cb(null, true)
  } else {
    const error = new Error(`Tipe file ${ext} tidak diizinkan. Format yang didukung: ${allowedExtensions.join(', ')}`)
    error.statusCode = 400
    cb(error, false)
  }
}

// Batas ukuran file: 10 MB per file
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
})

module.exports = upload
