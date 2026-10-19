const group = (value: number): string => value.toLocaleString('en-US', { maximumFractionDigits: 2 })

export const percent = (value: number | null): string => (value === null ? '–' : `${group(value)}%`)
export const times = (value: number | null): string => (value === null ? '–' : `${group(value)}x`)
export const money = (value: number | null, currency: string): string =>
  value === null ? '–' : `${currency} ${group(value)}`
