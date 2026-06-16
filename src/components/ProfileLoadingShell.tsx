import { ApplyOnceLogo } from './ApplyOnceLogo'
import { Navbar } from './Navbar'
import type { CachedSessionUser } from '../lib/meCache'

type ProfileLoadingShellProps = {
  user?: CachedSessionUser | null
}

export function ProfileLoadingShell(props: ProfileLoadingShellProps) {
  const { user } = props
  const firstName = user?.firstName?.trim()
  const greeting = firstName ? `Hi, ${firstName}` : user?.email ? `Hi there` : null

  return (
    <div className="formShell profileShell">
      <Navbar
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/#resources' },
        ]}
      />
      <main className="formMain profileMain">
        <div className="profileHubCard">
          <header className="profileHubHero">
            <div className="profileHeroAvatarWrap">
              <div className="profileHeroAvatar profileSkeletonAvatar" aria-hidden="true" />
            </div>
            <div className="profileHeroText">
              <p className="profileHeroKicker">Your student hub</p>
              {greeting ? (
                <h1 className="formTitle profileHeroTitle">{greeting}</h1>
              ) : (
                <div className="profileSkeletonLine profileSkeletonTitle" aria-hidden="true" />
              )}
              {user?.email ? (
                <p className="formLead profileHeroEmail">{user.email}</p>
              ) : (
                <div className="profileSkeletonLine profileSkeletonEmail" aria-hidden="true" />
              )}
              <p className="profileHeroHelp">Setting up your profile…</p>
            </div>
          </header>

          <div className="profileSkeletonCard" aria-hidden="true">
            <div className="profileSkeletonLine profileSkeletonCardTitle" />
            <div className="profileSkeletonLine" />
            <div className="profileSkeletonLine profileSkeletonShort" />
          </div>

          <div className="profileHubGrid">
            <div className="profilePanel profileSkeletonPanel" aria-hidden="true">
              <div className="profileSkeletonLine profileSkeletonCardTitle" />
              <div className="profileSkeletonRing" />
              <div className="profileSkeletonLine" />
              <div className="profileSkeletonLine profileSkeletonShort" />
            </div>
            <div className="profilePanel profileSkeletonPanel" aria-hidden="true">
              <div className="profileSkeletonLine profileSkeletonCardTitle" />
              <div className="profileSkeletonLine" />
              <div className="profileSkeletonLine profileSkeletonShort" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
