declare global {
  interface Window {
    YocoSDK?: new (opts: { publicKey: string }) => {
      showPopup: (opts: {
        amountInCents: number
        currency: string
        name: string
        description?: string
        callback: (result: { error?: { message?: string }; id?: string }) => void
      }) => void
    }
  }
}

export function loadYocoSdk(): Promise<void> {
  if (window.YocoSDK) return Promise.resolve()
  const existing = document.querySelector('script[data-yoco-sdk="v1"]') as HTMLScriptElement | null
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Could not load Yoco SDK')))
    })
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'
    s.async = true
    s.dataset.yocoSdk = 'v1'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Could not load Yoco SDK'))
    document.head.appendChild(s)
  })
}

export function getYocoPublicKey(): string {
  const k = String(import.meta.env.VITE_YOCO_PUBLIC_KEY || '').trim()
  return k
}

