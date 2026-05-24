import type { HubResourceLink } from '../../types/hubs'

const KIND_LABELS: Record<NonNullable<HubResourceLink['kind']>, string> = {
  official: 'Official',
  register: 'Register',
  prep: 'Prep',
  'past-paper': 'Past papers',
  centres: 'Centres',
  guide: 'Guide',
}

export function HubResourceLinks(props: {
  links: HubResourceLink[]
  title?: string
}) {
  const { links, title = 'Useful links' } = props

  if (links.length === 0) return null

  return (
    <div className="hubResourceBlock">
      <h3 className="hubResourceTitle">{title}</h3>
      <ul className="hubResourceList">
        {links.map((link) => (
          <li key={link.url + link.label}>
            <a href={link.url} target="_blank" rel="noreferrer" className="hubResourceLink">
              {link.label}
              {link.kind ? (
                <span className={`hubResourceKind hubResourceKind--${link.kind}`}>
                  {KIND_LABELS[link.kind]}
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
