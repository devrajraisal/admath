import { describe, expect, it } from 'vitest'
import { bestReturn, calculate, consistencyWarnings, fieldErrors, parseField } from './calc'
import { EXAMPLE_A, EXAMPLE_B, scenario } from './testing'

describe('calculate', () => {
  it('gives the results that can be worked out by hand for example A', () => {
    const m = calculate(scenario(EXAMPLE_A))
    expect(m.ctr).toBeCloseTo(2) // 8,000 / 400,000
    expect(m.cpc).toBeCloseTo(2.5) // 20,000 / 8,000
    expect(m.cpm).toBeCloseTo(50) // 20,000 / 400,000 x 1,000
    expect(m.cvr).toBeCloseTo(3) // 240 / 8,000
    expect(m.cpa).toBeCloseTo(83.3333, 3) // 20,000 / 240
    expect(m.roas).toBeCloseTo(4.8) // 96,000 / 20,000
    expect(m.roi).toBeCloseTo(380) // (96,000 - 20,000) / 20,000
  })

  it('gives the results for example B', () => {
    const m = calculate(scenario(EXAMPLE_B))
    expect(m.ctr).toBeCloseTo(2.6)
    expect(m.cpc).toBeCloseTo(3.0769, 3)
    expect(m.cpm).toBeCloseTo(80)
    expect(m.cvr).toBeCloseTo(2)
    expect(m.cpa).toBeCloseTo(153.846, 2)
    expect(m.roas).toBeCloseTo(2.6)
    expect(m.roi).toBeCloseTo(160)
  })

  it('returns null, never NaN or Infinity, when a denominator is zero', () => {
    const m = calculate(scenario())
    expect(Object.values(m)).toEqual([null, null, null, null, null, null, null])
  })

  it('shows a loss of 100% when money was spent and 0 revenue was entered', () => {
    const m = calculate(scenario({ spend: '500', revenue: '0', conversions: '0' }))
    expect(m.roi).toBe(-100)
    expect(m.roas).toBe(0)
    expect(m.cpa).toBeNull() // no conversions, so there is no cost per conversion
  })

  it('shows a result only when every number it needs was entered', () => {
    expect(Object.values(calculate(scenario({ spend: '1000' })))).toEqual([null, null, null, null, null, null, null])
    const withClicks = calculate(scenario({ spend: '1000', clicks: '500' }))
    expect(withClicks.cpc).toBe(2)
    expect(withClicks.cpa).toBeNull() // conversions not entered
    expect(withClicks.roi).toBeNull() // revenue not entered
  })

  it('does not show CPC as 0 when spend was left empty', () => {
    // Regression test: clicks without spend used to show a CPC of 0, as if the clicks were free.
    expect(calculate(scenario({ clicks: '500' })).cpc).toBeNull()
  })

  it('ignores invalid fields instead of producing wrong numbers', () => {
    const m = calculate(scenario({ spend: '-100', impressions: '1000', clicks: '50' }))
    expect(m.ctr).toBeCloseTo(5)
    expect(m.cpc).toBeNull() // spend is invalid, so it is treated as not entered
  })
})

describe('parseField', () => {
  it('treats an empty box as not entered, without an error', () => {
    expect(parseField('')).toEqual({ value: 0, error: null, entered: false })
    expect(parseField('   ')).toEqual({ value: 0, error: null, entered: false })
  })
  it('counts a typed zero as entered', () => {
    expect(parseField('0')).toEqual({ value: 0, error: null, entered: true })
  })
  it('reads normal numbers, decimals, and exponent notation', () => {
    expect(parseField('1500').value).toBe(1500)
    expect(parseField(' 12.5 ').value).toBe(12.5)
    expect(parseField('1e3').value).toBe(1000)
  })
  it.each(['abc', '12abc', '1,000', 'Infinity', 'NaN'])('rejects %j', (text) => {
    expect(parseField(text).error).toBe('Enter a number.')
  })
  it('rejects negative and absurdly large numbers', () => {
    expect(parseField('-1').error).toBe('Use a number of 0 or more.')
    expect(parseField('1e16').error).toBe('This number is too large.')
  })
})

describe('checks', () => {
  it('names the field that has a problem', () => {
    expect(fieldErrors(scenario({ spend: '-5', clicks: 'x' }))).toEqual({
      spend: 'Ad spend: Use a number of 0 or more.',
      clicks: 'Clicks: Enter a number.',
    })
    expect(fieldErrors(scenario(EXAMPLE_A))).toEqual({})
  })

  it('warns when clicks exceed impressions or conversions exceed clicks', () => {
    expect(consistencyWarnings(scenario({ impressions: '100', clicks: '500' }))).toEqual([
      'Clicks are higher than impressions. Check the numbers.',
    ])
    expect(consistencyWarnings(scenario({ clicks: '10', conversions: '20' }))).toEqual([
      'Conversions are higher than clicks. Check the numbers.',
    ])
    expect(consistencyWarnings(scenario(EXAMPLE_A))).toEqual([])
  })

  it('does not warn when the larger field is simply empty', () => {
    expect(consistencyWarnings(scenario({ clicks: '500' }))).toEqual([])
  })
})

describe('bestReturn', () => {
  it('picks the scenario with the highest ROAS', () => {
    expect(bestReturn([scenario(EXAMPLE_B), scenario(EXAMPLE_A)])).toEqual({ name: 'A', roas: 4.8 })
  })
  it('returns null when no scenario has a ROAS', () => {
    expect(bestReturn([scenario(), scenario()])).toBeNull()
  })
  it('uses a placeholder for an empty name', () => {
    expect(bestReturn([scenario({ ...EXAMPLE_A, name: '' })])?.name).toBe('Untitled')
  })
})
