/** Application fee amounts (cents) — keep in sync with src/constants/payments.ts */
export const PAYMENT_ONCE_OFF_CENTS = 6000
export const PAYMENT_INSTALLMENT_CENTS = 4000
export const PAYMENT_FULLY_PAID_CENTS = 6000
export const PAYMENT_SPLIT_TOTAL_CENTS = PAYMENT_INSTALLMENT_CENTS * 2

export function paymentAmountCentsForPlan(plan) {
  return plan === 'once_off_95' ? PAYMENT_ONCE_OFF_CENTS : PAYMENT_INSTALLMENT_CENTS
}

export function paymentAmountLabelForPlan(plan) {
  return plan === 'once_off_95'
    ? `R${PAYMENT_ONCE_OFF_CENTS / 100}`
    : `R${PAYMENT_INSTALLMENT_CENTS / 100}`
}
