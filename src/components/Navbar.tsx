import { type ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NavAuth } from './NavAuth'

type NavLink = { label: string; to: string }

export function Navbar(props: { logo: ReactNode; links: NavLink[]; variant?: 'brand' | 'light' }) {
  const variant = props.variant ?? 'brand'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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
            onClick={() => setMenuOpen((open) => !open)}
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
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div
        id="nav-mobile-menu"
        className={`navMobileMenu ${menuOpen ? 'navMobileMenuOpen' : ''}`}
        hidden={!menuOpen}
      >
        <nav className="navMobileLinks" aria-label="Mobile navigation">
          {props.links.map((l) => (
            <Link key={l.to} className="navMobileLink" to={l.to} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <NavAuth layout="menu" onNavigate={() => setMenuOpen(false)} />
      </div>
    </div>
  )
}
