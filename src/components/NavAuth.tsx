import { Link } from 'react-router-dom'
import { readHasAccountFlag } from '../constants'
import { useAuth } from '../context/AuthContext'
import { ProfileNavAvatar } from './ProfileNavAvatar'

type NavAuthProps = {
  layout?: 'inline' | 'menu'
  onNavigate?: () => void
}

export function NavAuth({ layout = 'inline', onNavigate }: NavAuthProps) {
  const { user, loading, isAdmin, logout } = useAuth()
  const hasAccountFlag = readHasAccountFlag()

  const shellClass = layout === 'menu' ? 'navAuth navAuthMenu' : 'navAuth'

  async function onLogout() {
    onNavigate?.()
    await logout()
  }

  return (
    <div className={shellClass}>
      {layout === 'inline' ? <ProfileNavAvatar /> : null}
      {!user ? (
        <>
          <Link
            className="btn btnPrimary btnSmall"
            to={hasAccountFlag ? '/login' : '/register'}
            onClick={onNavigate}
          >
            {hasAccountFlag ? 'Login' : 'Register'}
          </Link>
          {loading ? <span className="navMuted">Restoring session…</span> : null}
        </>
      ) : layout === 'menu' ? (
        <>
          <Link className="navMobileLink navMobileLinkStrong" to="/profile" onClick={onNavigate}>
            My profile
          </Link>
          <Link className="navMobileLink navMobileLinkStrong" to="/application" onClick={onNavigate}>
            Application form
          </Link>
          {isAdmin ? (
            <Link className="navMobileLink" to="/admin" onClick={onNavigate}>
              Admin dashboard
            </Link>
          ) : null}
          <button type="button" className="navMobileLink navMobileSignOut" onClick={() => void onLogout()}>
            Sign out
          </button>
        </>
      ) : (
        <>
          {isAdmin ? (
            <Link className="btn btnOutline btnSmall navAuthDesktopOnly" to="/admin">
              Admin dashboard
            </Link>
          ) : null}
          <Link className="btn btnGhost btnSmall navAuthDesktopOnly" to="/profile">
            Profile
          </Link>
          <Link className="btn btnGhost btnSmall navAuthDesktopOnly" to="/application">
            Application
          </Link>
          <button type="button" className="btn btnPrimary btnSmall navAuthDesktopOnly" onClick={() => logout()}>
            Sign out
          </button>
        </>
      )}
    </div>
  )
}
