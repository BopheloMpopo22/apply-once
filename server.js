/**
 * Vercel Fluid Compute entry (Express default export).
 * Local dev uses `npm run dev` → `server/index.js` + Vite separately.
 */
import 'dotenv/config'

import app from './server/app.js'

export default app
