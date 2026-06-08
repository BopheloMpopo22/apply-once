import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBearerToken } from '../api/client'
import { readHasAccountFlag } from '../constants'
import { useAuth } from '../context/AuthContext'

export function ProfileNavAvatar() {
  const { user } = useAuth()
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  const hasAccountFlag = readHasAccountFlag()
  const loggedOutHref = hasAccountFlag ? '/login' : '/register'
  const loggedOutLabel = hasAccountFlag
    ? 'Login — open your saved profile'
    : 'Register — create your profile'

  useEffect(() => {
    let revoked: string | null = null
    let cancelled = false
    async function loadPhoto() {
      if (!user?.hasAvatar) {
        setBlobUrl(null)
        return
      }
      const token = await getBearerToken()
      if (!token) return
      const res = await fetch('/api/profile/avatar', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok || cancelled) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      revoked = url
      setBlobUrl(url)
    }
    loadPhoto()
    return () => {
      cancelled = true
      if (revoked) URL.revokeObjectURL(revoked)
    }
  }, [user?.hasAvatar, user?.id])

  const initials = useMemo(() => {
    const f = user?.firstName?.trim()?.[0]
    const l = user?.lastName?.trim()?.[0]
    if (f || l) return `${f ?? ''}${l ?? ''}`.toUpperCase()
    const e = user?.email?.trim()?.[0]
    return e ? e.toUpperCase() : '?'
  }, [user?.firstName, user?.lastName, user?.email])

  if (!user) {
    return (
      <Link
        className="navProfileAvatarLink"
        to={loggedOutHref}
        title={loggedOutLabel}
        aria-label={loggedOutLabel}
      >
        <span className="navProfileAvatar navProfileAvatarMuted" aria-hidden="true" />
      </Link>
    )
  }

  return (
    <Link className="navProfileAvatarLink" to="/profile" title="Your profile" aria-label="Your profile">
      {blobUrl ? (
        <img className="navProfileAvatarImg" src={blobUrl} alt="" />
      ) : (
        <span className="navProfileAvatar navProfileAvatarInitials">{initials}</span>
      )}
    </Link>
  )
}
