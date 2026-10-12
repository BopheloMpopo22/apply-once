/**
 * Automated student chat + email when milestones happen:
 * - Application form complete but not paid → pay reminder
 * - First installment paid → thank you + remaining R40
 * - Fully paid (R60) → thank you + what happens next
 *
 * Each milestone uses a unique inbox `kind` so we only send once.
 */

import {
  PAYMENT_FULLY_PAID_CENTS,
  PAYMENT_INSTALLMENT_CENTS,
} from './paymentAmounts.js'

export const KIND_APP_COMPLETE_PAY = 'auto_app_complete_pay'
export const KIND_PAYMENT_PARTIAL = 'auto_payment_partial'
export const KIND_PAYMENT_FULL = 'auto_payment_full'

function trim(v) {
  return String(v || '').trim()
}

/** Mirror of src/utils/applicationCompletion.ts — keep in sync. */
export function computeApplicationCompletion(profile, payload) {
  const p = profile || {}
  const academics = payload?.academics || {}
  const studyPlan = payload?.studyPlan || {}
  const household = payload?.household || {}
  const financial = payload?.financial || {}
  const compliance = payload?.compliance || {}

  const requiredChecks = [
    { label: 'First name', ok: Boolean(trim(p.firstName)) },
    { label: 'Last name', ok: Boolean(trim(p.lastName)) },
    { label: 'Cell phone', ok: Boolean(trim(p.phone)) },
    { label: 'Date of birth', ok: Boolean(trim(p.dateOfBirth)) },
    { label: 'SA ID number', ok: Boolean(trim(p.idNumber)) },
    { label: 'Residential address', ok: Boolean(trim(p.residentialAddress)) },
    { label: 'School name', ok: Boolean(trim(academics.schoolName)) },
    { label: 'Grade / year', ok: Boolean(trim(academics.grade)) },
    { label: 'Intended field(s)', ok: Boolean(trim(academics.intendedFieldsNotes)) },
    { label: 'Subjects & marks', ok: Boolean(trim(academics.subjectsNotes)) },
    { label: 'Motivation', ok: Boolean(trim(studyPlan.motivation)) },
    { label: 'Career goals', ok: Boolean(trim(studyPlan.careerGoals)) },
    { label: 'Guardian name', ok: Boolean(trim(household.guardianName)) },
    { label: 'Guardian relationship', ok: Boolean(trim(household.relationship)) },
    { label: 'Guardian phone', ok: Boolean(trim(household.guardianPhone)) },
    { label: 'Household income band', ok: Boolean(trim(financial.incomeBand)) },
    { label: 'POPIA consent', ok: Boolean(compliance.consentPopia) },
    { label: 'Truthful declaration', ok: Boolean(compliance.declarationTruthful) },
  ]

  const missing = requiredChecks.filter((c) => !c.ok).map((c) => c.label)
  const total = requiredChecks.length
  const percent = total === 0 ? 0 : Math.round(((total - missing.length) / total) * 100)
  return { percent, missing }
}

function parsePayload(raw) {
  if (!raw) return {}
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function alreadySent(prisma, userId, kind) {
  const existing = await prisma.profileInboxItem.findFirst({
    where: { userId, kind },
    select: { id: true },
  })
  return Boolean(existing)
}

async function deliverMilestone(prisma, sendResendEmail, { userId, kind, title, body, emailSubject }) {
  if (await alreadySent(prisma, userId, kind)) return { sent: false, reason: 'already_sent' }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, profile: { select: { firstName: true } } },
  })
  if (!user?.email) return { sent: false, reason: 'no_user' }

  await prisma.profileInboxItem.create({
    data: {
      userId,
      title,
      body,
      kind,
      requiresResponse: false,
    },
  })

  await prisma.chatMessage.create({
    data: {
      userId,
      sender: 'admin',
      body: `${title}\n\n${body}`,
    },
  })

  let emailSent = false
  let emailError = null
  try {
    if (typeof sendResendEmail === 'function') {
      const first = trim(user.profile?.firstName) || 'there'
      await sendResendEmail(user.email, emailSubject, `Hi ${first},\n\n${body}\n\n— Apply Once`)
      emailSent = true
    }
  } catch (e) {
    emailError = e instanceof Error ? e.message : 'email failed'
    console.error('lifecycle email failed:', kind, userId, emailError)
  }

  return { sent: true, emailSent, emailError }
}

/**
 * After application/profile save: if form is 100% and not fully paid, nudge once.
 */
export async function maybeNotifyApplicationCompleteAwaitingPayment(prisma, sendResendEmail, userId) {
  try {
    const [profile, draft, paidRows] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.applicationDraft.findUnique({ where: { userId } }),
      prisma.payment.findMany({
        where: { userId, status: 'paid' },
        select: { amountPaidCents: true },
      }),
    ])

    const payload = parsePayload(draft?.payload)
    const { percent } = computeApplicationCompletion(profile, payload)
    const onLastStep = (draft?.stepIndex ?? 0) >= 7
    // 100% fields, or already on step 8 of 8 (pilots who finished the wizard)
    if (percent < 100 && !onLastStep) return { sent: false, reason: 'incomplete' }

    const paidCents = paidRows.reduce((s, r) => s + (r.amountPaidCents || 0), 0)
    if (paidCents >= PAYMENT_FULLY_PAID_CENTS) return { sent: false, reason: 'already_paid' }

    const body = [
      'Well done — your Apply Once application form is complete.',
      '',
      'For us to start matching and applying to bursaries for you, please pay the once-off processing fee:',
      '',
      '• R60 once-off, or',
      '• R40 now and R40 later (two payments)',
      '',
      'Open your Profile → Payment section to pay by card or EFT.',
      '',
      'Until payment is confirmed, we cannot submit applications for you. If you already paid and are waiting for EFT confirmation, hang tight — we will message you when it clears.',
      '',
      'Questions? Reply in this chat.',
    ].join('\n')

    return await deliverMilestone(prisma, sendResendEmail, {
      userId,
      kind: KIND_APP_COMPLETE_PAY,
      title: 'Application complete — next step: payment',
      body,
      emailSubject: 'Apply Once: application complete — please pay R60 (or R40 + R40)',
    })
  } catch (e) {
    console.error('maybeNotifyApplicationCompleteAwaitingPayment:', e)
    return { sent: false, reason: 'error' }
  }
}

/**
 * After a successful payment (Yoco or admin confirm): thank-you for partial or full.
 */
export async function maybeNotifyPaymentMilestone(prisma, sendResendEmail, userId) {
  try {
    const paidRows = await prisma.payment.findMany({
      where: { userId, status: 'paid' },
      select: { amountPaidCents: true },
    })
    const paidCents = paidRows.reduce((s, r) => s + (r.amountPaidCents || 0), 0)

    if (paidCents >= PAYMENT_FULLY_PAID_CENTS) {
      const body = [
        'Thank you — your Apply Once fee is paid in full.',
        '',
        'What happens next:',
        '1. We review your application pack and documents.',
        '2. We match you to open bursaries that fit your profile.',
        '3. We start applying on your behalf and update you in this chat when something needs your attention (extra essay, missing document, interview invite).',
        '',
        'You do not need to message us “what’s next” — you are in the queue. Keep your phone and email active, and check your Profile chat for updates.',
        '',
        'Well done for finishing this step.',
      ].join('\n')

      return await deliverMilestone(prisma, sendResendEmail, {
        userId,
        kind: KIND_PAYMENT_FULL,
        title: 'Payment received — we are on it',
        body,
        emailSubject: 'Apply Once: payment received — what happens next',
      })
    }

    if (paidCents >= PAYMENT_INSTALLMENT_CENTS) {
      const remaining = Math.max(0, PAYMENT_FULLY_PAID_CENTS - paidCents)
      const body = [
        'Thank you — we received your first payment (R40).',
        '',
        `To unlock full processing, please pay the remaining R${remaining / 100} when you can (also under Profile → Payment).`,
        '',
        'Once the full R60 is paid, we will start matching and applying for you. Until then your form is saved safely.',
        '',
        'Reply in this chat if you need help with EFT or card payment.',
      ].join('\n')

      return await deliverMilestone(prisma, sendResendEmail, {
        userId,
        kind: KIND_PAYMENT_PARTIAL,
        title: 'First payment received — R40 remaining',
        body,
        emailSubject: 'Apply Once: first R40 received — one more payment to go',
      })
    }

    return { sent: false, reason: 'below_threshold' }
  } catch (e) {
    console.error('maybeNotifyPaymentMilestone:', e)
    return { sent: false, reason: 'error' }
  }
}

/**
 * One-time / admin backfill for existing pilots.
 * Eligible for pay reminder: form 100% OR already on last step (8 of 8), and not fully paid.
 * Payment messages: based on totals already paid.
 */
export async function backfillLifecycleMessages(prisma, sendResendEmail) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      profile: true,
      application: { select: { payload: true, stepIndex: true } },
      payments: { where: { status: 'paid' }, select: { amountPaidCents: true } },
    },
  })

  const summary = {
    scanned: users.length,
    appCompletePay: 0,
    paymentPartial: 0,
    paymentFull: 0,
    skipped: 0,
    errors: [],
  }

  for (const user of users) {
    try {
      const payload = parsePayload(user.application?.payload)
      const { percent } = computeApplicationCompletion(user.profile, payload)
      const onLastStep = (user.application?.stepIndex ?? 0) >= 7
      const paidCents = (user.payments || []).reduce((s, r) => s + (r.amountPaidCents || 0), 0)

      let didSomething = false

      if ((percent >= 100 || onLastStep) && paidCents < PAYMENT_FULLY_PAID_CENTS) {
        const r = await maybeNotifyApplicationCompleteAwaitingPayment(prisma, sendResendEmail, user.id)
        if (r.sent) {
          summary.appCompletePay += 1
          didSomething = true
        }
      }

      if (paidCents >= PAYMENT_INSTALLMENT_CENTS) {
        const r = await maybeNotifyPaymentMilestone(prisma, sendResendEmail, user.id)
        if (r.sent) {
          if (paidCents >= PAYMENT_FULLY_PAID_CENTS) summary.paymentFull += 1
          else summary.paymentPartial += 1
          didSomething = true
        }
      }

      if (!didSomething) summary.skipped += 1
    } catch (e) {
      summary.errors.push(`${user.email}: ${e instanceof Error ? e.message : 'failed'}`)
    }
  }

  return summary
}
