/**
 * Isolated Vercel function for school report upload.
 * Keeps pdf-parse (v1) and mammoth out of the main api/index.js bundle so profile/catalogue APIs stay up.
 */
import 'dotenv/config'
import { createRequire } from 'module'
import express from 'express'
import multer from 'multer'
import {
  importVarsityReportMarksFromBuffer,
  varsityReportMimeFromFile,
} from '../../server/varsityReportImport.js'

const require = createRequire(import.meta.url)
// Ensure @vercel/nft includes parsers used only on this route.
require('pdf-parse/lib/pdf-parse.js')
require('mammoth')

const app = express()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const name = String(file.originalname || '')
    const mt = String(file.mimetype || '').toLowerCase()
    const ok =
      mt === 'application/pdf' ||
      mt === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      /\.pdf$/i.test(name) ||
      /\.docx$/i.test(name)
    if (!ok) {
      const err = new Error('Only PDF or Word (.docx) school reports are supported')
      err.code = 'INVALID_FILE_TYPE'
      return cb(err)
    }
    cb(null, true)
  },
})

async function handleReportImport(req, res, next) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'file required (multipart field name: file)' })
    }
    const mimetype = varsityReportMimeFromFile(req.file)
    if (!mimetype) {
      return res.status(400).json({ error: 'Only PDF or Word (.docx) school reports are supported' })
    }
    const payload = await importVarsityReportMarksFromBuffer({
      buffer: req.file.buffer,
      mimetype,
    })
    res.json({
      rows: payload.rows,
      warnings: payload.warnings,
      textSample: payload.textSample,
      confidence: payload.confidence,
    })
  } catch (e) {
    next(e)
  }
}

app.post('/api/varsity/report-import', upload.single('file'), handleReportImport)
app.post('/', upload.single('file'), handleReportImport)

app.use((err, _req, res, _next) => {
  console.error('report-import', err)
  if (err && err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: err.message })
  }
  const msg = err instanceof Error ? err.message : String(err)
  res.status(500).json({ error: msg || 'Report import failed' })
})

export default app
