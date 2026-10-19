import { blankScenario } from './scenarios'
import type { Scenario } from '../types'

export const scenario = (values: Partial<Scenario> = {}): Scenario => ({ ...blankScenario(1), ...values })

/** The two sample scenarios from the app, with results that can be checked by hand. */
export const EXAMPLE_A = { name: 'A', spend: '20000', impressions: '400000', clicks: '8000', conversions: '240', revenue: '96000' }
export const EXAMPLE_B = { name: 'B', spend: '20000', impressions: '250000', clicks: '6500', conversions: '130', revenue: '52000' }
