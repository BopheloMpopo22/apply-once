/** Application fee amounts (cents). */
export const PAYMENT_ONCE_OFF_CENTS = 6000
export const PAYMENT_INSTALLMENT_CENTS = 4000
/** Student is fully paid when total paid reaches the once-off fee (covers R60 once-off or R40+R40). */
export const PAYMENT_FULLY_PAID_CENTS = 6000
export const PAYMENT_SPLIT_TOTAL_CENTS = PAYMENT_INSTALLMENT_CENTS * 2

export function formatPaymentRand(cents: number): string {
  return `R${(cents / 100).toFixed(0)}`
}
