import { useCallback, useEffect, useRef, useState } from 'react'
import type { PaymentPlan } from './PaymentPanel'
import { api, uploadPaymentProof } from '../api/client'
import {
  PAYMENT_INSTALLMENT_CENTS,
  PAYMENT_ONCE_OFF_CENTS,
  formatPaymentRand,
} from '../constants/payments'
import { getEftBankDetails, type EftBankDetails } from '../lib/eftPayment'

type PendingEft = {
  id: string
  plan: PaymentPlan
  amountDueCents: number
  documentId: string | null
  submittedAt: string
}

type EftPaymentSectionProps = {
  paidCents: number
  onSubmitted: () => Promise<void>
}

function amountLabelForPlan(plan: PaymentPlan): string {
  return plan === 'once_off_95'
    ? formatPaymentRand(PAYMENT_ONCE_OFF_CENTS)
    : formatPaymentRand(PAYMENT_INSTALLMENT_CENTS)
}

function defaultPlan(paidCents: number): PaymentPlan {
  if (paidCents >= PAYMENT_INSTALLMENT_CENTS) return 'split_50_second'
  return 'once_off_95'
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function BankDetailRow(props: { label: string; value: string; copyValue?: string }) {
  const [copied, setCopied] = useState(false)
  const { label, value, copyValue } = props
  if (!value) return null

  return (
    <div className="eftBankRow">
      <span className="eftBankLabel">{label}</span>
      <span className="eftBankValue">{value}</span>
      {copyValue ? (
        <button
          type="button"
          className="btn btnGhost btnSmall eftCopyBtn"
          onClick={() => {
            void copyText(copyValue).then((ok) => {
              if (ok) {
                setCopied(true)
                window.setTimeout(() => setCopied(false), 2000)
              }
            })
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      ) : null}
    </div>
  )
}

export function EftPaymentSection(props: EftPaymentSectionProps) {
  const { paidCents, onSubmitted } = props
  const bank = getEftBankDetails()
  const fileRef = useRef<HTMLInputElement>(null)

  const [reference, setReference] = useState('')
  const [pendingEft, setPendingEft] = useState<PendingEft | null>(null)
  const [plan, setPlan] = useState<PaymentPlan>(() => defaultPlan(paidCents))
  const [bankReference, setBankReference] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const refreshStatus = useCallback(async () => {
    const [refRes, status] = await Promise.all([
      api<{ reference: string }>('/api/payments/eft/reference'),
      api<{ pendingEft: PendingEft | null }>('/api/payments/status'),
    ])
    setReference(refRes.reference)
    setPendingEft(status.pendingEft)
  }, [])

  useEffect(() => {
    void refreshStatus().catch(() => {
      /* reference optional until profile loads */
    })
  }, [refreshStatus])

  useEffect(() => {
    setPlan(defaultPlan(paidCents))
  }, [paidCents])

  if (!bank) return null

  const hasFirstInstallment = paidCents >= PAYMENT_INSTALLMENT_CENTS
  const dueLabel =
    plan === 'once_off_95'
      ? `${formatPaymentRand(PAYMENT_ONCE_OFF_CENTS)}.00`
      : `${formatPaymentRand(PAYMENT_INSTALLMENT_CENTS)}.00`

  async function onSubmitProof(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) {
      setError('Choose a screenshot or PDF from your banking app.')
      return
    }
    setBusy(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await uploadPaymentProof(plan, selectedFile, bankReference)
      const msg =
        typeof res === 'object' && res !== null && 'message' in res
          ? String((res as { message: string }).message)
          : 'Proof received — we will confirm within one business day.'
      setSuccess(msg)
      setSelectedFile(null)
      setBankReference('')
      if (fileRef.current) fileRef.current.value = ''
      await refreshStatus()
      await onSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload proof')
    } finally {
      setBusy(false)
    }
  }

  if (pendingEft) {
    return (
      <div className="eftPaymentBlock">
        <p className="eftPendingOk">
          <strong>Proof received</strong> — we are confirming your{' '}
          {amountLabelForPlan(pendingEft.plan)} EFT payment. This usually takes one business day.
          You can message us on your profile if you need help.
        </p>
      </div>
    )
  }

  return (
    <div className="eftPaymentBlock">
      <p className="eftLead">
        Pay <strong>{dueLabel}</strong> by EFT, then upload your proof below — no email needed.
      </p>

      <EftBankCard bank={bank} reference={reference} dueLabel={dueLabel} />

      {!hasFirstInstallment ? (
        <div className="eftPlanPick">
          <span className="muted">Paying:</span>
          <label className="eftPlanOption">
            <input
              type="radio"
              name="eft-plan"
              checked={plan === 'once_off_95'}
              onChange={() => setPlan('once_off_95')}
            />
            {formatPaymentRand(PAYMENT_ONCE_OFF_CENTS)} once-off
          </label>
          <label className="eftPlanOption">
            <input
              type="radio"
              name="eft-plan"
              checked={plan === 'split_50_first'}
              onChange={() => setPlan('split_50_first')}
            />
            {formatPaymentRand(PAYMENT_INSTALLMENT_CENTS)} now ({formatPaymentRand(PAYMENT_INSTALLMENT_CENTS)} later)
          </label>
        </div>
      ) : null}

      <form className="eftProofForm" onSubmit={(ev) => void onSubmitProof(ev)}>
        <label className="eftField">
          <span className="eftFieldLabel">Bank reference from your app (optional)</span>
          <input
            className="input"
            value={bankReference}
            onChange={(ev) => setBankReference(ev.target.value)}
            placeholder="e.g. payment confirmation number"
            maxLength={120}
          />
        </label>

        <label className="eftField">
          <span className="eftFieldLabel">Proof of payment (screenshot or PDF)</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf,.pdf"
            onChange={(ev) => setSelectedFile(ev.target.files?.[0] ?? null)}
          />
        </label>

        {error ? <p className="payBannerError">{error}</p> : null}
        {success ? <p className="eftPendingOk">{success}</p> : null}

        <button type="submit" className="btn btnBrand btnSmall" disabled={busy}>
          {busy ? 'Uploading…' : `I've paid — submit proof`}
        </button>
      </form>
    </div>
  )
}

function EftBankCard(props: { bank: EftBankDetails; reference: string; dueLabel: string }) {
  const { bank, reference, dueLabel } = props
  const [refCopied, setRefCopied] = useState(false)

  return (
    <div className="eftBankCard">
      <BankDetailRow label="Account name" value={bank.accountName} copyValue={bank.accountName} />
      <BankDetailRow label="Bank" value={bank.bank} />
      <BankDetailRow label="Account number" value={bank.accountNumber} copyValue={bank.accountNumber} />
      {bank.branchCode ? (
        <BankDetailRow label="Branch code" value={bank.branchCode} copyValue={bank.branchCode} />
      ) : null}
      {bank.accountType ? <BankDetailRow label="Account type" value={bank.accountType} /> : null}
      <BankDetailRow label="Amount" value={dueLabel} copyValue={dueLabel.replace('.00', '')} />
      {reference ? (
        <div className="eftBankRow eftBankRowRef">
          <span className="eftBankLabel">Reference</span>
          <span className="eftBankValue eftRefValue">{reference}</span>
          <button
            type="button"
            className="btn btnGhost btnSmall eftCopyBtn"
            onClick={() => {
              void copyText(reference).then((ok) => {
                if (ok) {
                  setRefCopied(true)
                  window.setTimeout(() => setRefCopied(false), 2000)
                }
              })
            }}
          >
            {refCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
      ) : (
        <p className="muted eftRefHint">Add your surname and phone on your profile so we can match your payment.</p>
      )}
    </div>
  )
}
