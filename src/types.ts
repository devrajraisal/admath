export const FIELD_KEYS = ['spend', 'impressions', 'clicks', 'conversions', 'revenue'] as const
export type FieldKey = (typeof FIELD_KEYS)[number]

export const FIELD_LABELS: Record<FieldKey, string> = {
  spend: 'Ad spend',
  impressions: 'Impressions',
  clicks: 'Clicks',
  conversions: 'Conversions',
  revenue: 'Revenue',
}

/** What the person typed. Numbers stay as text so a half typed value is never lost. */
export interface Scenario extends Record<FieldKey, string> {
  id: string
  name: string
}

export interface AppState {
  currency: string
  items: Scenario[]
}

/** Every metric is null when it cannot be worked out, for example when spend is zero. */
export interface Metrics {
  ctr: number | null
  cpc: number | null
  cpm: number | null
  cvr: number | null
  cpa: number | null
  roas: number | null
  roi: number | null
}

export const MAX_SCENARIOS = 4
