/** Decorative floating UI cards for the homepage hero (CSS animation only). */
export function HomeHeroVisual() {
  return (
    <div className="homeHeroVisual" aria-hidden>
      <div className="homeHeroFloatCard homeHeroFloatCardAps">
        <div className="homeHeroFloatLabel">Varsity calculator</div>
        <div className="homeHeroFloatAps">APS estimate</div>
        <div className="homeHeroFloatScore">32</div>
        <div className="homeHeroFloatMeta">Wits · Engineering</div>
      </div>

      <div className="homeHeroFloatCard homeHeroFloatCardApp">
        <div className="homeHeroFloatLabel">Application</div>
        <div className="homeHeroFloatStatus">Profile ready ✓</div>
        <div className="homeHeroFloatBar">
          <span style={{ width: '78%' }} />
        </div>
        <div className="homeHeroFloatMeta">Reuse for every bursary</div>
      </div>

      <div className="homeHeroFloatCard homeHeroFloatCardBursary">
        <div className="homeHeroFloatLabel">Match</div>
        <div className="homeHeroFloatStatus homeHeroFloatStatusGreen">Bursary fit</div>
        <div className="homeHeroFloatMeta">3 new opportunities</div>
      </div>

      <div className="homeHeroLogoChip homeHeroLogoChip1">
        <img src="/assets/universities/wits.svg" alt="" />
      </div>
      <div className="homeHeroLogoChip homeHeroLogoChip2">
        <img src="/assets/universities/uct.svg" alt="" />
      </div>
      <div className="homeHeroLogoChip homeHeroLogoChip3">
        <img src="/assets/universities/up.svg" alt="" />
      </div>
    </div>
  )
}
