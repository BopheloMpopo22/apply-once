import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll to top on route change (e.g. home → varsity calculator). */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    const t = window.setTimeout(() => window.scrollTo(0, 0), 0)
    return () => window.clearTimeout(t)
  }, [pathname])

  return null
}
