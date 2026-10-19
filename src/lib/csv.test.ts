import { describe, expect, it } from 'vitest'
import { safeText, toCsv } from './csv'
import { money, percent, times } from './format'
import { EXAMPLE_A, scenario } from './testing'

describe('safeText', () => {
  it.each(['=SUM(A1:A9)', '+1+1', '-2+3', '@cmd', '\tTabbed', '\rReturn'])(
    'adds an apostrophe to %j so it cannot run as a formula',
    (text) => expect(safeText(text)).toBe(`'${text}`),
  )
  it('leaves normal text alone', () => {
    expect(safeText('Eid Offer')).toBe('Eid Offer')
    expect(safeText('')).toBe('')
    expect(safeText('Summer - 2026')).toBe('Summer - 2026')
  })
})

describe('toCsv', () => {
  it('writes a header and one quoted row per scenario', () => {
    const lines = toCsv([scenario(EXAMPLE_A)]).split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toBe('Scenario,Spend,Impressions,Clicks,Conversions,Revenue,CTR %,CPC,CPM,Conv rate %,CPA,ROAS,ROI %')
    expect(lines[1]).toBe('"A","20000","400000","8000","240","96000","2","2.5","50","3","83.33","4.8","380"')
  })

  it('leaves cells empty for results that cannot be worked out', () => {
    const row = toCsv([scenario({ name: 'Empty' })]).split('\n')[1]
    expect(row).toBe('"Empty","","","","","",,,,,,,')
  })

  it('doubles quotation marks inside text', () => {
    expect(toCsv([scenario({ name: 'The "big" one' })])).toContain('"The ""big"" one"')
  })

  it('keeps a formula typed as a name from running in a spreadsheet', () => {
    const row = toCsv([scenario({ name: '=HYPERLINK("http://evil.example","x")' })]).split('\n')[1] ?? ''
    expect(row.startsWith('"\'=HYPERLINK(')).toBe(true)
  })

  it('keeps commas and line breaks inside one cell', () => {
    const csv = toCsv([scenario({ name: 'Sale, spring\nedition' })])
    expect(csv).toContain('"Sale, spring\nedition"')
  })
})

describe('format', () => {
  it('shows a dash for missing values and groups thousands', () => {
    expect(percent(null)).toBe('–')
    expect(times(null)).toBe('–')
    expect(money(null, 'PKR')).toBe('–')
    expect(money(1234.567, 'PKR')).toBe('PKR 1,234.57')
    expect(percent(380)).toBe('380%')
    expect(times(4.8)).toBe('4.8x')
  })
})
