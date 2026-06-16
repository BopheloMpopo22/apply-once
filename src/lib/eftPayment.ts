/** EFT bank details — public env vars shown on the payment panel. */
export type EftBankDetails = {
  accountName: string
  bank: string
  accountNumber: string
  branchCode: string
  accountType: string
}

export function getEftBankDetails(): EftBankDetails | null {
  const accountNumber = String(import.meta.env.VITE_EFT_ACCOUNT_NUMBER || '').trim()
  if (!accountNumber) return null
  return {
    accountName: String(import.meta.env.VITE_EFT_ACCOUNT_NAME || '').trim(),
    bank: String(import.meta.env.VITE_EFT_BANK || '').trim(),
    accountNumber,
    branchCode: String(import.meta.env.VITE_EFT_BRANCH_CODE || '').trim(),
    accountType: String(import.meta.env.VITE_EFT_ACCOUNT_TYPE || 'Cheque').trim(),
  }
}

export function isEftPaymentMode(): boolean {
  return Boolean(getEftBankDetails())
}
