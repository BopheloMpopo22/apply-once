import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { getPaymentLinkR50, getPaymentLinkR95, isPaymentLinkMode } from '../lib/paymentLinks'
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
  const [linkOpened, setLinkOpened] = useState(false)

  const linkMode = isPaymentLinkMode()
  const linkR95 = getPaymentLinkR95()
  const linkR50 = getPaymentLinkR50() || linkR95

  if (paidCents >= 9500) return null

  const hasFirstInstallment = paidCents >= 5000
  const showOnceOff = !hasFirstInstallment
  const showFirstSplit = !hasFirstInstallment && Boolean(linkR50)
  const showSecondSplit = hasFirstInstallment

  function openPaymentLink(url: string) {
    if (!url) {
      setPayError('Payment link is not configured yet.')
      return
    }
    setPayError(null)
    setLinkOpened(true)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function startYocoPayment(plan: PaymentPlan) {
    const publicKey = getYocoPublicKey()
    if (!publicKey) {
      setPayError('Payments are not configured yet. Please try again later.')
      return
    }
    setPayBusy(true)
    setPayError(null)
    setPopupOpen(true)

    let callbackFired = false
    let focusListener: (() => void) | null = null
    let focusTimer = 0

    const showPanelAgain = () => setPopupOpen(false)

    const armFocusFallback = () => {
      focusTimer = window.setTimeout(() => {
        const onFocus = () => {
          window.setTimeout(() => {
            if (!callbackFired) showPanelAgain()
          }, 300)
        }
        window.addEventListener('focus', onFocus, { once: true })
        focusListener = () => window.removeEventListener('focus', onFocus)
      }, 700)
    }

    const disarmFocusFallback = () => {
      window.clearTimeout(focusTimer)
      focusListener?.()
      focusListener = null
    }

    armFocusFallback()

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
          callback: (result) => {
            callbackFired = true
            disarmFocusFallback()
            showPanelAgain()

            if (result?.error) {
              reject(new Error(result.error.message || 'Payment cancelled'))
              return
            }
            const token = String(result?.id || '').trim()
            if (!token) {
              reject(new Error('Payment cancelled'))
              return
            }

            setPayBusy(true)
            void (async () => {
              try {
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
            })()
          },
        })
        setPayBusy(false)
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Payment failed'
      if (msg !== 'Payment cancelled') setPayError(msg)
    } finally {
      callbackFired = true
      disarmFocusFallback()
      showPanelAgain()
      setPayBusy(false)
    }
  }

  const shellClass =
    variant === 'sticky' ? 'payBanner' : popupOpen ? 'payPanel payPanelHidden' : 'payPanel'

  return (
    <div className={shellClass} style={variant === 'inline' ? { marginBottom: 16 } : undefined}>
      <div className="payBannerInner">
        <div className="payBannerText">
          <strong>{title}</strong>
          <span className="muted">
            {linkMode
              ? hasFirstInstallment
                ? 'Pay the remaining R50 on our secure Yoco page to fully activate.'
                : 'Pay on Yoco’s secure page — card, Apple Pay, and more.'
              : hasFirstInstallment
                ? 'Almost there — pay the remaining R50 to fully activate your application.'
                : 'Pay anytime: R95 once-off, or R50 now and R50 later.'}
          </span>
          <span className="muted">Paid so far: R{(paidCents / 100).toFixed(2)}</span>
          {linkMode ? (
            <p className="payLinkSteps">
              <strong>How it works:</strong> tap Pay → complete payment on Yoco → return here. We
              confirm your payment in admin (usually within one business day).
            </p>
          ) : null}
          {linkOpened && linkMode ? (
            <p className="payLinkAfterOpen muted">
              Payment page opened in a new tab. If it did not open, check your pop-up blocker.
            </p>
          ) : null}
          {payError ? <span className="payBannerError">{payError}</span> : null}
        </div>
        <div className="payBannerActions">
          {linkMode ? (
            <>
              {showOnceOff ? (
                <button
                  type="button"
                  className="btn btnBrand btnSmall"
                  onClick={() => openPaymentLink(linkR95)}
                >
                  Pay R95 securely
                </button>
              ) : null}
              {showFirstSplit ? (
                <button
                  type="button"
                  className="btn btnOutline btnSmall"
                  onClick={() => openPaymentLink(linkR50)}
                >
                  Pay R50 now
                </button>
              ) : null}
              {showSecondSplit ? (
                <button
                  type="button"
                  className="btn btnOutline btnSmall"
                  onClick={() => openPaymentLink(linkR50)}
                >
                  Pay remaining R50
                </button>
              ) : null}
            </>
          ) : (
            <>
              {showOnceOff ? (
                <button
                  type="button"
                  className="btn btnBrand btnSmall"
                  disabled={payBusy || popupOpen}
                  onClick={() => void startYocoPayment('once_off_95')}
                >
                  {payBusy ? 'Opening…' : 'Pay R95'}
                </button>
              ) : null}
              {showFirstSplit ? (
                <button
                  type="button"
                  className="btn btnOutline btnSmall"
                  disabled={payBusy || popupOpen}
                  onClick={() => void startYocoPayment('split_50_first')}
                >
                  Pay R50 now
                </button>
              ) : null}
              {showSecondSplit ? (
                <button
                  type="button"
                  className="btn btnOutline btnSmall"
                  disabled={payBusy || popupOpen}
                  onClick={() => void startYocoPayment('split_50_second')}
                >
                  {payBusy ? 'Opening…' : 'Pay remaining R50'}
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
