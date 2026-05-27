export type HomeSelectCardProps = {
  id: string
  title: string
  description: string
  image: string
  imageAlt: string
  expanded: boolean
  onToggle: () => void
  ctaLabel?: string
  ctaHref?: string
  accent?: 'blue' | 'green'
  size?: 'primary' | 'secondary'
  children?: React.ReactNode
}

export function HomeSelectCard({
  title,
  description,
  image,
  imageAlt,
  expanded,
  onToggle,
  ctaLabel,
  ctaHref,
  accent = 'blue',
  size = 'secondary',
  children,
}: HomeSelectCardProps) {
  const sizeClass = size === 'primary' ? 'homeCardPrimary' : 'homeCardSecondary'
  const accentClass = accent === 'green' ? 'homeCardAccentGreen' : 'homeCardAccentBlue'

  return (
    <article
      className={[
        'homeSelectCard',
        sizeClass,
        accentClass,
        expanded ? 'homeSelectCardExpanded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="homeSelectCardHit"
        onClick={onToggle}
        aria-expanded={expanded}
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
        <span className="homeSelectCardOpen">{expanded ? 'Close' : 'Open'}</span>
      </div>
      </button>

      {expanded ? (
        <div className="homeSelectCardContent">
          {children}
          {ctaHref ? (
            <a className="homeSelectCardCta" href={ctaHref}>
              {ctaLabel ?? 'Open tool →'}
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
