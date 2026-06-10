import logoSrc from '../assets/Logo.png'

type ApplyOnceLogoProps = {
  className?: string
  size?: 'nav' | 'hero'
}

export function ApplyOnceLogo({ className, size = 'nav' }: ApplyOnceLogoProps) {
  const dimension = size === 'hero' ? 80 : 52

  return (
    <img
      src={logoSrc}
      alt="Apply Once"
      className={['logoMarkImage', size === 'hero' ? 'logoMarkImageHero' : '', className]
        .filter(Boolean)
        .join(' ')}
      width={dimension}
      height={dimension}
      decoding="async"
    />
  )
}
