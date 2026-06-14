/** Yoco payment links (hosted pay page) — temporary until Checkout API is live. */
export function getPaymentLinkR95(): string {
  return String(import.meta.env.VITE_YOCO_PAYMENT_LINK_R95 || '').trim()
}

export function getPaymentLinkR50(): string {
  return String(import.meta.env.VITE_YOCO_PAYMENT_LINK_R50 || '').trim()
}

export function isPaymentLinkMode(): boolean {
  return Boolean(getPaymentLinkR95())
}
