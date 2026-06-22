import applicationFormImg from '../assets/application-logos.png'
import floatingImage from '../assets/floating-image.png'
import varsityCalculatorImg from '../assets/Varsity-calculator.png'
import workProgramsImg from '../assets/Work programs.png'

/** Critical above-the-fold homepage images — preloaded before first paint when possible. */
export const HOME_HERO_IMAGE = floatingImage

export const HOME_PRIMARY_IMAGES = {
  application: applicationFormImg,
  varsityCalculator: varsityCalculatorImg,
  workPrograms: workProgramsImg,
} as const

const CRITICAL_HOME_IMAGES = [floatingImage, applicationFormImg, varsityCalculatorImg, workProgramsImg] as const

function injectPreloadLinks() {
  for (const href of CRITICAL_HOME_IMAGES) {
    if (document.head.querySelector(`link[rel="preload"][href="${href}"]`)) continue
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = href
    document.head.appendChild(link)
  }
}

/** Start fetching and decoding homepage images as early as the bundle loads. */
export function preloadHomeAssets() {
  injectPreloadLinks()
  for (const src of CRITICAL_HOME_IMAGES) {
    const img = new Image()
    img.decoding = 'sync'
    if ('fetchPriority' in img) {
      ;(img as HTMLImageElement & { fetchPriority: string }).fetchPriority = 'high'
    }
    img.src = src
  }
}

preloadHomeAssets()
