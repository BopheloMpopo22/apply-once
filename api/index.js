/**
 * Vercel serverless entry for all `/api/*` traffic (see vercel.json rewrite).
 */
import 'dotenv/config'

import app from '../server/app.js'

export default app
