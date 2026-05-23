import floatingImage from '../../assets/floating-image.png'

/** Hero right side: custom floating artwork + a few glass UI cards. */
export function HomeHeroVisual() {
  return (
    <div className="homeHeroVisual" aria-hidden>
      <img className="homeHeroMainImage" src={floatingImage} alt="" />

      <div className="homeHeroFloatCard homeHeroFloatCardAps">
        <div className="homeHeroFloatLabel">Varsity calculator</div>
        <div className="homeHeroFloatAps">APS estimate</div>
        <div className="homeHeroFloatScore">32</div>
        <div className="homeHeroFloatMeta">See where you fit</div>
      </div>

      <div className="homeHeroFloatCard homeHeroFloatCardApp">
        <div className="homeHeroFloatLabel">Application</div>
        <div className="homeHeroFloatStatus">Profile ready ✓</div>
        <div className="homeHeroFloatBar">
          <span style={{ width: '78%' }} />
        </div>
        <div className="homeHeroFloatMeta">Apply once, reuse everywhere</div>
      </div>
    </div>
  )
}
