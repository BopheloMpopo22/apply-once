import { HOME_HERO_IMAGE } from '../../utils/preloadHomeAssets'

export function HomeHeroVisual() {
  return (
    <div className="homeHeroVisual" aria-hidden>
      <img
        className="homeHeroMainImage"
        src={HOME_HERO_IMAGE}
        alt=""
        width={1536}
        height={1024}
        loading="eager"
        decoding="sync"
        fetchPriority="high"
      />
    </div>
  )
}
