import { Link } from 'react-router-dom'
import { ApplyOnceLogo } from '../ApplyOnceLogo'
import { Navbar } from '../Navbar'
import type { HubMeta } from '../../types/hubs'

export function HubShell(props: {
  hub: HubMeta
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  const { hub } = props
  return (
    <div className="formShell hubShell">
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/resources' },
        ]}
      />
      <main className="hubMain">
        <div className="hubContainer hubContainerWide">
          <div className="hubPanel">
          <nav className="hubBreadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden>/</span>
            <Link to="/#features">Explore</Link>
            <span aria-hidden>/</span>
            <span>{hub.shortTitle}</span>
          </nav>

          <header className="hubHero">
            <div className="hubHeroText">
              <p className="hubHeroKicker">Student info hub</p>
              <h1 className="hubHeroTitle">{hub.title}</h1>
              <p className="hubHeroIntro">{hub.intro}</p>
              <p className="hubDisclaimer">{hub.disclaimer}</p>
              {props.actions ? <div className="hubHeroActions">{props.actions}</div> : null}
            </div>
            <div className="hubHeroMedia">
              <img className="hubHeroImg" src={hub.image} alt="" loading="eager" decoding="async" />
            </div>
          </header>

          {props.children}
          </div>
        </div>
      </main>
    </div>
  )
}
