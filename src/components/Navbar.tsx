import { type ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { NavAuth } from './NavAuth'

type NavLink = { label: string; to: string }

export function Navbar(props: { logo: ReactNode; links: NavLink[]; variant?: 'brand' | 'light' }) {
  const variant = props.variant ?? 'brand'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const shellClass = [
    'navShell',
    variant === 'light' ? 'navShellLight' : '',
    scrolled ? 'navShellScrolled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClass}>
      <div className="container nav">
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

        <NavAuth />
      </div>
    </div>
  )
}
