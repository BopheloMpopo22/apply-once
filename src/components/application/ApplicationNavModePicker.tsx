import { useEffect, useState } from 'react'

export type ApplicationNavMode = 'horizontal' | 'vertical'

type Props = {
  onChoose: (mode: ApplicationNavMode) => void
  disabled?: boolean
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isMobile
}

export function ApplicationNavModePicker({ onChoose, disabled }: Props) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="appNavModePicker appNavModePickerMobile" role="group" aria-label="Choose how to complete your application">
        <p className="appNavModeLead">Ready to fill in your application?</p>
        <p className="appNavModeMobileHint">
          On a phone, scroll mode works best — every section stays on screen and you can move down at your own pace.
        </p>
        <button
          type="button"
          className="btn btnBrand appNavModeMobileStart"
          disabled={disabled}
          onClick={() => onChoose('vertical')}
        >
          Start application ↓
        </button>
      </div>
    )
  }

  return (
    <div className="appNavModePicker" role="group" aria-label="Choose how to complete your application">
      <p className="appNavModeLead">How would you like to work through your application?</p>
      <div className="appNavModeOptions">
        <button
          type="button"
          className="appNavModeCard"
          disabled={disabled}
          onClick={() => onChoose('horizontal')}
        >
          <span className="appNavModeIcon" aria-hidden>
            →
          </span>
          <strong>Page by page</strong>
          <span>Move left and right — one section at a time, like slides.</span>
        </button>
        <button
          type="button"
          className="appNavModeCard appNavModeCardRecommended"
          disabled={disabled}
          onClick={() => onChoose('vertical')}
        >
          <span className="appNavModeIcon" aria-hidden>
            ↓
          </span>
          <strong>Scroll down</strong>
          <span>See your previous answers while you complete the rest.</span>
        </button>
      </div>
    </div>
  )
}
