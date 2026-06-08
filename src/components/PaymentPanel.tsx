import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { getYocoPublicKey, loadYocoSdk } from '../lib/yoco'

export type PaymentPlan = 'once_off_95' | 'split_50_first' | 'split_50_second'

type PaymentPanelProps = {
  /** Inline card on profile, or sticky footer on the application page. */
  variant: 'inline' | 'sticky'
  paidCents: number
  onRefreshPayment: () => Promise<void>
  title?: string
  /** Where the user came from — passed to the success page for navigation. */
  successFrom?: 'profile' | 'application'
}

export function PaymentPanel(props: PaymentPanelProps) {
  const {
    variant,
    paidCents,
    onRefreshPayment,
    title = 'Activate your application',
    successFrom = 'profile',
  } = props

  const navigate = useNavigate()
  const [payBusy, setPayBusy] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [popupOpen, setPopupOpen] = useState(false)

  if (paidCents >= 9500) return null
  if (popupOpen) return null

  const hasFirstInstallment = paidCents >= 5000
  const showOnceOff = !hasFirstInstallment
  const showFirstSplit = !hasFirstInstallment
  const showSecondSplit = hasFirstInstallment

  async function startYocoPayment(plan: PaymentPlan) {
    const publicKey = getYocoPublicKey()
    if (!publicKey) {
      setPayError('Payments are not configured yet. Please try again later.')
      return
    }
    setPayBusy(true)
    setPayError(null)
    setPopupOpen(true)
    try {
      await loadYocoSdk()
      const YocoSDK = window.YocoSDK
      if (!YocoSDK) throw new Error('Could not load payment form')
      const yoco = new YocoSDK({ publicKey })
      const amountInCents = plan === 'once_off_95' ? 9500 : 5000

      await new Promise<void>((resolve, reject) => {
        yoco.showPopup({
          amountInCents,
          currency: 'ZAR',
          name: plan === 'once_off_95' ? 'Apply Once application fee' : 'Apply Once application installment',
          description: plan === 'once_off_95' ? 'Once-off fee (R95)' : 'Installment (R50)',
          callback: async (result) => {
            if (result?.error) return reject(new Error(result.error.message || 'Payment cancelled'))
            const token = String(result?.id || '').trim()
            if (!token) return reject(new Error('Payment failed (no token)'))
            try {
              setPayBusy(true)
              await api('/api/payments/yoco/charge', { method: 'POST', json: { token, plan } })
              const status = await api<{ totalPaidCents: number }>('/api/payments/status')
              await onRefreshPayment()
              if (Number(status.totalPaidCents) >= 9500) {
                navigate('/payment/success', { replace: true, state: { from: successFrom } })
              }
              resolve()
            } catch (e) {
              reject(e instanceof Error ? e : new Error('Payment failed'))
            } finally {
              setPayBusy(false)
            }
          },
        })
        setPayBusy(false)
      })
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Payment failed')
    } finally {
      setPopupOpen(false)
      setPayBusy(false)
    }
  }

  const shellClass = variant === 'sticky' ? 'payBanner' : 'payPanel'

  return (
    <div className={shellClass} style={variant === 'inline' ? { marginBottom: 16 } : undefined}>
      <div className="payBannerInner">
        <div className="payBannerText">
          <strong>{title}</strong>
          <span className="muted">
            {hasFirstInstallment
              ? 'Almost there — pay the remaining R50 to fully activate your application.'
              : 'Pay anytime: R95 once-off, or R50 now and R50 later.'}
          </span>
          <span className="muted">Paid so far: R{(paidCents / 100).toFixed(2)}</span>
          {payError ? <span className="payBannerError">{payError}</span> : null}
        </div>
        <div className="payBannerActions">
          {showOnceOff ? (
            <button
              type="button"
              className="btn btnBrand btnSmall"
              disabled={payBusy}
              onClick={() => void startYocoPayment('once_off_95')}
            >
              {payBusy ? 'Opening…' : 'Pay R95'}
            </button>
          ) : null}
          {showFirstSplit ? (
            <button
              type="button"
              className="btn btnOutline btnSmall"
              disabled={payBusy}
              onClick={() => void startYocoPayment('split_50_first')}
            >
              Pay R50 now
            </button>
          ) : null}
          {showSecondSplit ? (
            <button
              type="button"
              className="btn btnOutline btnSmall"
              disabled={payBusy}
              onClick={() => void startYocoPayment('split_50_second')}
            >
              {payBusy ? 'Opening…' : 'Pay remaining R50'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
