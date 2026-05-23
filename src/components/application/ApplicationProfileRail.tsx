import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBearerToken } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

type Props = {
  firstName?: string | null
  lastName?: string | null
  completionPercent?: number
}

export function ApplicationProfileRail({ firstName, lastName, completionPercent }: Props) {
  const { user } = useAuth()
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

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

  const displayName = useMemo(() => {
    const f = (firstName ?? user?.firstName)?.trim()
    const l = (lastName ?? user?.lastName)?.trim()
    if (f || l) return [f, l].filter(Boolean).join(' ')
    return user?.email?.split('@')[0] ?? 'Your profile'
  }, [firstName, lastName, user?.firstName, user?.lastName, user?.email])

  const initials = useMemo(() => {
    const f = (firstName ?? user?.firstName)?.trim()?.[0]
    const l = (lastName ?? user?.lastName)?.trim()?.[0]
    if (f || l) return `${f ?? ''}${l ?? ''}`.toUpperCase()
    const e = user?.email?.trim()?.[0]
    return e ? e.toUpperCase() : '?'
  }, [firstName, lastName, user?.firstName, user?.lastName, user?.email])

  if (!user) return null

  return (
    <aside className="appProfileRail" aria-label="Profile quick access">
      <Link className="appProfileRailCard" to="/profile" title="Open your profile">
        {blobUrl ? (
          <img className="appProfileRailAvatarImg" src={blobUrl} alt="" />
        ) : (
          <span className="appProfileRailAvatar appProfileRailAvatarInitials" aria-hidden>
            {initials}
          </span>
        )}
        <span className="appProfileRailName">{displayName}</span>
        {typeof completionPercent === 'number' ? (
          <span className="appProfileRailMeta">{completionPercent}% application complete</span>
        ) : null}
        <span className="appProfileRailAction">Open profile</span>
      </Link>
    </aside>
  )
}
