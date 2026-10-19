import { useId } from 'react'

interface Props {
  label: string
  value: string
  error?: string | undefined
  onChange: (value: string) => void
}

export default function Field({ label, value, error, onChange }: Props) {
  const errorId = useId()
  return (
    <label className="f">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        step="any"
        inputMode="decimal"
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span id={errorId} className="field-error">{error}</span>}
    </label>
  )
}
