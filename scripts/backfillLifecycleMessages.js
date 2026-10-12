/**
 * One-off: send automated “what’s next” chat/email to pilots who already finished.
 * Prefer the Admin button after deploy: “Send what’s next to finished students”.
 *
 *   node scripts/backfillLifecycleMessages.js
 */
import { PrismaClient } from '@prisma/client'
import { backfillLifecycleMessages } from '../server/studentLifecycleMessages.js'

const prisma = new PrismaClient()
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim()
const EMAIL_FROM = String(process.env.EMAIL_FROM || 'Apply Once <onboarding@resend.dev>').trim()

async function sendResendEmail(to, subject, body) {
  if (!RESEND_API_KEY) return
  const htmlBody = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
  const mailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      text: body,
      html: `<div style="font-family:system-ui,sans-serif;line-height:1.55">${htmlBody}</div>`,
    }),
  })
  if (!mailRes.ok) {
    const t = await mailRes.text()
    throw new Error(t || 'email failed')
  }
}

async function main() {
  const summary = await backfillLifecycleMessages(prisma, RESEND_API_KEY ? sendResendEmail : null)
  console.log(summary)
  if (!RESEND_API_KEY) console.log('Note: RESEND_API_KEY missing — chat/inbox only.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
