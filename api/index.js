/**
 * Vercel serverless entry for all `/api/*` traffic (see vercel.json rewrite).
 *
 * Side-effect imports below ensure @vercel/nft bundles runtime deps used by ../server/app.js.
 * Without these, the function can deploy with server/ present but no node_modules (ERR_MODULE_NOT_FOUND).
 */
import 'dotenv/config'
import 'express'
import 'cors'
import 'bcryptjs'
import 'jsonwebtoken'
import 'multer'
import '@supabase/supabase-js'
import 'pdfkit'
import '@prisma/client'

import app from '../server/app.js'

export default app
