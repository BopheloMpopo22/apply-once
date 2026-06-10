export type ApplicationNavMode = 'horizontal' | 'vertical'

type Props = {
  onChoose: (mode: ApplicationNavMode) => void
  disabled?: boolean
}

export function ApplicationNavModePicker({ onChoose, disabled }: Props) {
  const isMobile =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches

  return (
    <div className="appNavModePicker" role="group" aria-label="Choose how to complete your application">
      <p className="appNavModeLead">How would you like to work through your application?</p>
      {isMobile ? (
        <p className="appNavModeMobileHint">On a phone, scroll mode is usually easiest — you can see every section.</p>
      ) : null}
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
          <strong>
            Scroll down
            {isMobile ? <span className="appNavModeBadge">Recommended on phone</span> : null}
          </strong>
          <span>See your previous answers while you complete the rest.</span>
        </button>
      </div>
    </div>
  )
}
