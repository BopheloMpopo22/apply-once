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
  selected: boolean
  onSelect: () => void
}

export function HomeSelectCard({
  title,
  description,
  image,
  imageAlt,
  href,
  accent = 'blue',
  size = 'secondary',
  selected,
  onSelect,
}: HomeSelectCardProps) {
  const sizeClass = size === 'primary' ? 'homeCardPrimary' : 'homeCardSecondary'
  const accentClass = accent === 'green' ? 'homeCardAccentGreen' : 'homeCardAccentBlue'

  return (
    <article
      className={[
        'homeSelectCard',
        sizeClass,
        accentClass,
        selected ? 'homeSelectCardSelected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button type="button" className="homeSelectCardHit" onClick={onSelect} aria-pressed={selected}>
        <div className="homeSelectCardMedia">
          <img className="homeSelectCardImg" src={image} alt={imageAlt} loading="lazy" decoding="async" />
          <div className="homeSelectCardMediaFade" aria-hidden />
        </div>
        <div className="homeSelectCardBody">
          <h3 className="homeSelectCardTitle">{title}</h3>
          <p className="homeSelectCardText">{description}</p>
        </div>
      </button>
      <div className={`homeSelectCardFooter${selected ? ' homeSelectCardFooterVisible' : ''}`}>
        <Link className="homeSelectCardOpen" to={href} onClick={(e) => e.stopPropagation()}>
          Open
        </Link>
        {!selected ? <span className="homeSelectCardHint">Tap to select</span> : null}
      </div>
    </article>
  )
}
