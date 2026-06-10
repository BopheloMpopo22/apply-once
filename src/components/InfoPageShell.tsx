import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ApplyOnceLogo } from './ApplyOnceLogo'
import { Navbar } from './Navbar'
import { SiteFooter } from './SiteFooter'
import { SITE_NAME } from '../constants/site'

export function InfoPageShell(props: { title: string; children: ReactNode }) {
  return (
    <div className="formShell infoPageShell">
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/#resources' },
        ]}
      />
      <main className="infoPageMain">
        <div className="infoPageCard">
          <nav className="infoPageBreadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden>/</span>
            <span>{props.title}</span>
          </nav>
          <h1 className="infoPageTitle">{props.title}</h1>
          <div className="infoPageBody">{props.children}</div>
        </div>
      </main>
      <SiteFooter
        brand={{
          name: SITE_NAME,
          description: 'Apply once, then match and apply smarter.',
        }}
      />
    </div>
  )
}
