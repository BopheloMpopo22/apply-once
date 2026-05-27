import { Link } from 'react-router-dom'

export type HomeSelectCardProps = {
  id: string
  title: string
  description: string
  image: string
  imageAlt: string
  href: string
  accent?: 'blue' | 'green'
  size?: 'primary' | 'secondary'
}

export function HomeSelectCard({
  title,
  description,
  image,
  imageAlt,
  href,
  accent = 'blue',
  size = 'secondary',
}: HomeSelectCardProps) {
  const sizeClass = size === 'primary' ? 'homeCardPrimary' : 'homeCardSecondary'
  const accentClass = accent === 'green' ? 'homeCardAccentGreen' : 'homeCardAccentBlue'

  return (
    <Link
      className={[
        'homeSelectCard',
        sizeClass,
        accentClass,
      ]
        .filter(Boolean)
        .join(' ')}
      to={href}
    >
      <div className="homeSelectCardMedia">
        <img className="homeSelectCardImg" src={image} alt={imageAlt} loading="lazy" decoding="async" />
        <div className="homeSelectCardMediaFade" aria-hidden />
      </div>
      <div className="homeSelectCardBody">
        <h3 className="homeSelectCardTitle">{title}</h3>
        <p className="homeSelectCardText">{description}</p>
      </div>
      <div className="homeSelectCardFooter homeSelectCardFooterVisible">
        <span className="homeSelectCardOpen">Open</span>
      </div>
    </Link>
  )
}
