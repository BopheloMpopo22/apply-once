import floatingImage from '../../assets/floating-image.png'

export function HomeHeroVisual() {
  return (
    <div className="homeHeroVisual" aria-hidden>
      <img className="homeHeroMainImage" src={floatingImage} alt="" />
    </div>
  )
}
