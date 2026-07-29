import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NavAuth } from './NavAuth'

type NavLink = { label: string; to: string }

export function Navbar(props: { logo: ReactNode; links: NavLink[]; variant?: 'brand' | 'light' }) {
  const variant = props.variant ?? 'brand'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuHistoryPushed = useRef(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    document.body.classList.toggle('navMenuOpen', menuOpen)
    return () => document.body.classList.remove('navMenuOpen')
  }, [menuOpen])

  /** Close via backdrop / X — pop the menu history entry. */
  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    if (menuHistoryPushed.current) {
      menuHistoryPushed.current = false
      history.back()
    }
  }, [])

  /**
   * Close when following a Link. Do NOT call history.back() — that undoes the
   * navigation and is why Profile / Application / Home appeared broken on mobile.
   */
  const closeMenuForNav = useCallback(() => {
    setMenuOpen(false)
    if (menuHistoryPushed.current) {
      menuHistoryPushed.current = false
      if (history.state && typeof history.state === 'object' && 'navMenu' in history.state) {
        history.replaceState(null, '')
      }
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    history.pushState({ navMenu: true }, '')
    menuHistoryPushed.current = true

    const onPopState = () => {
      menuHistoryPushed.current = false
      setMenuOpen(false)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [menuOpen])

  const shellClass = [
    'navShell',
    variant === 'light' ? 'navShellLight' : '',
    scrolled ? 'navShellScrolled' : '',
    menuOpen ? 'navShellMenuOpen' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClass}>
      <div className="container nav">
        <div className="navLeft">
          <Link className="navBrand" to="/" aria-label="Apply Once home">
            {props.logo}
            <span className="navBrandText">Apply Once</span>
          </Link>

          <nav className="navLinks" aria-label="Primary navigation">
            {props.links.map((l) => (
              <Link key={l.to} className="navLink" to={l.to}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="navRight">
          <div className="navAuthInline">
            <NavAuth />
          </div>
          <button
            type="button"
            className="navMenuBtn"
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
          >
            <span className="navMenuIcon" aria-hidden="true" />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <button
          type="button"
          className="navMobileBackdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      ) : null}

      <div
        id="nav-mobile-menu"
        className={`navMobileMenu ${menuOpen ? 'navMobileMenuOpen' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="navMobileMenuHeader">
          <Link className="navMobileHome" to="/" onClick={closeMenuForNav}>
            {props.logo}
            <span>Apply Once</span>
          </Link>
          <button type="button" className="navMobileClose" aria-label="Close menu" onClick={closeMenu}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav className="navMobileLinks" aria-label="Mobile navigation">
          <Link className="navMobileLink" to="/" onClick={closeMenuForNav}>
            Home
          </Link>
          {props.links.map((l) => (
            <Link key={l.to} className="navMobileLink" to={l.to} onClick={closeMenuForNav}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="navMobileDivider" aria-hidden="true" />

        <NavAuth layout="menu" onNavigate={closeMenuForNav} />
      </div>
    </div>
  )
}
