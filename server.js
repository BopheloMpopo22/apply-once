/**
 * Vercel Express entry — routed via vercel.json (`/api/*` → `/server`).
 * Local dev: use `npm run dev` → `server/index.js` + Vite.
 */
import 'dotenv/config'

import app from './server/app.js'

export default app
