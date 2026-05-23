type Props = {
  stepIndex: number
  isLast: boolean
  saveBusy: boolean
  onBack?: () => void
  onContinue: () => void
}

export function ApplicationStepActions({ stepIndex, isLast, saveBusy, onBack, onContinue }: Props) {
  return (
    <div className="appStepActions">
      {stepIndex > 0 && onBack ? (
        <button type="button" className="btn btnOutline appBtn" onClick={onBack} disabled={saveBusy}>
          Back
        </button>
      ) : (
        <span />
      )}
      <button type="button" className="btn appBtnPrimary appBtn" onClick={onContinue} disabled={saveBusy}>
        {saveBusy ? 'Saving…' : isLast ? 'Finish & save' : 'Save & continue'}
      </button>
    </div>
  )
}
