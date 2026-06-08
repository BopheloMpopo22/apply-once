/** Set after successful registration so we show “Login” instead of “Register” when logged out. */
export const HAS_ACCOUNT_STORAGE_KEY = 'apply_once_has_account'

export function markHasAccount() {
  try {
    localStorage.setItem(HAS_ACCOUNT_STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function readHasAccountFlag() {
  try {
    return localStorage.getItem(HAS_ACCOUNT_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}
