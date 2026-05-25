import { Link } from 'react-router-dom'

export type HomeHubCardProps = {
  title: string
  description: string
  image: string
  imageAlt: string
  href: string
  accent?: 'blue' | 'green'
  status?: 'live' | 'coming-soon'
}

export function HomeHubCard({
  title,
  description,
  image,
  imageAlt,
  href,
  accent = 'blue',
  status = 'coming-soon',
}: HomeHubCardProps) {
  const accentClass = accent === 'green' ? 'homeHubCardGreen' : 'homeHubCardBlue'

  return (
    <Link className={`homeHubCard ${accentClass}`} to={href}>
      <div className="homeHubCardMedia">
        <img className="homeHubCardImg" src={image} alt={imageAlt} loading="lazy" decoding="async" />
        <div className="homeHubCardMediaFade" aria-hidden />
        {status === 'coming-soon' ? (
          <span className="homeHubCardBadge homeHubCardBadgeSoon">Coming soon</span>
        ) : null}
      </div>
      <div className="homeHubCardBody">
        <h3 className="homeHubCardTitle">{title}</h3>
        <p className="homeHubCardText">{description}</p>
        <span className="homeHubCardCta">Open hub →</span>
      </div>
    </Link>
  )
}
