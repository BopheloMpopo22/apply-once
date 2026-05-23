import { BURSARY_BRANDS } from '../../data/bursaryBrands'

export function BursaryLogoMarquee() {
  const loop = [...BURSARY_BRANDS, ...BURSARY_BRANDS]

  return (
    <div className="appBursaryMarquee">
      <p className="appBursaryMarqueeLabel">Bursaries you can apply for</p>
      <div className="appBursaryMarqueeViewport" aria-hidden>
        <div className="appBursaryMarqueeTrack">
          {loop.map((brand, i) => (
            <div
              key={`${brand.id}-${i}`}
              className="appBursaryTile"
              style={{ '--brand': brand.color } as React.CSSProperties}
            >
              <span className="appBursaryTileMark" aria-hidden>
                {brand.abbr}
              </span>
              <span className="appBursaryTileName">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
