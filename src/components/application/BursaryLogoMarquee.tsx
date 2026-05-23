import { useState } from 'react'
import { BURSARY_BRANDS, type BursaryBrand } from '../../data/bursaryBrands'

function BursaryTile({ brand }: { brand: BursaryBrand }) {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <div className="appBursaryTile">
      <div className="appBursaryTileMark" style={{ '--brand': brand.color } as React.CSSProperties}>
        {!logoFailed ? (
          <img
            src={brand.logo}
            alt=""
            className="appBursaryTileLogo"
            loading="lazy"
            decoding="async"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className="appBursaryTileAbbr" aria-hidden>
            {brand.abbr}
          </span>
        )}
      </div>
      <span className="appBursaryTileName">{brand.name}</span>
    </div>
  )
}

export function BursaryLogoMarquee() {
  const loop = [...BURSARY_BRANDS, ...BURSARY_BRANDS]

  return (
    <div className="appBursaryMarquee">
      <p className="appBursaryMarqueeLabel">Bursaries you can apply for</p>
      <div className="appBursaryMarqueeViewport" aria-label="Supported bursary and funding partners">
        <div className="appBursaryMarqueeTrack">
          {loop.map((brand, i) => (
            <BursaryTile key={`${brand.id}-${i}`} brand={brand} />
          ))}
        </div>
      </div>
    </div>
  )
}
