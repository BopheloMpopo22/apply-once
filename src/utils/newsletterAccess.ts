/** Client token for newsletter access after name + email subscribe. */
const STORAGE_KEY = 'apply_once_newsletter_token_v1'

export function readNewsletterToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeNewsletterToken(token: string) {
  localStorage.setItem(STORAGE_KEY, token)
}

export function clearNewsletterToken() {
  localStorage.removeItem(STORAGE_KEY)
}
