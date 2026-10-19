import { FIELD_KEYS, MAX_SCENARIOS, type AppState, type Scenario } from '../types'
import { defaultState, newId } from './scenarios'

const KEY = 'admath.v1'
const text = (value: unknown, max: number): string => (typeof value === 'string' ? value.slice(0, max) : '')

function toScenario(raw: unknown, index: number): Scenario {
  const source = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const scenario: Scenario = {
    id: typeof source.id === 'string' && source.id ? source.id.slice(0, 40) : newId(),
    name: text(source.name, 60) || `Scenario ${index + 1}`,
    spend: '', impressions: '', clicks: '', conversions: '', revenue: '',
  }
  for (const key of FIELD_KEYS) scenario[key] = text(source[key], 20)
  return scenario
}

/** Saved data comes from the browser, so it is checked and cleaned before it is used. */
export function sanitizeState(raw: unknown): AppState {
  if (typeof raw !== 'object' || raw === null) return defaultState()
  const source = raw as Record<string, unknown>
  const items = Array.isArray(source.items) ? source.items.slice(0, MAX_SCENARIOS).map(toScenario) : []
  if (items.length === 0) return defaultState()
  const seen = new Set<string>()
  for (const item of items) {
    // Duplicate ids would break React keys, so repeated ones get a fresh id.
    if (seen.has(item.id)) item.id = newId()
    seen.add(item.id)
  }
  return { currency: text(source.cur ?? source.currency, 4) || 'PKR', items }
}

export function loadState(storage: Pick<Storage, 'getItem'> = window.localStorage): AppState {
  try {
    const saved = storage.getItem(KEY)
    return saved === null ? defaultState() : sanitizeState(JSON.parse(saved))
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState, storage: Pick<Storage, 'setItem'> = window.localStorage): void {
  try {
    storage.setItem(KEY, JSON.stringify({ cur: state.currency, items: state.items }))
  } catch {
    // Storage can be blocked or full. The calculator still works without saving.
  }
}
