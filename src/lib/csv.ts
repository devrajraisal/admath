import { calculate } from './calc'
import type { Scenario } from '../types'

const HEADER = ['Scenario', 'Spend', 'Impressions', 'Clicks', 'Conversions', 'Revenue', 'CTR %', 'CPC', 'CPM', 'Conv rate %', 'CPA', 'ROAS', 'ROI %']

/**
 * Spreadsheet programs run text that starts with = + - @ as a formula, even inside quotes.
 * A scenario name is typed by the person, so such text gets a leading apostrophe to keep it plain text.
 */
export function safeText(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

const cell = (value: string | number | null): string => {
  if (value === null) return ''
  const text = typeof value === 'number' ? String(Number(value.toFixed(2))) : safeText(value)
  return `"${text.replace(/"/g, '""')}"`
}

export function toCsv(items: readonly Scenario[]): string {
  const rows = items.map((item) => {
    const m = calculate(item)
    return [
      item.name, item.spend, item.impressions, item.clicks, item.conversions, item.revenue,
      m.ctr, m.cpc, m.cpm, m.cvr, m.cpa, m.roas, m.roi,
    ].map(cell).join(',')
  })
  return [HEADER.join(','), ...rows].join('\n')
}

/** Saves the CSV with a byte order mark, so Excel reads non English letters correctly. */
export function downloadCsv(items: readonly Scenario[]): void {
  const url = URL.createObjectURL(new Blob([`\uFEFF${toCsv(items)}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'admath-scenarios.csv'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
