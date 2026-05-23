import { Link } from 'react-router-dom'

export type HomePrimaryCardProps = {
  title: string
  description: string
  image: string
  imageAlt: string
  href: string
  hoverTheme: 'blue' | 'orange'
}

export function HomePrimaryCard({ title, description, image, imageAlt, href, hoverTheme }: HomePrimaryCardProps) {
  const themeClass = hoverTheme === 'orange' ? 'homePrimaryCardOrange' : 'homePrimaryCardBlue'

  return (
    <Link className={`homePrimaryCard ${themeClass}`} to={href}>
      <div className="homePrimaryCardArt">
        <img className="homePrimaryCardImg" src={image} alt={imageAlt} loading="lazy" decoding="async" />
      </div>
      <div className="homePrimaryCardBody">
        <h3 className="homePrimaryCardTitle">{title}</h3>
        <p className="homePrimaryCardText">{description}</p>
      </div>
    </Link>
  )
}
