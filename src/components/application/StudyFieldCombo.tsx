import { useId, useMemo, useState } from 'react'
import { STUDY_FIELD_OPTIONS } from '../../data/questionnaireQuestions'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/** Slug from option list, or raw custom text the student typed. */
export function StudyFieldCombo(props: Props) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')

  const displayValue = useMemo(() => {
    const opt = STUDY_FIELD_OPTIONS.find((o) => o.value === props.value)
    if (opt) return opt.label
    return props.value
  }, [props.value])

  const filter = (draft || displayValue).trim().toLowerCase()
  const suggestions = STUDY_FIELD_OPTIONS.filter(
    (o) => !filter || o.label.toLowerCase().includes(filter) || o.value.includes(filter),
  )

  function pick(slug: string, label: string) {
    props.onChange(slug)
    setDraft(label)
    setOpen(false)
  }

  function commitCustom(text: string) {
    const t = text.trim()
    if (!t) return
    const exact = STUDY_FIELD_OPTIONS.find((o) => o.label.toLowerCase() === t.toLowerCase())
    if (exact) {
      pick(exact.value, exact.label)
      return
    }
    props.onChange(t)
    setDraft(t)
    setOpen(false)
  }

  return (
    <div className="studyFieldCombo">
      <label className="studyFieldComboLabel" htmlFor={listId}>
        {props.label}
      </label>
      <div className="studyFieldComboWrap">
        <input
          id={listId}
          type="text"
          className="studyFieldComboInput"
          value={open ? draft : displayValue}
          placeholder={props.placeholder ?? 'Type or pick from list…'}
          autoComplete="off"
          onFocus={() => {
            setOpen(true)
            setDraft(displayValue === props.value && !STUDY_FIELD_OPTIONS.some((o) => o.value === props.value) ? props.value : displayValue)
          }}
          onChange={(e) => {
            setDraft(e.target.value)
            setOpen(true)
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setOpen(false)
              if (draft.trim()) commitCustom(draft)
            }, 150)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitCustom(draft)
            }
          }}
        />
        {open && suggestions.length > 0 ? (
          <ul className="studyFieldComboList" role="listbox">
            {suggestions.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  className="studyFieldComboOption"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(o.value, o.label)}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
