import { describe, expect, it } from 'vitest'
import { loadState, sanitizeState, saveState } from './storage'
import { EXAMPLE_A } from './testing'
import { MAX_SCENARIOS, type AppState } from '../types'

const memory = (initial?: string) => {
  let value = initial ?? null
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => { value = next },
    read: () => value,
  }
}

describe('sanitizeState', () => {
  it.each([null, undefined, 5, 'text', [], {}, { items: [] }, { items: 'nope' }])('falls back to the default for %j', (raw) => {
    const state = sanitizeState(raw)
    expect(state.items).toHaveLength(1)
    expect(state.currency).toBe('PKR')
  })

  it('keeps at most four scenarios', () => {
    const items = Array.from({ length: 9 }, (_, i) => ({ id: `id${i}`, name: `S${i}` }))
    expect(sanitizeState({ items }).items).toHaveLength(MAX_SCENARIOS)
  })

  it('replaces values of the wrong type and cuts text that is too long', () => {
    const state = sanitizeState({ cur: 12345, items: [{ id: 5, name: 7, spend: 100, clicks: 'x'.repeat(100) }] })
    const item = state.items[0]
    expect(state.currency).toBe('PKR')
    expect(item?.name).toBe('Scenario 1')
    expect(item?.spend).toBe('')
    expect(item?.clicks).toHaveLength(20)
    expect(typeof item?.id).toBe('string')
  })

  it('gives repeated ids a new value, so React keys stay unique', () => {
    const state = sanitizeState({ items: [{ id: 'same', name: 'A' }, { id: 'same', name: 'B' }] })
    expect(new Set(state.items.map((i) => i.id)).size).toBe(2)
  })

  it('reads the format saved by the first version of AdMath', () => {
    const legacy = { cur: 'USD', items: [{ id: 1760000000000.123, name: 'Old', spend: '100', impressions: '', clicks: '', conversions: '', revenue: '300' }] }
    const state = sanitizeState(legacy)
    expect(state.currency).toBe('USD')
    expect(state.items[0]).toMatchObject({ name: 'Old', spend: '100', revenue: '300' })
  })
})

describe('loadState and saveState', () => {
  it('returns the default when nothing was saved or the text is broken', () => {
    expect(loadState(memory()).items).toHaveLength(1)
    expect(loadState(memory('{not json')).items).toHaveLength(1)
  })

  it('survives storage that throws', () => {
    const blocked = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('full') } }
    expect(loadState(blocked).items).toHaveLength(1)
    expect(() => saveState({ currency: 'PKR', items: [] }, blocked)).not.toThrow()
  })

  it('restores what was saved', () => {
    const storage = memory()
    const state: AppState = { currency: 'EUR', items: [{ id: 'x1', ...EXAMPLE_A }] }
    saveState(state, storage)
    expect(loadState(storage)).toEqual(state)
  })
})
