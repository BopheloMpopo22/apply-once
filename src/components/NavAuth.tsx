import { Link } from 'react-router-dom'
import { readHasAccountFlag } from '../constants'
import { useAuth } from '../context/AuthContext'
import { ProfileNavAvatar } from './ProfileNavAvatar'

export function NavAuth() {
  const { user, loading, isAdmin, logout } = useAuth()
  const hasAccountFlag = readHasAccountFlag()

  return (
    <div className="navAuth">
      <ProfileNavAvatar />
      {!user ? (
        <>
          <Link className="btn btnPrimary btnSmall" to={hasAccountFlag ? '/login' : '/register'}>
            {hasAccountFlag ? 'Login' : 'Register'}
          </Link>
          {loading ? <span className="navMuted">Restoring session…</span> : null}
        </>
      ) : (
        <>
          {isAdmin ? (
            <Link className="btn btnOutline btnSmall" to="/admin">
              Admin dashboard
            </Link>
          ) : null}
          <Link className="btn btnGhost btnSmall" to="/profile">
            Profile
          </Link>
          <Link className="btn btnGhost btnSmall" to="/application">
            Application
          </Link>
          <button type="button" className="btn btnPrimary btnSmall" onClick={() => logout()}>
            Sign out
          </button>
        </>
      )}
    </div>
  )
}
