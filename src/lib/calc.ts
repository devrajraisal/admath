import { FIELD_KEYS, FIELD_LABELS, type FieldKey, type Metrics, type Scenario } from '../types'

const MAX_VALUE = 1e15

export interface ParsedField {
  value: number
  /** Set when the text is not a usable number. The value is then 0. */
  error: string | null
  /** True only when something valid was typed. An empty box is "not entered", which is not the same as 0. */
  entered: boolean
}

/** An empty box is not entered, and no error. Anything else must be a number from 0 up. */
export function parseField(text: string): ParsedField {
  const trimmed = text.trim()
  if (trimmed === '') return { value: 0, error: null, entered: false }
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return { value: 0, error: 'Enter a number.', entered: false }
  if (value < 0) return { value: 0, error: 'Use a number of 0 or more.', entered: false }
  if (value > MAX_VALUE) return { value: 0, error: 'This number is too large.', entered: false }
  return { value, error: null, entered: true }
}

// A result is only shown when every number it needs was entered and is valid.
// Otherwise a missing spend would make CPC look like 0, as if the clicks were free.
const divide = (a: number | null, b: number | null): number | null =>
  a === null || b === null || b <= 0 ? null : a / b
const times = (value: number | null, factor: number): number | null => (value === null ? null : value * factor)

export function calculate(scenario: Scenario): Metrics {
  const n = (key: FieldKey): number | null => {
    const field = parseField(scenario[key])
    return field.entered ? field.value : null
  }
  const spend = n('spend')
  const impressions = n('impressions')
  const clicks = n('clicks')
  const conversions = n('conversions')
  const revenue = n('revenue')
  return {
    ctr: times(divide(clicks, impressions), 100),
    cpc: divide(spend, clicks),
    cpm: times(divide(spend, impressions), 1000),
    cvr: times(divide(conversions, clicks), 100),
    cpa: divide(spend, conversions),
    roas: divide(revenue, spend),
    roi: times(divide(revenue === null || spend === null ? null : revenue - spend, spend), 100),
  }
}

/** Per field problems, keyed by field. */
export function fieldErrors(scenario: Scenario): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {}
  for (const key of FIELD_KEYS) {
    const { error } = parseField(scenario[key])
    if (error) errors[key] = `${FIELD_LABELS[key]}: ${error}`
  }
  return errors
}

/** Checks that compare two fields. They only run when both numbers are valid. */
export function consistencyWarnings(scenario: Scenario): string[] {
  const n = (key: FieldKey): number => parseField(scenario[key]).value
  const warnings: string[] = []
  if (n('impressions') > 0 && n('clicks') > n('impressions')) {
    warnings.push('Clicks are higher than impressions. Check the numbers.')
  }
  if (n('clicks') > 0 && n('conversions') > n('clicks')) {
    warnings.push('Conversions are higher than clicks. Check the numbers.')
  }
  return warnings
}

export function bestReturn(items: readonly Scenario[]): { name: string; roas: number } | null {
  let best: { name: string; roas: number } | null = null
  for (const item of items) {
    const { roas } = calculate(item)
    if (roas !== null && (best === null || roas > best.roas)) best = { name: item.name || 'Untitled', roas }
  }
  return best
}
